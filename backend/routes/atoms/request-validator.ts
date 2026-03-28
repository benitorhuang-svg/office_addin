import { Request, Response, NextFunction } from 'express';
import { logger } from '../../atoms/logger.js';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Atom: Request Validator (Pure Function)
 * Validates the body of an AI request.
 */
export const validateCopilotRequestBody = (body: Record<string, unknown>): ValidationResult => {
    const { messages, prompt, model } = body as { messages?: unknown[]; prompt?: string; model?: string };
    const errors: string[] = [];

    // 1. Mandatory Fields
    if (!messages && !prompt) {
        errors.push('Either "prompt" or "messages" must be provided.');
    }

    // 2. Prompt Length Guard
    const content = messages ? JSON.stringify(messages) : (prompt || '');
    if (content.length > 50000) {
        errors.push(`Input exceeds maximum size of 50,000 characters (Current: ${content.length}).`);
    }

    // 3. Model Integrity
    if (model && typeof model !== 'string') {
        errors.push('Model must be a string if provided.');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Middleware wrapper for validateCopilotRequestBody
 */
export const validateCopilotRequest = (req: Request, res: Response, next: NextFunction) => {
    const result = validateCopilotRequestBody(req.body);
    if (!result.valid) {
        logger.warn('Validator', 'Invalid request blocked', { errors: result.errors });
        res.status(400).json({ 
            error: 'INVALID_REQUEST', 
            detail: result.errors.join('; ') 
        });
        return;
    }
    next();
};
