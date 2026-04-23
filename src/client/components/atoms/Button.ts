/* global document, HTMLButtonElement */

import { createIcon, type IconName } from "./Icon";

export interface ButtonProps {
  id?: string;
  label?: string;
  icon?: IconName;
  title?: string;
  variant?: "primary" | "zen" | "outline"; 
  className?: string; 
  onClick?: (e: MouseEvent) => void;
  disabled?: boolean;
}

export function createButton({
  id,
  label,
  icon,
  title,
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
}: ButtonProps): HTMLButtonElement {
  const btn = document.createElement("button");
  if (id) btn.id = id;
  if (title) btn.title = title;
  
  const isZen = variant === "zen";
  
  // High-Fidelity Atomic Token Classes
  const baseClasses = "nexus-inline-flex nexus-items-center nexus-justify-center nexus-transition-all nexus-duration-300 nexus-disabled-opacity-50 nexus-disabled-cursor-not-allowed nexus-transform nexus-active-scale-95 nexus-cursor-pointer";
  const variantClasses = isZen 
    ? "nexus-w-10 nexus-h-10 nexus-rounded-full nexus-bg-slate-50 nexus-text-slate-400 nexus-hover-bg-blue-50 nexus-hover-text-blue-600"
    : "nexus-px-5 nexus-py-2-5 nexus-rounded-xl nexus-text-sm nexus-font-semibold";
  
  btn.className = `${baseClasses} ${variantClasses} ${className}`;
  
  if (icon) {
    const iconEl = createIcon({ name: icon, size: isZen ? 22 : 16 });
    iconEl.setAttribute("class", `${label ? "nexus-mr-2" : ""} nexus-opacity-80`);
    btn.appendChild(iconEl);
  }

  if (label) {
    const span = document.createElement("span");
    span.textContent = label;
    btn.appendChild(span);
  }

  btn.disabled = disabled;
  if (onClick) btn.onclick = onClick;
  return btn;
}
