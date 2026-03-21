export interface ModelSelectorProps {
  id: string;
  models: string[];
  selectedModel?: string;
  onChange: (value: string) => void;
}

export function createModelSelector({ id, models, selectedModel, onChange }: ModelSelectorProps): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "selector-pill-mini";

  const select = document.createElement("select");
  select.id = id;
  select.setAttribute("aria-label", "Select model");

  const preferredModel = selectedModel || models[0] || "GPT-5 mini";
  models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    if (model === preferredModel) option.selected = true;
    select.appendChild(option);
  });

  select.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    onChange(target.value);
  });

  wrapper.appendChild(select);
  return wrapper;
}
