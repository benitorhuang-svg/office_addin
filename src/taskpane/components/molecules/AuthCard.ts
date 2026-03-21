/* global document, HTMLElement */

import { createButton } from "../atoms/Button";
import { createInput } from "../atoms/Input";

export interface OnboardingCardProps {
  idPrefix: string;
  badgeLabel: string;
  badgeClass: string; // e.g. "github" or "gemini"
  title: string;
  placeholder: string;
  buttonLabel: string;
}

export function createAuthCard({
  idPrefix,
  badgeLabel,
  badgeClass,
  title,
  placeholder,
  buttonLabel,
}: OnboardingCardProps): HTMLElement {
  const card = document.createElement("div");
  card.className = "auth-card";

  const header = document.createElement("div");
  header.className = "auth-card-header";

  const badge = document.createElement("span");
  badge.className = `auth-badge ${badgeClass}`;
  badge.textContent = badgeLabel;

  header.appendChild(badge);

  if (title) {
    const h3 = document.createElement("h3");
    h3.textContent = title;
    header.appendChild(h3);
  }

  const input = createInput({
    id: `${idPrefix}-input`,
    type: "password",
    placeholder,
  });

  const btn = createButton({
    id: `${idPrefix}-connect-btn`,
    label: buttonLabel,
    className: `btn-premium ${badgeClass}`,
  });

  card.appendChild(header);
  card.appendChild(input);
  card.appendChild(btn);

  return card;
}
