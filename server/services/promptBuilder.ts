import { FALLBACK_PRESETS, getPresetById } from './copilot/atoms/presets.js';
import { PROFESSIONAL_DRAFT_DIRECTIVE } from './copilot/atoms/prompt-template.js';
import { SYSTEM_IDENTITY_TEMPLATE } from './copilot/atoms/system-identity.js';
import { WORD_ACTION_GUIDE } from './copilot/atoms/word-instructions.js';
import { OfficeContext } from './copilot/atoms/types.js';
import { ResponseParser } from './copilot/molecules/response-parser.js';

/**
 * Organism: Prompt Builder
 * High-level orchestrator for assembling the final AI payload for Word.
 */
export function buildWordPrompt(
  prompt: string, 
  officeContext: OfficeContext, 
  _model: string, 
  presetId: string
) {
  const preset = getPresetById(presetId);
  const userContent = PROFESSIONAL_DRAFT_DIRECTIVE(prompt);

  const system = SYSTEM_IDENTITY_TEMPLATE({
    presetSystem: `${preset.system}\n\n${WORD_ACTION_GUIDE}`
  });

  return {
    system: system,
    user: [
      `### Word Document Context`,
      `Context Data: ${JSON.stringify(officeContext)}`,
      `### User Original Request`,
      userContent
    ].join('\n\n')
  };
}

/**
 * Molecule: Assistant Response Parser
 * Extracts structured actions from the AI's raw text.
 */
export function parseAssistantResponse(text: string, _context: OfficeContext) {
  const { cleanText, actions } = ResponseParser.parse(text);
  return { 
    text: cleanText, 
    actions 
  };
}

export { FALLBACK_PRESETS };
