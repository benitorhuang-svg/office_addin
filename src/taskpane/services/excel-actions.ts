/* global Excel */
/// <reference types="office-js" />

import { OfficeAction, OfficeContextPayload } from "../types";

export async function getExcelContext(): Promise<OfficeContextPayload> {
  return Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const selection = context.workbook.getSelectedRange();
    selection.load("text");

    // For Excel, we might grab the sheet name or some surrounding context
    sheet.load("name");
    await context.sync();

    // Grab a limited subset of the document text for context (e.g. used range text)
    // To prevent massive data loads, we just pass the sheet name and selection
    return {
      host: "Excel",
      selectionText: (selection.text || [])
        .map((row) => row.join("\t"))
        .join("\n")
        .trim(),
      documentText: `Active Sheet: ${sheet.name}`,
    };
  });
}

export async function insertTextIntoExcel(text: string) {
  if (!text) return;
  await Excel.run(async (context) => {
    const selection = context.workbook.getSelectedRange();
    selection.values = [[text]];
    await context.sync();
  });
}

export async function applyExcelActions(actions: OfficeAction[] | undefined, fallbackText: string) {
  if (!Array.isArray(actions) || actions.length === 0) {
    await insertTextIntoExcel(fallbackText);
    return;
  }

  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const selection = context.workbook.getSelectedRange();
    selection.load("address, rowIndex, columnIndex");
    await context.sync();

    let currentRow = selection.rowIndex;
    const currentCol = selection.columnIndex;

    for (const action of actions) {
      if (!action || !action.type) continue;

      switch (action.type) {
        case "replace_selection":
        case "insert_at_cursor":
        case "append_to_end":
        case "insert_heading":
          if (action.text) {
            sheet.getCell(currentRow, currentCol).values = [[action.text]];
            if (action.type === "insert_heading") {
              sheet.getCell(currentRow, currentCol).format.font.bold = true;
              sheet.getCell(currentRow, currentCol).format.font.size = action.level === 1 ? 16 : 14;
            }
            currentRow++;
          }
          break;
        case "insert_bullets":
        case "insert_numbered_list":
          if (Array.isArray(action.items) && action.items.length > 0) {
            const values = action.items.map((item) => [item]);
            const targetRange = sheet.getRangeByIndexes(currentRow, currentCol, values.length, 1);
            targetRange.values = values;
            currentRow += values.length;
          }
          break;
        case "insert_table": {
          const rows = Array.isArray(action.rows) ? action.rows : [];
          const headers = Array.isArray(action.headers) ? action.headers : [];
          const values: string[][] = [];
          if (headers.length > 0) values.push(headers);
          if (rows.length > 0) values.push(...rows);
          if (values.length === 0) break;

          const columnCount = values.reduce((max, row) => Math.max(max, row.length), 0);
          const normalizedValues = values.map((row) => {
            const cells = row.slice(0, columnCount);
            while (cells.length < columnCount) cells.push("");
            return cells;
          });

          const targetRange = sheet.getRangeByIndexes(
            currentRow,
            currentCol,
            normalizedValues.length,
            columnCount
          );
          targetRange.values = normalizedValues;

          if (headers.length > 0) {
            const headerRange = sheet.getRangeByIndexes(currentRow, currentCol, 1, columnCount);
            headerRange.format.font.bold = true;
          }

          currentRow += normalizedValues.length + 1;
          break;
        }
        case "format_selection": {
          const formatRange = sheet.getRangeByIndexes(
            selection.rowIndex,
            selection.columnIndex,
            1,
            1
          );
          if (typeof action.bold === "boolean") formatRange.format.font.bold = action.bold;
          if (typeof action.italic === "boolean") formatRange.format.font.italic = action.italic;
          if (typeof action.underline === "boolean")
            formatRange.format.font.underline = action.underline ? "Single" : "None";
          if (typeof action.fontSize === "number") formatRange.format.font.size = action.fontSize;
          if (typeof action.fontColor === "string")
            formatRange.format.font.color = action.fontColor;
          if (typeof action.highlightColor === "string")
            formatRange.format.fill.color = action.highlightColor;
          break;
        }
      }
    }
    await context.sync();
  });
}
