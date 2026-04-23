import { defineTool, type Tool } from "@github/copilot-sdk";
import { CORE_SDK_CONFIG } from "@shared/atoms/ai-core/core-config.js";
import { logger } from "@shared/logger/index.js";

export function createGoogleSearchTool(): Tool<{ query: string }> {
  return defineTool("google_search", {
    description: "搜索網路以獲取最新訊息或精確定義（例如縮寫、專業名詞等）",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜索關鍵字" },
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

