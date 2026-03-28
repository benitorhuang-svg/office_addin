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
  // Matrix Zenith Style: Translucent depth and minimal borders
  acc.className = `nexus-group nexus-border-b nexus-border-white-5 nexus-overflow-hidden nexus-transition-all nexus-duration-500 ${isOpen ? "is-open nexus-bg-white/[0.02]" : ""}`;

  const header = document.createElement("div");
  header.className = "nexus-flex nexus-items-center nexus-justify-between nexus-px-5 nexus-py-4 nexus-cursor-pointer nexus-hover-bg-white/5 nexus-active-bg-white/10 nexus-transition-all nexus-group/hdr";
  header.innerHTML = `
    <span class="nexus-text-11px nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-white nexus-opacity-50 nexus-group-hover:text-blue-400 nexus-group-[.is-open]:text-blue-400 nexus-transition-colors">${title}</span>
    <svg class="nexus-w-3 nexus-h-3 nexus-text-white nexus-opacity-20 nexus-transform nexus-transition-all nexus-duration-500 nexus-group-[.is-open]:rotate-180 nexus-group-hover:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;

  const body = document.createElement("div");
  // Precise Physics: Use dynamic max-height with smooth opacity curve
  body.className = `nexus-overflow-hidden nexus-transition-all nexus-duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? "nexus-max-h-800 nexus-opacity-100 nexus-py-6" : "nexus-max-h-0 nexus-opacity-0 nexus-py-0"}`;
  
  const inner = document.createElement("div");
  inner.className = "nexus-px-5 nexus-animate-in nexus-animate-fade-in nexus-slide-in-from-top-2 nexus-duration-700";
  
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
      body.classList.remove("nexus-max-h-0", "nexus-opacity-0", "nexus-py-0");
      body.classList.add("nexus-max-h-500", "nexus-opacity-100", "nexus-py-4");
    } else {
      body.classList.add("nexus-max-h-0", "nexus-opacity-0", "nexus-py-0");
      body.classList.remove("nexus-max-h-500", "nexus-opacity-100", "nexus-py-4");
    }
    
    if (onToggle) onToggle(isNowOpen);
  });

  return acc;
}
