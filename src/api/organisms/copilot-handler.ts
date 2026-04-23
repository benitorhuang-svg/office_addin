import type { Request, Response } from "express";
import config from "@config/env.js";
import { CompletionService } from "@shared/molecules/ai-core/organisms/completion-service.js";
import { ResponseParser } from "@shared/molecules/ai-core/response-parser.js";
import { markStart, markEnd } from "@infra/atoms/latency-tracker.js";
import { createRequestLog, logCompletion } from "@infra/atoms/request-logger.js";
import { GlobalSystemState } from "@infra/services/molecules/system-state-store.js";
import { NexusSocketRelay } from "@infra/services/molecules/nexus-socket.js";
import { logger } from "@shared/logger/index.js";

/**
 * Organism: Copilot Route Handler
 * Manages the high-level request/response cycle for AI tasks.
 */
export const handleCopilotRequest = async (req: Request, res: Response): Promise<void> => {
  const reqLog = createRequestLog(req, (res.locals as { requestId?: string }).requestId);
  const requestId = reqLog.requestId;
  markStart(requestId);
  let firstTokenTracked = false;
  let chunkCount = 0;
  let streamStartMs = 0;
  const { prompt, officeContext, model, stream, authProvider, presetId, systemPrompt } = req.body;

  // 🟠 5. Standard Authorization Pattern
  const authHeader = req.headers["authorization"] as string;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const geminiKey = bearerToken || config.GEMINI_API_KEY;
  const streamingRes = res as Response & {
    flush?: () => void;
    flushHeaders?: () => void;
    socket?: { setNoDelay?: (noDelay: boolean) => void };
  };

  try {
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

      // Send initial spacer and padding to open the stream and bypass buffering
      res.write(`data: ${JSON.stringify({ text: "" })}\n\n`);
      res.write(": " + " ".repeat(256) + "\n\n");

      const onChunk = (chunk: string) => {
        if (!firstTokenTracked) {
          const ttft = markEnd(`${requestId}:first-token`);
          firstTokenTracked = true;
          streamStartMs = performance.now();
          GlobalSystemState.update({ ttft });
          NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", GlobalSystemState.getState());
        }
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        streamingRes.flush?.();
        chunkCount++;
      };

      markStart(`${requestId}:first-token`);
      const abortController = new AbortController();
      let isClientConnected = true;
      const handleDisconnect = () => {
        if (!isClientConnected || res.writableEnded) return;
        isClientConnected = false;
        setStreamingState(false);
        abortController.abort();
        logger.info("CopilotHandler", "Client disconnected during stream; aborting upstream turn", {
          requestId,
        });
      };

      // Node 18+: req.on('aborted') is deprecated. Use res.on('close') as the single disconnect signal.
      res.on("close", handleDisconnect);

      await CompletionService.execute(
        {
          prompt,
          officeContext,
          model,
          presetId,
          stream: true,
          authProvider,
          geminiKey,
          systemPrompt,
          sessionId: requestId, // Pass requestId as sessionId
        },
        (chunk: string) => {
          if (!isClientConnected) return; // Drop chunk if client is gone
          onChunk(chunk);
        },
        abortController.signal
      );

      if (isClientConnected) {
        res.write("data: [DONE]\n\n");
        const streamLatency = markEnd(requestId);
        // Compute tokens/sec: rough approximation (4 chars per token)
        const elapsedSec = streamStartMs > 0 ? (performance.now() - streamStartMs) / 1000 : 1;
        const estimatedTokens = Math.round(chunkCount * 8); // avg chunk ??8 tokens
        const tokensPerSec = elapsedSec > 0 ? Math.round(estimatedTokens / elapsedSec) : 0;
        GlobalSystemState.update({ tokensPerSec, activePersona: presetId || "General" });
        NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", GlobalSystemState.getState());
        logCompletion(reqLog, { latencyMs: streamLatency, status: "ok", chunks: chunkCount });
        res.end();
        return;
      } else {
        return; // Signal was aborted, resources handled
      }
    } else {
      // Non-streaming
      const rawText = (await CompletionService.execute({
        prompt,
        officeContext,
        model,
        presetId,
        stream: false,
        authProvider,
        geminiKey,
        systemPrompt,
      })) as string;

      // Functional Optimization: Parse Word-specific actions via Molecule
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
      return;
    }
  } catch (err: unknown) {
    // Client disconnected mid-stream ??not an error, just close cleanly.
    if (err instanceof DOMException && err.name === "AbortError") {
      if (!res.headersSent) res.status(499).end();
      else res.end();
      return;
    }

    const error = err as Error & { status?: number; detail?: string };
    const detail = error.detail || error.message;

    logger.error("CopilotHandler", "Copilot request failed", { requestId, error });
    logCompletion(reqLog, { latencyMs: markEnd(requestId), status: "error", error: error.message });
    if (!res.headersSent) {
      res.status(error.status || 500).json({
        error: "provider_error",
        detail: detail,
      });
      return;
    }
    res.write(`data: ${JSON.stringify({ error: "provider_error", detail: detail })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  } finally {
    GlobalSystemState.update({ isStreaming: false });
    NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", GlobalSystemState.getState());
  }
};
