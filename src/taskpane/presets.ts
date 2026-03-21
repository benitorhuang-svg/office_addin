export type WritingPresetId =
  | "general"
  | "meeting-notes"
  | "formal-memo"
  | "proposal"
  | "summary-report";

export type WritingPreset = {
  id: WritingPresetId;
  label: string;
  description: string;
  systemPrompt: string;
};

export const WRITING_PRESETS: WritingPreset[] = [
  {
    id: "general",
    label: "一般寫作",
    description: "通用寫作與編輯，會根據主題延伸發想，不只重述。",
    systemPrompt:
      "Use a clear, concise tone, avoid merely repeating the user's wording, and expand the theme with original angles and usable copy.",
  },
  {
    id: "meeting-notes",
    label: "會議紀錄",
    description: "議程、決議、待辦事項與負責人。",
    systemPrompt:
      "Format output as meeting minutes with sections for agenda, discussion points, decisions, and action items. Prefer bullet lists and a compact table for owners and deadlines.",
  },
  {
    id: "formal-memo",
    label: "正式公文",
    description: "正式語氣、稱謂、主旨與結語。",
    systemPrompt:
      "Write in formal business Chinese. Use a clear subject line, polite salutation, body paragraphs, and a respectful closing. Keep the layout clean and official.",
  },
  {
    id: "proposal",
    label: "提案書",
    description: "問題、方案、效益、時程與風險。",
    systemPrompt:
      "Structure the response as a proposal with title, executive summary, problem statement, proposed solution, benefits, timeline, risks, and next steps.",
  },
  {
    id: "summary-report",
    label: "報告摘要",
    description: "重點摘要、結論與下一步。",
    systemPrompt:
      "Summarize the content into a concise report summary with key findings, implications, and recommended next actions.",
  },
];

export function getWritingPreset(presetId?: string | null): WritingPreset {
  const normalized = String(presetId || "general").trim() as WritingPresetId;
  return WRITING_PRESETS.find((preset) => preset.id === normalized) || WRITING_PRESETS[0];
}
