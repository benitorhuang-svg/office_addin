/* global HTMLElement, document */

export interface AccordionProps {
  title: string;
  content: HTMLElement | string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export function createAccordion({
  title,
  content,
  isOpen = false,
  onToggle,
}: AccordionProps): HTMLElement {
  const acc = document.createElement("div");
  acc.className = `group border-b border-slate-100 overflow-hidden transition-all duration-300 ${isOpen ? "is-open" : ""}`;

  const header = document.createElement("div");
  header.className = "flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-slate-50 transition-colors select-none";
  header.innerHTML = `
    <span class="text-sm font-semibold text-slate-700">${title}</span>
    <svg class="w-4 h-4 text-slate-400 transform transition-transform duration-300 group-[.is-open]:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;

  const body = document.createElement("div");
  // Logic-based height handling (Tailwind v4 doesn't have native auto-height transition yet, but we can simulate or use max-height)
  body.className = `overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"}`;
  
  const inner = document.createElement("div");
  inner.className = "px-4";
  
  if (typeof content === "string") {
    inner.innerHTML = content;
  } else {
    inner.appendChild(content);
  }

  body.appendChild(inner);
  acc.appendChild(header);
  acc.appendChild(body);

  header.addEventListener("click", () => {
    const isNowOpen = !acc.classList.contains("is-open");
    acc.classList.toggle("is-open");
    
    // Toggle body visibility via classes
    if (isNowOpen) {
      body.classList.remove("max-h-0", "opacity-0", "py-0");
      body.classList.add("max-h-[500px]", "opacity-100", "py-4");
    } else {
      body.classList.add("max-h-0", "opacity-0", "py-0");
      body.classList.remove("max-h-[500px]", "opacity-100", "py-4");
    }
    
    if (onToggle) onToggle(isNowOpen);
  });

  return acc;
}
