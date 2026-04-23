import config from '@config/env.js';

/**
 * Atom: System Identity Template
 * Combines persona, language, and core behavior into a single system instruction.
 */
export const SYSTEM_IDENTITY_TEMPLATE = (p: { 
  presetSystem: string; 
  languageOverrides?: string; 
  personaOverrides?: string;
}) => {
  const lang = p.languageOverrides || config.DEFAULT_RESPONSE_LANGUAGE;
  const persona = p.personaOverrides || config.DEFAULT_PERSONA;
  
  return [
    `# Role Context`,
    p.presetSystem,
    `# Constraints`,
    `- Output Language: ${lang}`,
    `- Persona Quality: ${persona}`,
    `- Format: Highly professional, Word-compatible structure`
  ].join('\n');
};
