/* global document, HTMLElement */

export interface AuthCardProps {
  badgeLabel?: string;
  badgeClass?: string; // e.g. "github" or "gemini"
  title?: string;
  className?: string; // extra classes
  children?: HTMLElement[];
}

export function createAuthCard({
  badgeLabel,
  badgeClass = "",
  title,
  className = "",
  children = [],
}: AuthCardProps): HTMLElement {
  const card = document.createElement("div");
  card.className = `nexus-auth-card ${className}`.trim();

  const header = document.createElement("div");
  header.className = "nexus-auth-card-header";

  if (badgeLabel) {
    const badge = document.createElement("span");
    badge.className = `nexus-auth-badge ${badgeClass}`;
    badge.textContent = badgeLabel;
    header.appendChild(badge);
  }

  if (title) {
    const h3 = document.createElement("h3");
    h3.textContent = title;
    header.appendChild(h3);
  }

  if (badgeLabel || title) {
    card.appendChild(header);
  }

  // Add children
  children.forEach(child => card.appendChild(child));

  return card;
}
