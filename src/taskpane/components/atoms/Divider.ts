/* global document, HTMLElement */

export interface DividerProps {
  label?: string;
  className?: string;
}

export function createDivider({ label, className = "" }: DividerProps = {}): HTMLElement {
  const divider = document.createElement("div");
  divider.className = `auth-divider ${className}`.trim();
  
  const span = document.createElement("span");
  if (label) span.textContent = label;
  divider.appendChild(span);
  
  return divider;
}
