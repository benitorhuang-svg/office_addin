import { getPresetById } from '../atoms/presets.js';
import { PROFESSIONAL_DRAFT_DIRECTIVE } from '../atoms/prompt-template.js';
import { SYSTEM_IDENTITY_TEMPLATE } from '../atoms/system-identity.js';
import { WORD_ACTION_GUIDE } from '../atoms/word-instructions.js';
import { OfficeContext } from '../atoms/types.js';

/**
 * Organism: Prompt Orchestrator
 * Assembles the final AI payload by combining user input, document context, and presets.
 */
export const PromptOrchestrator = {
  buildWordPrompt(
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
};
