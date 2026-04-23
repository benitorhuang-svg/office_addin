import { defineTool, type Tool } from "@github/copilot-sdk";

export function createExcelChartTool(): Tool<{ title: string; chartType: string; range?: string }> {
  return defineTool("create_excel_chart", {
    description: "Generate a professional industrial chart in the active Excel worksheet. Mandatory for all data visualization tasks.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Chart title" },
        chartType: {
          type: "string",
          enum: ["ColumnClustered", "Line", "Pie", "BarClustered"],
          description: "Type of chart",
        },
        range: {
          type: "string",
          description: "Excel range address (e.g. 'A1:B10') or empty for selection.",
        },
      },
      required: ["title", "chartType"],
    },
    skipPermission: true,
    handler: async ({ title, chartType, range }) => {
      return `[DISPATCH]: EXCEL_CHART_INIT | ${title} | ${chartType} | ${range || "AUTO"}`;
    },
  });
}

