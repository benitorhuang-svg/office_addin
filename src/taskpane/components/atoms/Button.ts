export interface ButtonProps {
  id?: string;
  label: string;
  className?: string; // e.g. "btn-premium github" or "btn-premium gemini"
  onClick?: () => void;
  disabled?: boolean;
}

export function createButton({ id, label, className = "btn-premium", onClick, disabled = false }: ButtonProps): HTMLButtonElement {
  const btn = document.createElement("button");
  if (id) btn.id = id;
  btn.className = className;
  btn.textContent = label;
  btn.disabled = disabled;
  if (onClick) btn.onclick = onClick;
  return btn;
}
