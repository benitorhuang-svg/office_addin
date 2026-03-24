import { defineTool, Tool } from "@github/copilot-sdk";
import { CORE_SDK_CONFIG } from '../atoms/core-config.js';

/**
 * Molecule: Centralized Tool Registry
 * Manages all tool definitions used across SDK sessions.
 * Tools are instantiated once and shared, avoiding redundant allocation per session.
 */

const searchTool: Tool<{ query: string }> = defineTool("google_search", {
  description: "搜尋網路以獲獲最新資訊或精確定義（例如縮寫、專有名詞）。",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "搜尋關鍵字" }
    },
    required: ["query"]
  },
  handler: async ({ query }) => {
    console.log(`${CORE_SDK_CONFIG.MOCK_ACP_SEARCH_RESULT.substring(0, 20)}: ${query}`);
    if (query.toUpperCase().includes("ACP") && query.toUpperCase().includes("COPILOT")) {
      return CORE_SDK_CONFIG.MOCK_ACP_SEARCH_RESULT;
    }
    return CORE_SDK_CONFIG.MOCK_SEARCH_NO_RESULT.replace('{query}', query);
  }
});

/** All tools injected into every SDK session */
export function getSessionTools(): Tool<{ query: string }>[] {
  return [searchTool];
}
