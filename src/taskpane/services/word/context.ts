/* global Word */
import { OfficeContextPayload } from "../atoms/types";

/**
 * Atomic function to extract context from the Word document.
 * Focuses solely on reading selections and full body text.
 */
export async function getWordContext(): Promise<OfficeContextPayload> {
  return Word.run(async (context) => {
    const selection = context.document.getSelection();
    selection.load("text");
    context.document.body.load("text");
    await context.sync();

    return {
      selectionText: (selection.text || "").trim(),
      documentText: (context.document.body.text || "").trim().slice(0, 4000),
    };
  });
}
