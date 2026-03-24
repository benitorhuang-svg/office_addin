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
  wrapper.className = "flex items-center bg-slate-100 rounded-lg px-2 py-1.5 transition-all hover:bg-slate-200 border border-transparent focus-within:border-blue-500 focus-within:bg-white";

  const select = document.createElement("select");
  select.id = id;
  select.className = "bg-transparent border-none text-[10px] font-bold text-slate-600 focus:outline-none focus:ring-0 uppercase tracking-wider cursor-pointer pr-4 appearance-none appearance-none-none";
  select.setAttribute("aria-label", "Select AI model");
  
  // Custom arrow icon container
  wrapper.classList.add("relative");
  const arrow = document.createElement("div");
  arrow.className = "absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400";
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
