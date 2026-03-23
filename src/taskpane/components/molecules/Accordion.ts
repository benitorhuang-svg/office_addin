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
  acc.className = "mol-accordion";
  if (isOpen) acc.classList.add("open");

  const header = document.createElement("div");
  header.className = "accordion-header";
  header.innerHTML = `
    <span>${title}</span>
    <svg class="accordion-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>
  `;

  const body = document.createElement("div");
  body.className = "accordion-content";
  const inner = document.createElement("div");
  inner.className = "accordion-content-inner";
  
  if (typeof content === "string") {
    inner.innerHTML = content;
  } else {
    inner.appendChild(content);
  }

  body.appendChild(inner);
  acc.appendChild(header);
  acc.appendChild(body);

  header.addEventListener("click", () => {
    const isNowOpen = !acc.classList.contains("open");
    
    // We handle "closing others" at the organism level or passing a handler
    // For now, it just toggles itself
    acc.classList.toggle("open");
    
    if (onToggle) onToggle(isNowOpen);
  });

  return acc;
}
