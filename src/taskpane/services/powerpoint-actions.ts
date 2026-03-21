/* global PowerPoint, Office */
/// <reference types="office-js" />

import { OfficeAction, OfficeContextPayload } from "../types";

export async function getPowerPointContext(): Promise<OfficeContextPayload> {
  // Reading Text in PowerPoint via Office Document APIs (fallback)
  return new Promise((resolve) => {
    Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (asyncResult) => {
      let selectionText = "";
      if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
        selectionText = String(asyncResult.value) || "";
      }
      resolve({
        host: "PowerPoint",
        selectionText,
        documentText:
          "Presentation context (PPT capabilities are more limited for bulk raw text read).",
      });
    });
  });
}

export async function insertTextIntoPowerPoint(text: string): Promise<void> {
  if (!text) return;
  return new Promise((resolve, reject) => {
    Office.context.document.setSelectedDataAsync(
      text,
      { coercionType: Office.CoercionType.Text },
      (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          reject(new Error(asyncResult.error.message));
        } else {
          resolve();
        }
      }
    );
  });
}

export async function applyPowerPointActions(
  actions: OfficeAction[] | undefined,
  fallbackText: string
): Promise<void> {
  if (!Array.isArray(actions) || actions.length === 0) {
    return insertTextIntoPowerPoint(fallbackText);
  }

  // PowerPoint specific capabilities via Office.js are mostly text replacement or new slides.
  // Given PowerPoint.js APIs natively are simpler than Word or Excel:
  let concatenatedText = "";

  for (const action of actions) {
    if (!action || !action.type) continue;
    switch (action.type) {
      case "replace_selection":
      case "insert_at_cursor":
      case "append_to_end":
      case "insert_heading":
        if (action.text) {
          if (action.type === "insert_heading") concatenatedText += `\n# ${action.text}\n`;
          else concatenatedText += action.text;
        }
        break;
      case "insert_bullets":
      case "insert_numbered_list":
        if (Array.isArray(action.items) && action.items.length > 0) {
          const prefix = action.type === "insert_bullets" ? "•" : "1.";
          const values = action.items.map((item) => `${prefix} ${item}`).join("\n");
          concatenatedText += `\n${values}\n`;
        }
        break;
      case "insert_table": {
        const rows = Array.isArray(action.rows) ? action.rows : [];
        const headers = Array.isArray(action.headers) ? action.headers : [];
        const values: string[][] = [];
        if (headers.length > 0) values.push(headers);
        if (rows.length > 0) values.push(...rows);

        if (values.length > 0) {
          const stringified = values.map((row) => row.join("\t")).join("\n");
          concatenatedText += `\n\n${stringified}\n\n`;
        }
        break;
      }
    }
  }

  if (concatenatedText) {
    await insertTextIntoPowerPoint(concatenatedText);
  }
}
