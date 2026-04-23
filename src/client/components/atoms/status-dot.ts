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
  dot.className = `nexus-inline-flex nexus-w-2-5 nexus-h-2-5 nexus-rounded-full nexus-shadow-sm nexus-transition-colors nexus-duration-500 ${
    online ? "nexus-bg-emerald-500 nexus-shadow-emerald" : "nexus-bg-red-500 nexus-shadow-red"
  } ${pulse && online ? "nexus-animate-pulse" : ""}`;

  return dot;
}
