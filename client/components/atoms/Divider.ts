/* global document, HTMLElement */

export interface DividerProps {
  label?: string;
  className?: string;
}

/**
 * Atom: Divider
 * A clean, text-inclusive divider for separating authentication methods.
 */
export function createDivider({ label, className = "" }: DividerProps = {}): HTMLElement {
  const divider = document.createElement("div");
  divider.className = `nexus-divider nexus-my-6 nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-slate-300 ${className}`.trim();
  
  if (label) {
    const span = document.createElement("span");
    span.textContent = label;
    divider.appendChild(span);
  }
  
  return divider;
}
