export type OfficeContextPayload = {
  host?: "Word" | "Excel" | "PowerPoint";
  selectionText: string;
  documentText: string;
};

export type AuthMode = "pat" | "oauth" | "cli" | "none";

export type WritingPreset = {
  id: string;
  label: string;
  description: string;
};

export type OfficeAction = {
  type:
    | "replace_selection"
    | "insert_at_cursor"
    | "append_to_end"
    | "insert_heading"
    | "insert_bullets"
    | "insert_numbered_list"
    | "insert_table"
    | "format_selection"
    | "insert_page_break"
    | "set_header_footer"
    | "insert_image"
    | "add_comment"
    | "reply_to_comment"
    | "set_change_tracking"
    | "insert_table_of_contents"
    | "insert_page_number"
    | "accept_tracked_changes"
    | "reject_tracked_changes"
    | "replace"
    | "insert";
  text?: string;
  value?: string; // Consistency with server 'value'
  items?: string[];
  headers?: string[];
  rows?: string[][];
  level?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontColor?: string;
  highlightColor?: string;
  fontName?: string;
  alignment?: "left" | "center" | "right" | "justify";
  leftIndent?: number;
  rightIndent?: number;
  firstLineIndent?: number;
  headerText?: string;
  footerText?: string;
  headerFooterType?: "Primary" | "FirstPage" | "EvenPages";
  styleBuiltIn?: string;
  base64Image?: string;
  imageUrl?: string;
  width?: number;
  height?: number;
  commentText?: string;
  replyText?: string;
  changeTrackingMode?: "Off" | "TrackAll" | "TrackMineOnly";
  includePageNumbers?: boolean;
  rightAlignPageNumbers?: boolean;
  useHyperlinksOnWeb?: boolean;
  hidePageNumbersOnWeb?: boolean;
  upperHeadingLevel?: number;
  lowerHeadingLevel?: number;
  pageNumberPosition?: "top" | "bottom" | "current";
};

export type CopilotResponse = {
  text?: string;
  officeActions?: OfficeAction[];
  actions?: { type: string; value: string }[];
  authMode?: string;
  model?: string;
  detail?: string;
  error?: string;
};

export type ServerConfig = {
  COPILOT_MODEL?: string;
  AVAILABLE_MODELS_GEMINI?: string[];
  APP_TITLE?: string;
  FALLBACK_PRESETS?: WritingPreset[];
  PREVIEW_MODE_GUIDE_MD?: string;
  DEFAULT_WORD_FONT_STYLE?: string;
  AUTO_CONNECT_CLI?: boolean;
};

/* global HTMLElement, HTMLTextAreaElement, HTMLButtonElement */
export interface ChatContext {
  historyEl: HTMLElement | null;
  applyStatus: HTMLElement | null;
  promptEl: HTMLTextAreaElement | null;
  sendBtn: HTMLButtonElement | null;
  responseEl: HTMLElement | null;
  runtimeModel: HTMLElement | null;
}

export interface AuthController {
  getAccessToken: () => string | null;
  getGeminiToken: () => string | null;
  getAuthProvider: () => string;
  checkInitialAuth: () => void;
  bindButtons: (els: Record<string, HTMLElement | null>) => void;
  logout: () => void;
}

export interface HeaderProps {
  title?: string;
  authProvider?: string | null;
  online?: boolean;
  onClearChat?: () => void;
}
