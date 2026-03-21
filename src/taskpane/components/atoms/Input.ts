export interface InputProps {
  id?: string;
  type: string;
  placeholder: string;
  className?: string; // e.g. "atom-input-premium"
}

export function createInput({ id, type, placeholder, className = "atom-input-premium" }: InputProps): HTMLInputElement {
  const input = document.createElement("input");
  if (id) input.id = id;
  input.type = type;
  input.placeholder = placeholder;
  input.className = className;
  return input;
}
