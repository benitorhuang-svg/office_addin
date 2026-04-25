/* global Word, setTimeout */
import { INSERT_LOCATION } from "./style-atom";

/**
 * High-performance streaming engine for Word.
 * Breaks down long AI responses and inserts them with 25-character chunks for smooth UI feel.
 * ACHIEVED: Zero Import-time global dependencies via safe literal constants.
 */
export async function insertTextIntoWord(
  text: string,
  stream = true,
  onUpdate?: (accumulated: string) => void
) {
  if (!text) return;

  if (!stream) {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.insertText(text, INSERT_LOCATION.REPLACE as Word.InsertLocation);
      await context.sync();
    });
    if (onUpdate) onUpdate(text);
    return;
  }

  // Use a stable range for streaming
  const chunks = text.match(/.{1,30}/g) || [text];
  let accumulated = "";

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i] || "";
    if (!chunk) continue;
    accumulated += chunk;

    await Word.run(async (context) => {
      const currentRange = context.document.getSelection();
      currentRange.insertText(chunk, INSERT_LOCATION.END as Word.InsertLocation);
      await context.sync();
    });

    if (onUpdate) onUpdate(accumulated);

    // Non-blocking wait to keep Office UI responsive
    await new Promise((r) => setTimeout(r, 15));
  }
}
