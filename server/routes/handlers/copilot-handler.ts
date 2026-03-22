import { Request, Response } from 'express';
import config from '../../config/env.js';
import { CompletionService } from '../../services/copilot/organisms/completion-service.js';
import { parseAssistantResponse } from '../../services/promptBuilder.js';

/**
 * Organism: Copilot Route Handler
 * Manages the high-level request/response cycle for AI tasks.
 */
export const handleCopilotRequest = async (req: Request, res: Response) => {
  const { prompt, officeContext, model, stream, authProvider } = req.body;
  const geminiKey = (req.headers['x-gemini-key'] as string) || config.GEMINI_API_KEY;

  try {
    if (stream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      const onChunk = (chunk: string) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      };

      await CompletionService.execute({
        prompt,
        officeContext,
        model,
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
        stream: false,
        authProvider,
        geminiKey
      }) as string;

      // Functional Optimization: Parse Word-specific actions
      const { text, actions } = parseAssistantResponse(rawText, officeContext);

      return res.json({ 
        text, 
        actions,
        model: model || config.COPILOT_MODEL,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err: unknown) {
    const error = err as any; // Cast for access but handle correctly
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
