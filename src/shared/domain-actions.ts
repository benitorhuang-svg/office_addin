/**
 * Shared: Domain-Specific AI Actions & Contexts
 * Version 4.0 - Industrial Standard
 */

// --- 📊 EXCEL: Schema-First & Pivot Support ---
export type ExcelActionType =
  | "SET_FORMULA"
  | "SET_VALUE"
  | "FORMAT_RANGE"
  | "CREATE_PIVOT_TABLE"
  | "DEFINE_TABLE_SCHEMA";

export interface ExcelAction {
  type: ExcelActionType;
  range: string;
  value?: unknown;
  formula?: string;
  format?: {
    bold?: boolean;
    fillColor?: string;
    numberFormat?: string;
    border?: "all" | "none";
  };
  pivotConfig?: {
    rows: string[];
    columns: string[];
    values: Array<{ field: string; func: "SUM" | "COUNT" | "AVERAGE" }>;
  };
}

export interface ExcelTableSchema {
  name: string;
  range: string;
  columns: Array<{ name: string; dataType: string; hasValidation: boolean }>;
}

// --- 📝 WORD: Style Anchoring & Section RAG ---
export type WordActionType =
  | "INSERT_PARAGRAPH"
  | "APPLY_NAMED_STYLE"
  | "INSERT_OOXML"
  | "REPLACE_SECTION"
  | "INSERT_HEADING"
  | "FIND_REPLACE"
  | "INSERT_LIST"
  | "INSERT_TABLE"
  | "ADD_PAGE_BREAK"
  | "SET_FONT"
  | "ADD_IMAGE"
  | "GET_METADATA";

export interface WordAction {
  type: WordActionType;
  op?: string;
  action?: string;
  text?: string;
  styleName?: string; // e.g., "Heading 1", "Nexus-Body"
  style?: string;
  ooxml?: string;
  /** P3: Reference to a pre-defined OOXML fragment (e.g., "Legal_Disclaimer_Box") */
  ooxmlFragmentId?: string;
  sectionId?: string;
  level?: number;
  find?: string;
  replace?: string;
  items?: string[];
  rows?: number;
  cols?: number;
  data?: Array<Array<string | number>>;
  target?: string;
  font_name?: string;
  size_pt?: number;
  bold?: boolean;
  image_path?: string;
  width_in?: number;
  /** P2: Optional character range for precise editing */
  range?: { start: number; end: number } | string;
}

// --- 🎨 PPT: Virtual Grid & Brand Tokens ---
export type PPTActionType =
  | "ADD_SHAPE"
  | "UPDATE_CONTENT"
  | "APPLY_LAYOUT"
  | "INSERT_IMAGE_PLACEHOLDER"
  | "ADD_SLIDE"
  | "ADD_TITLE_SLIDE"
  | "INSERT_TEXT"
  | "SET_FONT"
  | "ADD_IMAGE"
  | "SET_BACKGROUND_COLOR"
  | "SET_SLIDE_NOTES"
  | "GET_METADATA";

export interface PPTGridPosition {
  grid: [number, number]; // [0-11, 0-11]
  span: [number, number]; // [1-12, 1-12]
}

export interface PPTAction {
  type: PPTActionType;
  op?: string;
  action?: string;
  slideIndex?: number;
  slide_index?: number;
  position?: PPTGridPosition;
  content?: string;
  text?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  shape_name?: string;
  shapeName?: string;
  image_path?: string;
  path?: string;
  font_size_pt?: number;
  fontSize?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  left_in?: number;
  top_in?: number;
  width_in?: number;
  layout_index?: number;
  hex_color?: string;
  notes?: string;
  color?: string;
  bold?: boolean;
  shapeType?: string;
  themeColor?: "Primary" | "Secondary" | "Accent1" | "Text1";
  style?: Record<string, unknown> | string;
  /** P3: Logical grouping label. Shapes with same label will be grouped in PPT. */
  groupLabel?: string;
  /** P4: For generation/variation: request specific style or layout variant */
  variationRequest?: {
    style: "minimalist" | "bold" | "data-heavy";
    layoutPriority: "text-first" | "visual-first";
  };
}
