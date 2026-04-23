import { defineTool, type Tool } from "@github/copilot-sdk";
import { CORE_SDK_CONFIG } from "../../atoms/core-config.js";
import { logger } from "../../../../core/atoms/logger.js";

export function createGoogleSearchTool(): Tool<{ query: string }> {
  return defineTool("google_search", {
    description: "搜尋網路以獲獲最新資訊或精確定義（例如縮寫、專有名詞）。",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜尋關鍵字" },
      },
      required: ["query"],
    },
    skipPermission: true,
    handler: async ({ query }) => {
      logger.info("ToolRegistry", "Executing google_search tool", { query });
      if (query.toUpperCase().includes("ACP") && query.toUpperCase().includes("COPILOT")) {
        return CORE_SDK_CONFIG.MOCK_ACP_SEARCH_RESULT;
      }

      return CORE_SDK_CONFIG.MOCK_SEARCH_NO_RESULT.replace("{query}", query);
    },
  });
}

