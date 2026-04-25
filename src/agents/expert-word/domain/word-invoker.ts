import path from "path";
import { fileURLToPath } from "url";
import { invokeWordSkill } from "@infra/services/bridge-client.js";
import { AppError } from "@infra/atoms/app-error.js";
import { logger } from "@shared/logger/index.js";
import type { WordOfficeContext } from "../word.tools.js";

import { OfficeGuard } from "@sdk/governance/guards/office-guard.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type BridgeWordEdit = Record<string, unknown>;
type MutableWordChange = Record<string, unknown>;

const WORD_ACTION_NAME_MAP: Record<string, string> = {
  INSERT_PARAGRAPH: "insert_paragraph",
  INSERT_HEADING: "insert_heading",
  FIND_REPLACE: "find_replace",
  INSERT_LIST: "insert_list",
  INSERT_TABLE: "insert_table",
  ADD_PAGE_BREAK: "add_page_break",
  SET_FONT: "set_font",
  ADD_IMAGE: "add_image",
  GET_METADATA: "get_metadata",
  REPLACE_SECTION: "replace_section",
  APPLY_NAMED_STYLE: "apply_named_style",
  INSERT_OOXML: "insert_ooxml",
};

function requireObject(value: unknown, errorMessage: string): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  throw new Error(errorMessage);
}

function requireString(value: unknown, errorMessage: string): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  throw new Error(errorMessage);
}

function preprocessWordChanges(
  changes: unknown[],
  officeContext?: WordOfficeContext
): MutableWordChange[] {
  return changes.map((rawChange, index) => {
    const change = {
      ...requireObject(rawChange, `Word change at index ${index} must be an object`),
    };
    if (!officeContext) {
      return change;
    }

    // 🟠 Standardized SDK Governance
    if (officeContext.glossary) {
      OfficeGuard.applyGlossary(change, officeContext.glossary);
    }
    if (officeContext.documentOutline) {
      OfficeGuard.validateHierarchy(change, officeContext.documentOutline);
    }
    if (officeContext.protectedRanges?.length) {
      OfficeGuard.enforceProtections(change, officeContext.protectedRanges);
    }

    // Available styles check (Inner word-specific logic)
    const requestedStyle = (change["style"] || change["styleName"]) as string | undefined;
    if (
      requestedStyle &&
      officeContext.availableNamedStyles &&
      !officeContext.availableNamedStyles.includes(requestedStyle)
    ) {
      throw new AppError(`Invalid Style: '${requestedStyle}' not found in template.`, 400);
    }

    return change;
  });
}

function normalizeWordEdit(change: unknown, index: number): BridgeWordEdit {
  const op = requireObject(change, `Word change at index ${index} must be an object`);
  const rawAction =
    op["op"] ??
    op["action"] ??
    (typeof op["type"] === "string" ? (WORD_ACTION_NAME_MAP[op["type"]] ?? op["type"]) : undefined);
  const actionName = requireString(
    rawAction,
    `Word change at index ${index} is missing an action name`
  );

  switch (actionName) {
    case "insert_text":
      return {
        op: "insert_paragraph",
        text: requireString(op["text"], `changes[${index}].text is required`),
        style: op["style"] ?? op["styleName"],
        metadata: op["metadata"],
      };
    case "insert_heading":
      return {
        op: "insert_heading",
        text: requireString(op["text"], `changes[${index}].text is required`),
        level: op["level"] ?? 1,
        metadata: op["metadata"],
      };
    case "insert_paragraph":
      return {
        op: "insert_paragraph",
        text: requireString(op["text"], `changes[${index}].text is required`),
        style: op["style"] ?? op["styleName"],
        metadata: op["metadata"],
      };
    case "find_replace":
      return {
        op: "find_replace",
        find: requireString(op["find"], `changes[${index}].find is required`),
        replace: requireString(op["replace"], `changes[${index}].replace is required`),
        metadata: op["metadata"],
      };
    case "replace_section":
      return {
        op: "replace_section",
        sectionId: requireString(
          op["sectionId"] ?? op["target"],
          `changes[${index}].sectionId is required`
        ),
        text: requireString(op["text"], `changes[${index}].text is required`),
        style: op["style"] ?? op["styleName"],
        metadata: op["metadata"],
      };
    case "set_style":
    case "apply_named_style":
      return {
        op: "apply_named_style",
        style: requireString(op["style"] ?? op["styleName"], `changes[${index}].style is required`),
        range: op["range"],
        target: op["target"] ?? op["text"] ?? op["sectionId"],
        metadata: op["metadata"],
      };
    case "insert_list":
      return {
        op: "insert_list",
        items: op["items"],
        style: op["style"] ?? "List Bullet",
        metadata: op["metadata"],
      };
    case "insert_table":
      return {
        op: "insert_table",
        rows: op["rows"],
        cols: op["cols"],
        data: op["data"],
        style: op["style"],
        metadata: op["metadata"],
      };
    case "add_page_break":
    case "insert_page_break":
      return { op: "add_page_break", metadata: op["metadata"] };
    case "set_font":
      return {
        op: "set_font",
        target: requireString(op["target"] ?? op["text"], `changes[${index}].target is required`),
        font_name: op["font_name"] ?? op["fontName"],
        size_pt: op["size_pt"] ?? op["fontSize"],
        bold: op["bold"],
        metadata: op["metadata"],
      };
    case "add_image":
      return {
        op: "add_image",
        image_path: requireString(
          op["image_path"] ?? op["path"],
          `changes[${index}].image_path is required`
        ),
        width_in: op["width_in"],
        metadata: op["metadata"],
      };
    case "get_metadata":
      return { op: "get_metadata", metadata: op["metadata"] };
    case "insert_ooxml":
    case "insert_ooxml_fragment":
      throw new Error("insert_ooxml is not currently supported by the Word bridge");
    default:
      return {
        op: actionName,
        ...op,
      };
  }
}

export function normalizeWordChanges(changes: unknown[]): BridgeWordEdit[] {
  return changes.map((change, index) => normalizeWordEdit(change, index));
}

function slimOfficeContext(context: WordOfficeContext): Record<string, unknown> {
  const slimmed = { ...context } as Record<string, unknown>;

  // P3 Optimization: Prune overly long outlines to save tokens/bandwidth
  if (
    slimmed.documentOutline &&
    Array.isArray(slimmed.documentOutline) &&
    slimmed.documentOutline.length > 30
  ) {
    logger.info(
      "WordExpertInvoker",
      `Slimming documentOutline from ${slimmed.documentOutline.length} to 30 items.`
    );
    // Keep top level headers (1, 2) or first 30
    const outline = slimmed.documentOutline as Array<{ level: number }>;
    slimmed.documentOutline = outline
      .filter((item) => item.level <= 2 || outline.indexOf(item) < 30)
      .slice(0, 30);
  }

  return slimmed;
}

/**
 * Word Skill Invoker
 * Dispatches AI agent requests to the FastAPI Skill Bridge (HTTP).
 * Eliminates cold-start latency vs. spawning a new Python process per call.
 */
export class WordExpertInvoker {
  /**
   * Invoke the WordExpert skill via the skill bridge HTTP API.
   */
  static async invokeWordExpert(
    inputPath: string,
    outputPath: string,
    changes: unknown[],
    officeContext?: WordOfficeContext
  ): Promise<unknown> {
    const preparedChanges = preprocessWordChanges(changes, officeContext);
    const slimmedContext = officeContext ? slimOfficeContext(officeContext) : undefined;

    try {
      return await invokeWordSkill({
        input_path: inputPath,
        output_path: outputPath,
        edits: normalizeWordChanges(preparedChanges),
        office_context: slimmedContext,
      });
    } catch (err) {
      const error = err as Error;
      logger.error("WordExpertInvoker", "Word bridge execution failed", { error: error.message });
      throw new AppError("WORD_BRIDGE_FAILED", 500, error.message);
    }
  }

  /**
   * Load the expert prompt for Word document operations.
   */
  static getPromptPath(): string {
    return path.join(__dirname, "..", "prompts", "word-expert.md");
  }
}
