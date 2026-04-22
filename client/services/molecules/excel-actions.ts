/* global Excel */
/// <reference types="office-js" />

import { OfficeAction, OfficeContextPayload } from "@shared/types";

function getExcelErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function resolveExcelChartType(type: string): Excel.ChartType {
  const chartTypeKey = type as keyof typeof Excel.ChartType;
  return (Excel.ChartType[chartTypeKey] ?? type) as Excel.ChartType;
}

export async function getExcelContext(): Promise<OfficeContextPayload> {
  try {
    return await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const selection = context.workbook.getSelectedRange();
      selection.load("text");
      sheet.load("name");
      await context.sync();

      return {
        host: "Excel",
        selectedText: (selection.text || [])
          .map((row) => row.join("\t"))
          .join("\n")
          .trim(),
        fullBody: `Active Sheet: ${sheet.name}`,
      };
    });
  } catch (error) {
    console.warn("[EXCEL_CONTEXT] Failed to gather context:", error);
    return { selectedText: "", host: "Excel" };
  }
}

export async function insertTextIntoExcel(text: string): Promise<void> {
  if (!text) return;

  console.log(`[Excel Factory V10] Initializing tabular scan on ${text.length} chars...`);

  // Table Detection Logic: Split by newlines then by common delimiters
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  // Detect most frequent delimiter in first 3 lines
  const delimiters = [/\s*\|\s*/, /\t/, /,/];
  let bestDelimiter = delimiters[0];
  let maxCount = -1;

  for (const d of delimiters) {
    const counts = lines.slice(0, 3).map(l => (l.match(new RegExp(d, 'g')) || []).length);
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    if (avg > maxCount) {
      maxCount = avg;
      bestDelimiter = d;
    }
  }

  // If no clear delimiter found (maxCount < 1), treat as single column
  const grid: string[][] = lines.map(line => {
    return maxCount >= 1 ? line.split(bestDelimiter).map(cell => cell.trim()) : [line.trim()];
  });

  if (grid.length === 0) return;

  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const selection = context.workbook.getSelectedRange();
      selection.load("rowIndex, columnIndex");
      await context.sync();

      const rowCount = grid.length;
      const colCount = grid[0].length;

      console.log(`[Excel Factory V10] Mapping ${rowCount}x${colCount} grid to Excel...`);
      const targetRange = sheet.getRangeByIndexes(
        selection.rowIndex,
        selection.columnIndex,
        rowCount,
        colCount
      );

      targetRange.values = grid;
      targetRange.format.autofitColumns();
      await context.sync();
    });
  } catch (error: unknown) {
    console.warn("[Excel Factory V10] Table mapping failed. Falling back to single-cell insertion.", getExcelErrorMessage(error));
    // Absolute fallback: Standard text-in-cell
    await Excel.run(async (context) => {
      const selection = context.workbook.getSelectedRange();
      selection.values = [[text]];
      await context.sync();
    });
  }
}

export async function applyExcelActions(actions: OfficeAction[] | undefined, fallbackText: string) {
  if (!Array.isArray(actions) || actions.length === 0) {
    await insertTextIntoExcel(fallbackText);
    return;
  }

    try {
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
            case "create_chart": {
              const chartTitle = action.title || action.text || "Industrial Analysis";
              const chartType = action.chartType || "ColumnClustered";
              await createExcelChart(chartTitle, chartType, action.range);
              break;
            }
          }
        }
        await context.sync();
      });
    } catch (error) {
       console.error("[EXCEL_ACTIONS] Failed to apply actions:", error);
    }
}

/**
 * Molecule Component: Chart Factory
 * Generates an Excel chart from a specified range.
 */
export async function createExcelChart(title: string, type: string, rangeAddress?: string, index: number = 0): Promise<void> {
    return Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        let targetRange: Excel.Range;

        if (rangeAddress && rangeAddress !== "AUTO") {
            targetRange = sheet.getRange(rangeAddress);
        } else {
            targetRange = context.workbook.getSelectedRange();
        }

        // 1. Add the Chart with 'Auto' positioning
        const chart = sheet.charts.add(resolveExcelChartType(type), targetRange, "Auto");
        
        // 2. Industrial Title Hardening (Encoding Fix & Protocol Stripping)
        let cleanTitle = title.replaceAll("[", "").replaceAll("]", "").replace(/[^\x20-\x7E\s\u4E00-\u9FFF]/g, ""); 
        if (cleanTitle.includes("BRIDGE_DISPATCH")) cleanTitle = cleanTitle.split(":")[0];
        
        chart.title.text = cleanTitle.trim() || `Industrial Analysis ${index + 1}`;
        chart.title.format.font.bold = true;
        chart.title.format.font.size = 14;
        chart.title.format.font.name = "Segoe UI Semibold";

        // 3. Zenith Aesthetic Palette (Professional Industrial Scheme)
        const palette = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6366F1"];
        
        const series = chart.series;
        series.load("items");
        await context.sync();

        for (let i = 0; i < series.items.length; i++) {
            const s = series.items[i];
            s.format.fill.setSolidColor(palette[i % palette.length]);
            if (type === "Line") {
                s.format.line.color = palette[i % palette.length];
                s.format.line.weight = 2;
            }
            s.hasDataLabels = true;
            s.dataLabels.format.font.size = 8;
            s.dataLabels.format.font.color = "#4B5563";
        }

        // 4. Minimalist Grid Architecture & Legend
        chart.axes.valueAxis.majorGridlines.visible = false;
        chart.axes.categoryAxis.format.line.color = "#D1D5DB";
        chart.legend.position = "Bottom";
        chart.legend.format.font.size = 9;
        chart.legend.format.font.name = "Segoe UI";

        // 5. Intelligent Dashboard Stacking (V16)
        chart.width = 450;
        chart.height = 300;
        chart.top = 20 + (index * 320); // Multi-chart vertical stacking
        chart.left = 500; 

        console.log(`%c[Excel Factory] Multi-Chart Stack V16: Component [${index}] Applied to '${cleanTitle}'`, "color: #10b981; font-weight: bold;");
        await context.sync();
    });
}
