/**
 * Molecule: AI Response Parser
 * Extracts structured actions for Word (Office.js) from raw AI text responses.
 * Supported patterns: 
 * 1. <office-action type="replace">CONTENT</office-action>
 * 2. Markdown Code Blocks with specific language 'word-action'
 */
export const ResponseParser = {
  parse(text: string): { cleanText: string; actions: { type: string; value: string }[] } {
    const actions: { type: string; value: string }[] = [];
    let cleanText = text;

    // Pattern 1: XML-like tags <office-action type="...">...</office-action>
    const actionRegex = /<office-action\s+type="([^"]+)">([\s\S]*?)<\/office-action>/gi;
    let match;
    while ((match = actionRegex.exec(text)) !== null) {
      actions.push({
        type: match[1], // e.g., 'replace', 'insert'
        value: match[2].trim()
      });
      // Optional: remove tags from clean text
      cleanText = cleanText.replace(match[0], '').trim();
    }

    // Pattern 2: Markdown code blocks if we decide to formalize it later
    // For now, XML-like tags are more robust for interleaving logic.

    return { cleanText, actions };
  }
};
