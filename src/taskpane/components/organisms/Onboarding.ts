import { createAuthCard } from "../molecules/AuthCard";
import { createButton } from "../atoms/Button";

export function createOnboardingOrganism(): HTMLElement {
  const container = document.createElement("div");
  container.className = "org-onboarding";

  const formContainer = document.createElement("div");
  formContainer.className = "onboarding-form-container";

  // GitHub Auth Card
  const githubCard = createAuthCard({
    idPrefix: "pat",
    badgeLabel: "GitHub Copilot",
    badgeClass: "github",
    title: "",
    placeholder: "ghp_xxxxxxxxxxxx",
    buttonLabel: "Connect with GitHub",
  });

  // Gemini Auth Card
  const geminiCard = createAuthCard({
    idPrefix: "gemini",
    badgeLabel: "Google Gemini",
    badgeClass: "gemini",
    title: "",
    placeholder: "Gemini API Key",
    buttonLabel: "Connect with Gemini",
  });

  const statusMsg = document.createElement("div");
  statusMsg.id = "apply-status";
  statusMsg.className = "status-msg";

  const footer = document.createElement("footer");
  footer.className = "onboarding-footer";

  const skipBtn = createButton({
    id: "skip-login-btn",
    label: "\u9032\u5165\u9810\u89BD\u6A21\u5F0F \u2192",
    className: "skip-link",
  });

  footer.appendChild(skipBtn);

  // Move footer (with skipBtn) to the top as requested
  formContainer.appendChild(footer);
  formContainer.appendChild(githubCard);
  formContainer.appendChild(geminiCard);
  formContainer.appendChild(statusMsg);

  container.appendChild(formContainer);

  return container;
}
