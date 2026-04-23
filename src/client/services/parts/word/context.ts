/* global Word, Office */
import { OfficeContextPayload } from "../../atoms/types";

/**
 * Atomic function to extract context from the Word document.
 * Focuses solely on reading selections and full body text.
 */
export async function getWordContext(): Promise<OfficeContextPayload> {
  const host = Office.context.host ? String(Office.context.host) : "Web";
  
  return Word.run(async (context) => {
    const selection = context.document.getSelection();
    selection.load("text");
    context.document.body.load("text");
    await context.sync();

    return {
      host: host,
      selectedText: (selection.text || "").trim(),
      fullBody: (context.document.body.text || "").trim().slice(0, 5000),
    };
  });
}
