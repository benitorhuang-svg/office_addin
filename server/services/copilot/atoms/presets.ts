import { WritingPreset } from "../atoms/types.js";

/**
 * Atom: Fallback Writing Presets
 * Core content styles for the server.
 */
export const FALLBACK_PRESETS: WritingPreset[] = [
  {
    id: "general",
    label: "一般寫作",
    description: "通用寫作與編輯，會根據主題延伸發想，不只重述。",
    system: "Use a clear, concise tone, avoid merely repeating the user's wording, and expand the theme with original angles and usable copy.",
  },
  {
    id: "meeting-notes",
    label: "會議紀錄",
    description: "議程、決議、待辦事項與負責人。",
    system: "Format output as meeting minutes with sections for agenda, discussion points, decisions, and action items. Prefer bullet lists and a compact table for owners and deadlines.",
  },
  {
    id: "formal-memo",
    label: "正式公文",
    description: "正式語氣、稱謂、主旨與結語。",
    system: "Write in formal business Chinese. Use a clear subject line, polite salutation, body paragraphs, and a respectful closing. Keep the layout clean and official.",
  },
  {
    id: "proposal",
    label: "提案書",
    description: "問題、方案、效益、時程與風險。",
    system: "Structure the response as a proposal with title, executive summary, problem statement, proposed solution, benefits, timeline, risks, and next steps.",
  },
  {
    id: "summary-report",
    label: "報告摘要",
    description: "重點摘要、結論與下一步。",
    system: "Summarize the content into a concise report summary with key findings, implications, and recommended next actions.",
  },
];

export function getPresetById(id: string): WritingPreset {
  const normalized = String(id || "general").toLowerCase();
  return FALLBACK_PRESETS.find((p) => p.id === normalized) || FALLBACK_PRESETS[0];
}
