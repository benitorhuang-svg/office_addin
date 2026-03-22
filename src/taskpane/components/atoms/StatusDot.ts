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
  dot.className = "status-dot";
  dot.style.display = "inline-block";
  dot.style.width = "8px";
  dot.style.height = "8px";
  dot.style.borderRadius = "50%";
  dot.style.background = online ? "var(--success)" : "var(--error)";
  dot.style.boxShadow = online 
    ? "0 0 10px rgba(30, 142, 62, 0.4)" 
    : "0 0 10px rgba(217, 48, 37, 0.4)";
  
  if (pulse) {
    dot.style.animation = online ? "pulseLogo 2s infinite ease-in-out" : "none";
  }
  
  return dot;
}
