/**
 * Shared: Domain-Specific AI Actions & Contexts
 * Version 4.0 - Industrial Standard
 */

// --- 📊 EXCEL: Schema-First & Pivot Support ---
export type ExcelActionType = 
  | 'SET_FORMULA' 
  | 'SET_VALUE' 
  | 'FORMAT_RANGE' 
  | 'CREATE_PIVOT_TABLE' 
  | 'DEFINE_TABLE_SCHEMA';

export interface ExcelAction {
  type: ExcelActionType;
  range: string;
  value?: any;
  formula?: string;
  format?: {
    bold?: boolean;
    fillColor?: string;
    numberFormat?: string;
    border?: 'all' | 'none';
  };
  pivotConfig?: {
    rows: string[];
    columns: string[];
    values: Array<{ field: string; func: 'SUM' | 'COUNT' | 'AVERAGE' }>;
  };
}

export interface ExcelTableSchema {
  name: string;
  range: string;
  columns: Array<{ name: string; dataType: string; hasValidation: boolean }>;
}

// --- 📝 WORD: Style Anchoring & Section RAG ---
export type WordActionType = 
  | 'INSERT_PARAGRAPH' 
  | 'APPLY_NAMED_STYLE' 
  | 'INSERT_OOXML' 
  | 'REPLACE_SECTION';

export interface WordAction {
  type: WordActionType;
  text?: string;
  styleName?: string; // e.g., "Heading 1", "Nexus-Body"
  ooxml?: string;
  /** P3: Reference to a pre-defined OOXML fragment (e.g., "Legal_Disclaimer_Box") */
  ooxmlFragmentId?: string;
  sectionId?: string;
  /** P2: Optional character range for precise editing */
  range?: { start: number; end: number };
}

// --- 🎨 PPT: Virtual Grid & Brand Tokens ---
export type PPTActionType = 
  | 'ADD_SHAPE' 
  | 'UPDATE_CONTENT' 
  | 'APPLY_LAYOUT' 
  | 'INSERT_IMAGE_PLACEHOLDER';

export interface PPTGridPosition {
  grid: [number, number]; // [0-11, 0-11]
  span: [number, number]; // [1-12, 1-12]
}

export interface PPTAction {
  type: PPTActionType;
  slideIndex: number;
  position?: PPTGridPosition;
  content?: string;
  themeColor?: 'Primary' | 'Secondary' | 'Accent1' | 'Text1';
  style?: Record<string, any>;
  /** P3: Logical grouping label. Shapes with same label will be grouped in PPT. */
  groupLabel?: string;
  /** P4: For generation/variation: request specific style or layout variant */
  variationRequest?: {
    style: 'minimalist' | 'bold' | 'data-heavy';
    layoutPriority: 'text-first' | 'visual-first';
  };
}
