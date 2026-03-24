export interface StatusDotProps {
  online: boolean;
  pulse?: boolean;
}

/**
 * Atom: Status Dot
 * A simple indicator of connectivity.
 */
export function createStatusDot({ online, pulse = true }: StatusDotProps): HTMLElement {
  const dot = document.createElement("span");
  dot.className = `inline-flex w-2.5 h-2.5 rounded-full shadow-sm transition-colors duration-500 ${
    online ? "bg-emerald-500 shadow-emerald-500/20" : "bg-red-500 shadow-red-500/20"
  } ${pulse && online ? "animate-pulse" : ""}`;

  return dot;
}
