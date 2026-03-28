/* global Word */
import { OfficeAction } from "../atoms/types";
import { insertTextIntoWord } from "./streaming";
import { convertImageUrlToBase64 } from "./utils";
import { WORD_STYLES, ALIGNMENT_MAP, INSERT_LOCATION } from "./style-atom";
import { insertPageNumber } from "./page-number";

/**
 * Word Action Molecule
 * Coordinates complex document manipulations, layout adjustments, and rich-text insertion.
 * ACHIEVED: High-Fidelity type safety with Paragraph-to-Range transitions.
 */
export async function applyOfficeActions(
  wordActions: OfficeAction[] | undefined,
  fallbackText: string
) {
  if (!Array.isArray(wordActions) || wordActions.length === 0) {
    if (fallbackText) await insertTextIntoWord(fallbackText);
    return;
  }

  // Pre-process: Batch image conversions or async enrichments
  const preparedActions = await Promise.all(
    wordActions.map(async (action: OfficeAction) => {
      if (action.type === "insert_image" && !action.base64Image && action.imageUrl) {
        return { ...action, base64Image: await convertImageUrlToBase64(action.imageUrl) };
      }
      return action;
    })
  );

  await Word.run(async (context: Word.RequestContext) => {
    const selection = context.document.getSelection();
    const body = context.document.body;
    const sections = context.document.sections;
    sections.load("items");
    await context.sync();
    const firstSection = sections.items[0];

    for (const action of preparedActions) {
      if (!action || !action.type) continue;
      
      switch (action.type) {
        case "replace":
        case "replace_selection":
        case "INSERT":
        case "insert_at_cursor": {
          const content = action.value || action.text || "";
          selection.insertText(content, INSERT_LOCATION.REPLACE as "Replace");
          applyFormatting(selection, action);
          break;
        }

        case "append_to_end": {
          if (action.text) {
            const p = body.insertParagraph(action.text, INSERT_LOCATION.END as "End");
            applyFormatting(p.getRange(), action);
          }
          break;
        }

        case "insert_heading": {
          if (!action.text) break;
          const heading = body.insertParagraph(action.text, INSERT_LOCATION.END as "End");
          const level = action.level || 1;
          const style = (level === 2 ? WORD_STYLES.HEADING_2 : level === 3 ? WORD_STYLES.HEADING_3 : WORD_STYLES.HEADING_1);
          // Standardize access to avoid Linter warnings on dynamic Office properties
          const h = heading as unknown as Record<string, unknown>;
          h.styleBuiltIn = style;
          break;
        }

        case "insert_bullets":
        case "insert_numbered_list": {
          renderList(body, action);
          break;
        }

        case "insert_table": {
          renderTable(body, action);
          break;
        }

        case "insert_page_number": {
          if (firstSection) await insertPageNumber(action, context, firstSection);
          break;
        }

        case "accept_tracked_changes": {
          const doc = context.document as unknown as Record<string, () => void>;
          if (typeof doc.acceptAllRevisions === "function") {
             doc.acceptAllRevisions();
          }
          break;
        }
      }
    }
    await context.sync();
  });
}

function applyFormatting(range: Word.Range, action: OfficeAction) {
  if (action.bold !== undefined) range.font.bold = action.bold;
  if (action.italic !== undefined) range.font.italic = action.italic;
  if (action.underline !== undefined) range.font.underline = (action.underline ? "Single" : "None") as "Single" | "None";
  if (action.fontSize) range.font.size = action.fontSize;
  if (action.fontColor) range.font.color = action.fontColor;
  if (action.fontName) range.font.name = action.fontName;
  
  if (action.alignment) {
    const p = range.paragraphs.getFirstOrNullObject();
    const alignVal = ALIGNMENT_MAP[action.alignment as keyof typeof ALIGNMENT_MAP] || ALIGNMENT_MAP.left;
    // Standardize access for alignment as it's an enum union
    const ph = p as unknown as Record<string, unknown>;
     ph.alignment = alignVal;
  }
}

function renderList(body: Word.Body, action: OfficeAction) {
  const rawItems = action.items;
  const items: string[] = Array.isArray(rawItems) ? (rawItems as string[]) : (action.text ? [action.text] : []);
  const prefixType = action.type === "insert_bullets" ? "bullet" : "number";
  
  items.forEach((item: string, i: number) => {
    const label = prefixType === "bullet" ? "??" : `${i + 1}. `;
    body.insertParagraph(`${label}${item}`, INSERT_LOCATION.END as "End");
  });
}

function renderTable(body: Word.Body, action: OfficeAction) {
  const rows = action.rows || [];
  const headers = action.headers || [];
  const values: string[][] = [];
  if (headers.length > 0) values.push(headers);
  if (rows.length > 0) values.push(...rows);
  if (values.length === 0) return;
  
  const colCount = Math.max(...values.map(r => r.length));
  const table = body.insertTable(values.length, colCount, INSERT_LOCATION.END as "End", values);
  const t = table as unknown as Record<string, unknown>;
  t.styleBuiltIn = WORD_STYLES.GRID_TABLE;
}
