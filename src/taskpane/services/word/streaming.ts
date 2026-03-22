/* global Word, setTimeout */

/**
 * High-performance streaming engine for Word.
 * Breaks down long AI responses and inserts them with 25-character chunks for smooth UI feel.
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
      selection.insertText(text, Word.InsertLocation.replace);
      await context.sync();
    });
    if (onUpdate) onUpdate(text);
    return;
  }

  // Use a stable range for streaming
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    range.insertText("", Word.InsertLocation.replace); // Clear selection first
    await context.sync();

    // Chunk size 25 for smoother writing throughput
    const chunks = text.match(/.{1,25}/g) || [text];
    let accumulated = "";

    for (const chunk of chunks) {
      accumulated += chunk;
      range.insertText(chunk, Word.InsertLocation.end);

      if (onUpdate) onUpdate(accumulated);
      await new Promise((r) => setTimeout(r, 20));
    }

    await context.sync();
  });
}
