/* global document, HTMLElement, HTMLSelectElement */

export interface ModelSelectorProps {
  id: string;
  models: string[];
  selectedModel?: string;
  onChange: (value: string) => void;
}

export function createModelSelector({
  id,
  models,
  selectedModel,
  onChange,
}: ModelSelectorProps): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "selector-pill-mini";

  const select = document.createElement("select");
  select.id = id;
  select.className = "atom-model-select";
  select.setAttribute("aria-label", "Select AI model");

  // Handle empty or missing model list gracefully
  if (!models || models.length === 0) {
    const emptyOption = document.createElement("option");
    emptyOption.textContent = "No models available";
    emptyOption.disabled = true;
    select.appendChild(emptyOption);
    select.disabled = true;
  } else {
    // Determine the initially selected model correctly
    const preferredModel = selectedModel || models[0];
    
    models.forEach((model) => {
      const option = document.createElement("option");
      option.value = model;
      option.textContent = model;
      if (model === preferredModel) option.selected = true;
      select.appendChild(option);
    });
  }

  select.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    if (target.value) onChange(target.value);
  });

  wrapper.appendChild(select);
  return wrapper;
}
