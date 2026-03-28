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
  wrapper.className = "nexus-flex nexus-items-center nexus-bg-slate-100 nexus-rounded-lg nexus-px-2 nexus-py-1-5 nexus-transition-all nexus-hover-bg-slate-200 nexus-border nexus-border-transparent nexus-focus-within-border-blue-500 nexus-focus-within-nexus-bg-white";

  const select = document.createElement("select");
  select.id = id;
  select.className = "nexus-bg-transparent nexus-border-none nexus-text-tiny nexus-font-bold nexus-text-slate-600 nexus-focus-outline-none nexus-focus-ring-0 nexus-uppercase nexus-tracking-widest nexus-cursor-pointer nexus-pr-4 nexus-appearance-none";
  select.setAttribute("aria-label", "Select AI model");
  
  // Custom arrow icon container
  wrapper.classList.add("nexus-relative");
  const arrow = document.createElement("div");
  arrow.className = "nexus-absolute nexus-right-2 nexus-top-1-2 nexus--translate-y-1-2 nexus-pointer-events-none nexus-text-slate-400";
  arrow.innerHTML = `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

  if (!models || models.length === 0) {
    const emptyOption = document.createElement("option");
    emptyOption.textContent = "No Models";
    emptyOption.disabled = true;
    select.appendChild(emptyOption);
    select.disabled = true;
  } else {
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
  wrapper.appendChild(arrow);
  return wrapper;
}
