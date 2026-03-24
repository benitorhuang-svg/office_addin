import { Request, Response } from 'express';
import config from '../../config/env.js';
import { CompletionService } from '../../services/copilot/organisms/completion-service.js';
import { ResponseParser } from '../../services/copilot/molecules/response-parser.js';

/**
 * Organism: Copilot Route Handler
 * Manages the high-level request/response cycle for AI tasks.
 */
export const handleCopilotRequest = async (req: Request, res: Response) => {
  console.log(`[API Handler DEBUG] STARTING /api/copilot handler (streaming: ${req.body.stream})`);
  const { prompt, officeContext, model, stream, authProvider, presetId } = req.body;
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
      res.write('data: {"text": ""}\n\n');
      res.write(': ' + ' '.repeat(2048) + '\n\n'); // SSE comment padding

      const onChunk = (chunk: string) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        streamingRes.flush?.();
      };

      await CompletionService.execute({
        prompt,
        officeContext,
        model,
        presetId,
        stream: true,
        authProvider,
        geminiKey
      }, onChunk);

      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      // Non-streaming
      const rawText = await CompletionService.execute({
        prompt,
        officeContext,
        model,
        presetId,
        stream: false,
        authProvider,
        geminiKey
      }) as string;

      // Functional Optimization: Parse Word-specific actions via Molecule
      const { cleanText, actions } = ResponseParser.parse(rawText);

      return res.json({ 
        text: cleanText, 
        actions,
        model: model || config.COPILOT_MODEL,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err: unknown) {
    const error = err as Error & { status?: number; detail?: string }; // Cast for access but handle correctly
    console.error(`[Copilot Handler Error]`, error);
    if (!res.headersSent) {
      return res.status(error.status || 500).json({ 
        error: 'provider_error', 
        detail: error.detail || error.message 
      });
    }
    res.write(`data: ${JSON.stringify({ error: 'provider_error', detail: error.message })}\n\n`);
    res.end();
  }
};
