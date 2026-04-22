import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../atoms/logger.js';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

const MAX_INPUT_CHARS = 50_000;

type MessageLike = {
    role?: unknown;
    content?: unknown;
    text?: unknown;
};

type OfficeContextLike = {
    host?: unknown;
    selectionText?: unknown;
    documentText?: unknown;
};

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

const countText = (value: unknown): number => (typeof value === 'string' ? value.trim().length : 0);

function validateOfficeContext(context: unknown, errors: string[]): number {
    if (context === undefined || context === null) {
        return 0;
    }

    if (typeof context !== 'object' || Array.isArray(context)) {
        errors.push('officeContext must be an object when provided.');
        return 0;
    }

    const officeContext = context as OfficeContextLike;
    let length = 0;

    for (const key of ['host', 'selectionText', 'documentText'] as const) {
        const value = officeContext[key];
        if (value !== undefined && typeof value !== 'string') {
            errors.push(`officeContext.${key} must be a string when provided.`);
            continue;
        }
        length += countText(value);
    }

    return length;
}

function validateMessages(messages: unknown, errors: string[]): number {
    if (messages === undefined || messages === null) {
        return 0;
    }

    if (!Array.isArray(messages)) {
        errors.push('messages must be an array when provided.');
        return 0;
    }

    if (messages.length === 0) {
        errors.push('messages cannot be an empty array.');
        return 0;
    }

    let totalLength = 0;
    messages.forEach((message, index) => {
        if (!message || typeof message !== 'object' || Array.isArray(message)) {
            errors.push(`Message ${index + 1} must be an object.`);
            return;
        }

        const item = message as MessageLike;
        const role = item.role;
        const content = typeof item.content === 'string' ? item.content : item.text;

        if (role !== undefined && typeof role !== 'string') {
            errors.push(`Message ${index + 1} role must be a string when provided.`);
        }

        if (!isNonEmptyString(content)) {
            errors.push(`Message ${index + 1} content must be a non-empty string.`);
            return;
        }

        totalLength += content.trim().length;
    });

    return totalLength;
}

/**
 * Atom: Request Validator (Pure Function)
 * Validates the body of an AI request.
 */
export const validateCopilotRequestBody = (body: Record<string, unknown>): ValidationResult => {
    const errors: string[] = [];
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const systemPrompt = typeof body.systemPrompt === 'string' ? body.systemPrompt.trim() : '';
    const messagesLength = validateMessages(body.messages, errors);
    const officeContextLength = validateOfficeContext(body.officeContext, errors);

    // 1. Mandatory Fields
    if (!prompt && !Array.isArray(body.messages)) {
        errors.push('Either "prompt" or "messages" must be provided.');
    }

    if (body.prompt !== undefined && !isNonEmptyString(body.prompt)) {
        errors.push('Prompt must be a non-empty string.');
    }

    if (body.model !== undefined && !isNonEmptyString(body.model)) {
        errors.push('Model must be a non-empty string when provided.');
    }

    if (body.presetId !== undefined && !isNonEmptyString(body.presetId)) {
        errors.push('presetId must be a non-empty string when provided.');
    }

    if (body.authProvider !== undefined && !isNonEmptyString(body.authProvider)) {
        errors.push('authProvider must be a non-empty string when provided.');
    }

    if (body.stream !== undefined && typeof body.stream !== 'boolean') {
        errors.push('stream must be a boolean when provided.');
    }

    if (body.systemPrompt !== undefined && !isNonEmptyString(body.systemPrompt)) {
        errors.push('systemPrompt must be a non-empty string when provided.');
    }

    const contentLength = prompt.length + systemPrompt.length + messagesLength + officeContextLength;
    if (contentLength > MAX_INPUT_CHARS) {
        errors.push(`Input exceeds maximum size of ${MAX_INPUT_CHARS.toLocaleString()} characters (Current: ${contentLength.toLocaleString()}).`);
    }

    if (body.model !== undefined && typeof body.model !== 'string') {
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
