/**
 * Atoms: API Interface Types
 * Defines JSON structures for backend communication.
 */

export interface OfficeAction {
  type: string;
  value?: string;
  text?: string;
  level?: number;
  items?: string[];
  rows?: string[][];
  headers?: string[];
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontColor?: string;
  highlightColor?: string;
  fontName?: string;
  alignment?: "left" | "center" | "right" | "justify";
  pageNumberPosition?: "top" | "bottom" | "current";
  base64Image?: string;
  imageUrl?: string;
}

export interface CopilotResponse {
  text: string;
  actions: OfficeAction[];
  model?: string;
}

export interface WritingPreset {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

export interface ServerConfig {
  models: string[];
  presets: WritingPreset[];
}

export interface OfficeContextPayload {
  host: string | null;
  selection: string | null;
  fullBody?: string;
  platform?: string;
  documentId?: string;
}
