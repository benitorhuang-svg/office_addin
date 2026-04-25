import path from "path";
import { fileURLToPath } from "url";
import { invokePPTSkill } from "@infra/services/bridge-client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type BridgePPTChange = Record<string, unknown>;

const PPT_ACTION_NAME_MAP: Record<string, string> = {
  ADD_SHAPE: "add_shape",
  UPDATE_CONTENT: "insert_text",
  APPLY_LAYOUT: "apply_layout",
  INSERT_IMAGE_PLACEHOLDER: "insert_image_placeholder",
  ADD_SLIDE: "add_slide",
  ADD_TITLE_SLIDE: "add_title_slide",
  INSERT_TEXT: "insert_text",
  SET_FONT: "set_font",
  ADD_IMAGE: "add_image",
  SET_BACKGROUND_COLOR: "set_background_color",
  SET_SLIDE_NOTES: "set_slide_notes",
  GET_METADATA: "get_metadata",
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

function getSlideIndex(op: Record<string, unknown>, index: number, fallback = 0): number {
  const slideIndex = op["slide_index"] ?? op["slideIndex"] ?? fallback;
  if (typeof slideIndex !== "number" || Number.isNaN(slideIndex)) {
    throw new Error(`changes[${index}].slide_index must be a number`);
  }
  return slideIndex;
}

function normalizePPTChange(change: unknown, index: number): BridgePPTChange {
  const op = requireObject(change, `PPT change at index ${index} must be an object`);
  const rawAction =
    op["op"] ??
    op["action"] ??
    (typeof op["type"] === "string" ? (PPT_ACTION_NAME_MAP[op["type"]] ?? op["type"]) : undefined);
  const actionName = requireString(
    rawAction,
    `PPT change at index ${index} is missing an action name`
  );

  switch (actionName) {
    case "add_title_slide":
      return {
        op: "add_title_slide",
        title: op["title"],
        subtitle: op["subtitle"],
        metadata: op["metadata"],
      };
    case "add_slide":
      return {
        op: "add_slide",
        title: op["title"],
        body: op["body"] ?? op["content"] ?? op["text"],
        layout_index: op["layout_index"],
        font_size_pt: op["font_size_pt"] ?? op["fontSize"],
        metadata: op["metadata"],
      };
    case "add_shape":
      return {
        op: "add_shape",
        slide_index: getSlideIndex(op, index),
        shape_type:
          op["shape_type"] ??
          op["shapeType"] ??
          (typeof op["style"] === "string" ? op["style"] : "rectangle"),
        text: op["text"] ?? op["content"],
        left: op["left"],
        top: op["top"],
        width: op["width"],
        height: op["height"],
        fill_color: op["fill_color"] ?? op["hex_color"] ?? op["themeColor"],
        font_size_pt: op["font_size_pt"] ?? op["fontSize"],
        metadata: op["metadata"],
      };
    case "insert_text":
      return {
        op: "insert_text",
        slide_index: getSlideIndex(op, index),
        shape_name: requireString(
          op["shape_name"] ?? op["shapeName"],
          `changes[${index}].shape_name is required`
        ),
        text: requireString(op["text"] ?? op["content"], `changes[${index}].text is required`),
        metadata: op["metadata"],
      };
    case "set_font":
      return {
        op: "set_font",
        slide_index: getSlideIndex(op, index),
        shape_name: requireString(
          op["shape_name"] ?? op["shapeName"],
          `changes[${index}].shape_name is required`
        ),
        size_pt: op["size_pt"] ?? op["font_size_pt"] ?? op["fontSize"],
        bold: op["bold"],
        color: op["color"] ?? op["themeColor"],
        metadata: op["metadata"],
      };
    case "add_image":
      return {
        op: "add_image",
        slide_index: getSlideIndex(op, index),
        image_path: requireString(
          op["image_path"] ?? op["path"],
          `changes[${index}].image_path is required`
        ),
        left_in: op["left_in"],
        top_in: op["top_in"],
        width_in: op["width_in"],
        left: op["left"],
        top: op["top"],
        width: op["width"],
        height: op["height"],
        metadata: op["metadata"],
      };
    case "set_background_color":
      return {
        op: "set_background_color",
        slide_index: getSlideIndex(op, index),
        hex_color: op["hex_color"] ?? op["themeColor"],
        metadata: op["metadata"],
      };
    case "set_slide_notes":
      return {
        op: "set_slide_notes",
        slide_index: getSlideIndex(op, index),
        notes: op["notes"] ?? op["text"],
        metadata: op["metadata"],
      };
    case "get_metadata":
      return { op: "get_metadata", metadata: op["metadata"] };
    case "apply_layout":
    case "insert_image_placeholder":
      throw new Error(`${actionName} is not currently supported by the PPT bridge`);
    default:
      throw new Error(`Unsupported PPT action: ${actionName}`);
  }
}

export function normalizePPTChanges(changes: unknown[]): BridgePPTChange[] {
  return changes.map((change, index) => normalizePPTChange(change, index));
}

/**
 * PPT Skill Invoker
 * Dispatches AI agent requests to the FastAPI Skill Bridge (HTTP).
 * Eliminates cold-start latency vs. spawning a new Python process per call.
 */
export class PPTExpertInvoker {
  /**
   * Invoke the PPTExpert skill via the skill bridge HTTP API.
   */
  static async invokePPTExpert(
    inputPath: string,
    outputPath: string,
    changes: unknown[],
    officeContext?: unknown
  ): Promise<unknown> {
    return invokePPTSkill({
      input_path: inputPath,
      output_path: outputPath,
      slides: normalizePPTChanges(changes),
      office_context:
        officeContext && typeof officeContext === "object"
          ? (officeContext as Record<string, unknown>)
          : undefined,
    });
  }

  /**
   * Load the expert prompt for PPT design operations.
   */
  static getPromptPath(): string {
    return path.join(__dirname, "..", "prompts", "ppt-master.md");
  }
}
