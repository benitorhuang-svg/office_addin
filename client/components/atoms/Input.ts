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
  input.className = `nexus-w-full nexus-px-4 nexus-py-2-5 nexus-bg-white nexus-opacity-50 nexus-border nexus-border-slate-200 nexus-text-slate-900 nexus-rounded-xl focus:nexus-outline-none focus:ring-2 focus:ring-blue-500 nexus-opacity-20 focus:border-blue-500 nexus-transition-all placeholder:nexus-text-slate-400 ${className}`;
  return input;
}
