/* global document, HTMLInputElement */

export interface InputProps {
  id?: string;
  type: string;
  placeholder: string;
  className?: string; // e.g. "atom-input-premium"
}

export function createInput({
  id,
  type,
  placeholder,
  className = "",
}: InputProps): HTMLInputElement {
  const input = document.createElement("input");
  if (id) input.id = id;
  input.type = type;
  input.placeholder = placeholder;
  input.className = `w-full px-4 py-2.5 bg-white/50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 ${className}`;
  return input;
}
