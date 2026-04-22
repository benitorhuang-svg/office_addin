import { getPresetById } from '../atoms/presets.js';
import { PROFESSIONAL_DRAFT_DIRECTIVE } from '../atoms/prompt-template.js';
import { SYSTEM_IDENTITY_TEMPLATE } from '../atoms/system-identity.js';
import { WORD_ACTION_GUIDE } from '../atoms/word-instructions.js';
import type { OfficeContext } from '../atoms/types.js';

/**
 * Organism: Prompt Orchestrator
 * Assembles the final AI payload by combining user input, document context, and presets.
 * UPGRADED: Supports dynamic system prompt injection from front-end organisms.
 */
export const PromptOrchestrator = {
  buildWordPrompt(
    prompt: string, 
    officeContext: OfficeContext, 
    _model: string, 
    presetId: string,
    systemPromptOverride?: string
  ) {
    const preset = getPresetById(presetId);
    const userContent = PROFESSIONAL_DRAFT_DIRECTIVE(prompt);

    let system = SYSTEM_IDENTITY_TEMPLATE({
      presetSystem: `${preset.system}\n\n${WORD_ACTION_GUIDE}`
    });

    // High-fidelity: Dynamically append front-end specific protocols (like the PPT Designer Protocol)
    if (systemPromptOverride) {
      system += `\n\n[INJECTED_PROTOCOL]\n${systemPromptOverride}`;
    }

    return {
      system: system,
      user: [
        `### Office Workspace Context`,
        `Host: ${officeContext.host || 'Word'}`,
        `Context Data: ${JSON.stringify(officeContext)}`,
        `### User Original Request`,
        userContent
      ].join('\n\n')
    };
  }
};
