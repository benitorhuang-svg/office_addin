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
  divider.className = `flex items-center gap-3 w-full my-6 text-[10px] font-bold uppercase tracking-widest text-slate-300 before:flex-1 before:h-[1px] before:bg-slate-100 after:flex-1 after:h-[1px] after:bg-slate-100 ${className}`.trim();
  
  if (label) {
    const span = document.createElement("span");
    span.textContent = label;
    divider.appendChild(span);
  }
  
  return divider;
}
