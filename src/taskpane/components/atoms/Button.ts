/* global document, HTMLButtonElement */

export interface ButtonProps {
  id?: string;
  label: string;
  className?: string; // e.g. "btn-premium github" or "btn-premium gemini"
  onClick?: () => void;
  disabled?: boolean;
}

export function createButton({
  id,
  label,
  className = "",
  onClick,
  disabled = false,
}: ButtonProps): HTMLButtonElement {
  const btn = document.createElement("button");
  if (id) btn.id = id;
  
  // Base Premium Styles + Custom className
  btn.className = `inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 ${className}`;
  
  btn.textContent = label;
  btn.disabled = disabled;
  if (onClick) btn.onclick = onClick;
  return btn;
}
