import type { ToolResultObject } from "@github/copilot-sdk";

export function createSuccessToolResult(payload: unknown): ToolResultObject {
  return {
    resultType: "success",
    textResultForLlm: JSON.stringify(payload, null, 2),
  };
}

