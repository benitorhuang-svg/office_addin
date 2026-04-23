import { defineTool, type Tool } from "@github/copilot-sdk";
import type { OfficeContext } from "../../atoms/types.js";
import { loadPrompt } from "./prompt-loader.js";
import { createSuccessToolResult } from "./tool-result.js";
import { isHostCompatible, mergeOfficeContext } from "./office-context.js";

export interface OfficeSkillArgs {
  query: string;
  host?: string;
  selectionText?: string;
  documentText?: string;
  includePrompt?: boolean;
}

export interface OfficeSkillDefinition {
  name: string;
  description: string;
  domain: "word" | "excel" | "powerpoint";
  skillName: string;
  category: string;
  recommendedHost: "Word" | "Excel" | "PowerPoint";
  promptPath: string;
  usageHints: string[];
}

export function createOfficeSkillTool(
  definition: OfficeSkillDefinition,
  sessionOfficeContext?: OfficeContext,
): Tool<OfficeSkillArgs> {
  return defineTool<OfficeSkillArgs>(definition.name, {
    description: definition.description,
    skipPermission: true,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The user intent or task to solve in the Office host.",
        },
        host: {
          type: "string",
          description: "Optional host override such as Word, Excel, or PowerPoint.",
        },
        selectionText: {
          type: "string",
          description: "Optional selection text override when the active selection changed.",
        },
        documentText: {
          type: "string",
          description: "Optional document body or surrounding content override.",
        },
        includePrompt: {
          type: "boolean",
          description: "When false, omit the full expert prompt from the tool response.",
          default: true,
        },
      },
      required: ["query"],
    },
    handler: async ({ query, host, selectionText, documentText, includePrompt = true }) => {
      const officeContext = mergeOfficeContext(sessionOfficeContext, {
        host,
        selectionText,
        documentText,
      });
      const prompt = includePrompt ? await loadPrompt(definition.promptPath) : "";

      return createSuccessToolResult({
        status: "office_skill_ready",
        domain: definition.domain,
        skill: definition.skillName,
        category: definition.category,
        query,
        officeContext: {
          host: officeContext.host,
          hostCompatible: isHostCompatible(definition.recommendedHost, officeContext.host),
          hasSelection: officeContext.hasSelection,
          hasDocument: officeContext.hasDocument,
          selectionPreview: officeContext.selectionPreview,
          documentPreview: officeContext.documentPreview,
        },
        recommendedHost: definition.recommendedHost,
        promptAvailable: includePrompt,
        prompt: includePrompt ? prompt : undefined,
        usageHints: definition.usageHints,
      });
    },
  });
}

