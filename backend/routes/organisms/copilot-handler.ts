import { Request, Response } from 'express';
import config from '../../config/env.js';
import { CompletionService } from '../../services/copilot/organisms/completion-service.js';
import { ResponseParser } from '../../services/copilot/molecules/response-parser.js';
import { markStart, markEnd } from '../../atoms/latency-tracker.js';
import { createRequestLog, logCompletion } from '../../atoms/request-logger.js';

/**
 * Organism: Copilot Route Handler
 * Manages the high-level request/response cycle for AI tasks.
 */
export const handleCopilotRequest = async (req: Request, res: Response): Promise<void> => {
  console.log(`[API Handler DEBUG] STARTING /api/copilot handler (streaming: ${req.body.stream})`);

  const reqLog = createRequestLog(req);
  const requestId = reqLog.requestId;
  markStart(requestId);
  let firstTokenTracked = false;
  let chunkCount = 0;
  console.log(`[API Handler DEBUG] STARTING /api/copilot handler (streaming: ${req.body.stream})`);
  const { prompt, officeContext, model, stream, authProvider, presetId, systemPrompt } = req.body;
  const geminiKey = (req.headers['x-gemini-key'] as string) || config.GEMINI_API_KEY;
  const streamingRes = res as Response & {
    flush?: () => void;
    flushHeaders?: () => void;
    socket?: { setNoDelay?: (noDelay: boolean) => void };
  };

  try {
    if (stream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      streamingRes.flushHeaders?.();
      streamingRes.socket?.setNoDelay?.(true);

      // Send initial spacer and padding to open the stream and bypass buffering
      res.write(`data: ${JSON.stringify({ text: "" })}\n\n`);
      res.write(': ' + ' '.repeat(256) + '\n\n'); 

      const onChunk = (chunk: string) => {
        if (!firstTokenTracked) {
          markEnd(`${requestId}:first-token`);
          firstTokenTracked = true;
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
        abortController.abort();
        console.log(`[API Handler] Client disconnected (ID: ${requestId}). Aborting upstream AI for efficiency.`);
      };

      req.on('aborted', handleDisconnect);
      res.on('close', handleDisconnect);

      await CompletionService.execute({
        prompt,
        officeContext,
        model,
        presetId,
        stream: true,
        authProvider,
        geminiKey,
        systemPrompt
      }, (chunk: string) => {
        if (!isClientConnected) return; // Drop chunk if client is gone
        onChunk(chunk);
      }, abortController.signal);

      if (isClientConnected) {
        res.write('data: [DONE]\n\n');
        const streamLatency = markEnd(requestId);
        logCompletion(reqLog, { latencyMs: streamLatency, status: 'ok', chunks: chunkCount });
        res.end();
        return;
      } else {
        return; // Signal was aborted, resources handled
      }
    } else {
      // Non-streaming
      const rawText = await CompletionService.execute({
        prompt,
        officeContext,
        model,
        presetId,
        stream: false,
        authProvider,
        geminiKey,
        systemPrompt
      }) as string;

      // Functional Optimization: Parse Word-specific actions via Molecule
      const { cleanText, actions } = ResponseParser.parse(rawText);

      const nonStreamLatency = markEnd(requestId);
      logCompletion(reqLog, { latencyMs: nonStreamLatency, status: 'ok' });
      res.json({ 
        text: cleanText, 
        actions,
        model: model || config.COPILOT_MODEL,
        timestamp: new Date().toISOString(),
        latencyMs: nonStreamLatency
      });
      return;
    }
  } catch (err: unknown) {
    const error = err as Error & { status?: number; detail?: string };
    const isProduction = process.env.NODE_ENV === 'production';
    const detail = isProduction ? 'An internal error occurred' : (error.detail || error.message);
    
    console.error(`[Copilot Handler Error]`, error);
    logCompletion(reqLog, { latencyMs: markEnd(requestId), status: 'error', error: error.message });
    if (!res.headersSent) {
      res.status(error.status || 500).json({ 
        error: 'provider_error', 
        detail: detail 
      });
      return;
    }
    res.write(`data: ${JSON.stringify({ error: 'provider_error', detail: detail })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
};
