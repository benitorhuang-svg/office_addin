/* global window, document, HTMLSelectElement */
import { WritingPreset } from "./types";

/**
 * Atom: Writing Presets
 * Pre-defined AI instructions for specific document workflows.
 */
export const FALLBACK_PRESETS: WritingPreset[] = [
  {
    id: "general",
    label: "Nexus_Standard",
    description:
      "Balanced drafting and general document assistance. Focused on clarity and structural integrity.",
    prompt:
      "You are the Nexus Industrial AI Assistant. Act as a professional document editor. Refine the provided text for clarity, professional tone, and logical flow. Maintain the original intent while improving vocabulary and syntax.",
  },
  {
    id: "structural_review",
    label: "Structural_QC",
    description:
      "Deep audit of document structure, clarity, and internal consistency. Best for technical specs.",
    prompt:
      "Perform a structural quality control on the text. Ensure consistency in terminology and hierarchical structure. Identify any gaps in logic or missing information in the provided context.",
  },
  {
    id: "executive_brief",
    label: "Executive_Distillation",
    description:
      "Convert complex technical content into high-level business insights for rapid decision making.",
    prompt:
      "Distill the provided content into an executive summary. Focus on key findings, risks, and recommended actions. Use a formal, direct tone suitable for senior stakeholders.",
  },
  {
    id: "meeting_distiller",
    label: "Session_Matrix",
    description:
      "Transforms unstructured notes into a structured meeting matrix with owners and deadlines.",
    prompt:
      "Analyze these meeting notes and generate a structured summary including: Agenda, Decisions, Action Items (with owners), and Next Steps. Extract key dates and milestones mentioned.",
  },
  {
    id: "legal_compliance",
    label: "Legal_Uplink",
    description:
      "Audit for regulatory language, precise definitions, and risk mitigation phrasing.",
    prompt:
      "Review the text from a legal and compliance perspective. Ensure consistent usage of defined terms. Highlight any ambiguous language that might pose a risk to the party issuing the document.",
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
    window.localStorage.getItem("selected_preset") || selectedPreset || availablePresets[0]?.id;

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
    const id =
      window.localStorage.getItem("selected_preset") || availablePresets[0]?.id || "general";
    return availablePresets.find((p) => p.id === id) || availablePresets[0];
  }
  return availablePresets.find((p) => p.id === presetSelect.value) || availablePresets[0];
}

export function getPresetDescription(presetId: string, presets: WritingPreset[]) {
  const availablePresets = presets.length > 0 ? presets : FALLBACK_PRESETS;
  const match = availablePresets.find((preset) => preset.id === presetId);
  return match ? match.description : availablePresets[0]?.description || "";
}
