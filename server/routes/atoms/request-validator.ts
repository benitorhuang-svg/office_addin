/**
 * Atom: Request Validator
 * Pure validation function for /api/copilot POST body.
 */

const VALID_AUTH_PROVIDERS = [
  'copilot_cli', 'copilot_pat', 'copilot_oauth',
  'gemini_api', 'gemini_cli',
  'azure_byok', 'github_models', 'preview'
] as const;

const MAX_PROMPT_LENGTH = 50_000;

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateCopilotRequest(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const b = body as Record<string, unknown>;

  // prompt: required string
  if (b.prompt === undefined || b.prompt === null) {
    errors.push('prompt is required');
  } else if (typeof b.prompt !== 'string') {
    errors.push('prompt must be a string');
  } else if (b.prompt.length === 0) {
    errors.push('prompt must not be empty');
  } else if (b.prompt.length > MAX_PROMPT_LENGTH) {
    errors.push(`prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`);
  }

  // authProvider: optional but must be valid enum if provided
  if (b.authProvider !== undefined) {
    if (typeof b.authProvider !== 'string' || !VALID_AUTH_PROVIDERS.includes(b.authProvider as typeof VALID_AUTH_PROVIDERS[number])) {
      errors.push(`authProvider must be one of: ${VALID_AUTH_PROVIDERS.join(', ')}`);
    }
  }

  // model: optional string
  if (b.model !== undefined && typeof b.model !== 'string') {
    errors.push('model must be a string');
  }

  // stream: optional boolean
  if (b.stream !== undefined && typeof b.stream !== 'boolean') {
    errors.push('stream must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}
