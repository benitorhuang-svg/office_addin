/* global window, document, HTMLSelectElement */

import { WritingPreset } from "./types";

export const FALLBACK_PRESETS: WritingPreset[] = [
  {
    id: "general",
    label: "General Writing",
    description:
      "Balanced drafting for normal editing, rewriting, and document assistance. Expands the theme instead of echoing it.",
  },
  {
    id: "meeting-notes",
    label: "Meeting Notes",
    description: "Structured notes with agenda, decisions, owners, and follow-up actions.",
  },
  {
    id: "formal-memo",
    label: "Formal Memo",
    description: "Formal internal document tone with clear purpose, background, and action items.",
  },
  {
    id: "proposal",
    label: "Proposal",
    description: "Persuasive business proposal structure with benefits, scope, and next steps.",
  },
  {
    id: "summary-report",
    label: "Summary Report",
    description: "Executive summary style writing focused on concise findings and recommendations.",
  },
];

export function populatePresetOptions(
  presetSelect: HTMLSelectElement | null,
  presets: WritingPreset[],
  selectedPreset?: string
) {
  if (!presetSelect) return;

  const availablePresets = presets.length > 0 ? presets : FALLBACK_PRESETS;
  const preferredPreset =
    window.localStorage.getItem("selected_preset") || selectedPreset || availablePresets[0].id;

  presetSelect.innerHTML = "";
  availablePresets.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.id;
    option.textContent = preset.label;
    option.title = preset.description;
    if (preset.id === preferredPreset) option.selected = true;
    presetSelect.appendChild(option);
  });
}

export function getSelectedPreset(
  presetSelect: HTMLSelectElement | null,
  presets: WritingPreset[]
) {
  const availablePresets = presets.length > 0 ? presets : FALLBACK_PRESETS;
  if (!presetSelect || !presetSelect.value) {
    return availablePresets[0]?.id || "general";
  }
  return presetSelect.value;
}

export function getPresetDescription(presetId: string, presets: WritingPreset[]) {
  const availablePresets = presets.length > 0 ? presets : FALLBACK_PRESETS;
  const match = availablePresets.find((preset) => preset.id === presetId);
  return match ? match.description : availablePresets[0]?.description || "";
}
