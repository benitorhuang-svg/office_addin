/**
 * StatusBadge - Atomic Design (Atom)
 *
 * Displays a connectivity dot and latency info.
 */
export interface StatusBadgeProps {
  status: "online" | "offline" | "loading";
  latency?: number;
  label?: string;
}

export function createStatusBadge(props: StatusBadgeProps): HTMLElement {
  const container = document.createElement("div");
  container.className = "atm-status-badge";
  container.id = "status-badge";

  const dot = document.createElement("span");
  dot.className = `status-dot ${props.status}`;

  const text = document.createElement("span");
  text.className = "status-text";

  let label = props.label || (props.status === "online" ? "Connected" : "Disconnected");
  if (props.status === "online" && props.latency) {
    label += ` (${props.latency}ms)`;
  }
  text.textContent = label;

  container.appendChild(dot);
  container.appendChild(text);

  return container;
}
