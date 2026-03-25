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
    // Smooth batching: 30 chars for better throughput, 15ms delay
    const chunks = text.match(/.{1,30}/g) || [text];
    let accumulated = "";
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        accumulated += chunk;

        await Word.run(async (context) => {
            const currentRange = context.document.getSelection();
            currentRange.insertText(chunk, Word.InsertLocation.end);
            await context.sync();
        });

        if (onUpdate) onUpdate(accumulated);
        
        // Non-blocking wait to keep Office UI responsive
        await new Promise((r) => setTimeout(r, 15)); 
    }
}
