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
    | "reject_tracked_changes";
  text?: string;
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
  authMode?: string;
  model?: string;
  detail?: string;
  error?: string;
};

export type ServerConfig = {
  authMode?: AuthMode;
  model?: string;
  availableModels?: string[];
  writingPresets?: WritingPreset[];
  serverTokenConfigured?: boolean;
};
