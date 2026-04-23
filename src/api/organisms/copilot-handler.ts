import type { Request, Response } from "express";
import { z } from "zod";
import config from "@config/env.js";
import { CompletionService } from "@shared/molecules/ai-core/organisms/completion-service.js";
import { ResponseParser } from "@shared/molecules/ai-core/response-parser.js";
import { markStart, markEnd } from "@infra/atoms/latency-tracker.js";
import { createRequestLog, logCompletion } from "@infra/atoms/request-logger.js";
import { GlobalSystemState } from "@infra/services/molecules/system-state-store.js";
import { NexusSocketRelay } from "@infra/services/molecules/nexus-socket.js";
import { logger } from "@shared/logger/index.js";

// Q1: Request Body Validation Schema
const CopilotRequestSchema = z.object({
  prompt: z.string().min(1).max(10000), // Protect against overly long prompts
  officeContext: z.record(z.string(), z.unknown()).optional(),
  model: z.string().optional(),
  stream: z.boolean().optional().default(false),
  authProvider: z.string().optional(),
  presetId: z.string().optional(),
  systemPrompt: z.string().optional(),
});

/**
 * Organism: Copilot Route Handler
 * Manages the high-level request/response cycle for AI tasks.
 */
export const handleCopilotRequest = async (req: Request, res: Response): Promise<void> => {
  const reqLog = createRequestLog(req, (res.locals as { requestId?: string }).requestId);
  const requestId = reqLog.requestId;
  markStart(requestId);

  // Q1: Validate request body
  const validation = CopilotRequestSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: "invalid_request", detail: validation.error.format() });
    return;
  }

  const { prompt, officeContext, model, stream, authProvider, presetId, systemPrompt } = validation.data;

  // S2: Authorization Pattern (Case-insensitive)
  const authHeader = req.headers["authorization"] as string;
  const bearerMatch = authHeader?.match(/Bearer\s+(.+)/i);
  const bearerToken = bearerMatch ? bearerMatch[1] : null;

  // STRICT VALIDATION: API key MUST come from Authorization header, not environment if provided
  if (!bearerToken) {
    res.status(401).json({ error: "missing_api_key", detail: "Authorization header required" });
    return;
  }
  
  if (!/^[A-Za-z0-9-_.=]+$/.test(bearerToken) || bearerToken.length < 15) {
    res.status(401).json({ error: "invalid_api_key", detail: "Authorization token format is invalid" });
    return;
  }
  
  const geminiKey = bearerToken;

  let firstTokenTracked = false;
  let chunkCount = 0;
  let streamStartMs = 0;
  let totalOutputChars = 0;

  const streamingRes = res as Response & {
    flush?: () => void;
    flushHeaders?: () => void;
    socket?: { setNoDelay?: (noDelay: boolean) => void };
  };

  try {
    // A4: Combined state update
    const setStreamingState = (isStreaming: boolean) => {
      GlobalSystemState.update({ isStreaming });
      NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", GlobalSystemState.getState());
    };

    setStreamingState(true);

    if (stream) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });
      streamingRes.flushHeaders?.();
      streamingRes.socket?.setNoDelay?.(true);

      res.write(`data: ${JSON.stringify({ text: "" })}\n\n`);
      res.write(": " + " ".repeat(256) + "\n\n");
      streamingRes.flush?.();

      const onChunk = (chunk: string) => {
        if (!firstTokenTracked) {
          const ttft = markEnd(`${requestId}:first-token`);
          firstTokenTracked = true;
          streamStartMs = performance.now();
          GlobalSystemState.update({ ttft });
          NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", GlobalSystemState.getState());
        }
        totalOutputChars += chunk.length;
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        streamingRes.flush?.();
        chunkCount++;
      };

      markStart(`${requestId}:first-token`);
      const abortController = new AbortController();
      res.on("close", () => {
        setStreamingState(false);
        abortController.abort();
      });

      await CompletionService.execute(
        {
          prompt,
          officeContext: officeContext ?? {},
          model,
          presetId,
          stream: true,
          authProvider,
          geminiKey,
          systemPrompt,
          sessionId: requestId,
        },
        onChunk,
        abortController.signal
      );

      if (!res.writableEnded) {
        res.write("data: [DONE]\n\n");
        const streamLatency = markEnd(requestId);
        // P2: Refined Token Calculation (CJK aware: char * 1.5)
        // eslint-disable-next-line no-control-regex
        const isCJK = /[^\x00-\x7F]/.test(prompt);
        const tokenWeight = isCJK ? 1.5 : 1.0;
        const elapsedSec = streamStartMs > 0 ? (performance.now() - streamStartMs) / 1000 : 1;
        const estimatedTokens = Math.max(Math.round((totalOutputChars * tokenWeight) / 4), chunkCount);
        const tokensPerSec = elapsedSec > 0 ? Math.round(estimatedTokens / elapsedSec) : 0;
        
        GlobalSystemState.update({ tokensPerSec, activePersona: presetId || "General" });
        NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", GlobalSystemState.getState());
        logCompletion(reqLog, { latencyMs: streamLatency, status: "ok", chunks: chunkCount });
        res.end();
      }
    } else {
      const rawText = (await CompletionService.execute({
        prompt,
        officeContext: officeContext ?? {},
        model,
        presetId,
        stream: false,
        authProvider,
        geminiKey,
        systemPrompt,
      })) as string;

      const { cleanText, actions } = ResponseParser.parse(rawText);
      const nonStreamLatency = markEnd(requestId);
      logCompletion(reqLog, { latencyMs: nonStreamLatency, status: "ok" });
      res.json({
        text: cleanText,
        actions,
        model: model || config.COPILOT_MODEL,
        timestamp: new Date().toISOString(),
        latencyMs: nonStreamLatency,
      });
    }
  } catch (err: unknown) {
    // Q2: Comprehensive Error Handling
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    
    if (isAbort) {
      if (!res.headersSent) res.status(499).end();
      else res.end();
      return;
    }

    const error = err as Error & { status?: number; detail?: string };
    const detail = error.detail || error.message;

    logger.error("CopilotHandler", isTimeout ? "Request timeout" : "Copilot request failed", { requestId, error });
    logCompletion(reqLog, { latencyMs: markEnd(requestId), status: "error", error: error.message });
    
    if (!res.headersSent) {
      res.status(isTimeout ? 504 : (error.status || 500)).json({
        error: isTimeout ? "timeout" : "provider_error",
        detail: detail,
      });
      return;
    }
    res.write(`data: ${JSON.stringify({ error: "provider_error", detail: detail })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  } finally {
    // End stream safely
  }
};
