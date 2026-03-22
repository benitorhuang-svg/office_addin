/* global document, HTMLElement */

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

  // Gemini Auth Card (API)
  const geminiCard = createAuthCard({
    idPrefix: "gemini",
    badgeLabel: "Google Gemini",
    badgeClass: "gemini",
    title: "",
    placeholder: "Gemini API Key",
    buttonLabel: "Connect with Gemini API",
  });

  // Add methods labels and divider to Gemini card to make it premium
  const method1 = document.createElement("div");
  method1.className = "method-label";
  method1.innerText = "方法 1: 透過 API Key 連線";
  geminiCard.insertBefore(method1, geminiCard.querySelector('input'));

  const divider = document.createElement("div");
  divider.className = "auth-divider";
  divider.innerHTML = "<span>或</span>";
  geminiCard.appendChild(divider);

  const method2 = document.createElement("div");
  method2.className = "method-label";
  method2.innerText = "方法 2: 連線至本機 Gemini CLI";
  geminiCard.appendChild(method2);

  // Add Gemini CLI button to the card
  const geminiCliBtn = createButton({
    id: "gemini-cli-connect-btn",
    label: "Local Gemini CLI Session",
    className: "btn-premium gemini",
  });
  geminiCard.appendChild(geminiCliBtn);

  const statusMsg = document.createElement("div");
  statusMsg.id = "apply-status";
  statusMsg.className = "status-msg";

  const footer = document.createElement("footer");
  footer.className = "onboarding-footer";

  const cliBtn = createButton({
    id: "cli-connect-btn",
    label: "Connect Copilot CLI",
    className: "btn-premium cli-auth",
  });

  const skipBtn = createButton({
    id: "skip-login-btn",
    label: "進入預覽模式 →",
    className: "skip-link",
  });

  const oauthBtn = createButton({
    id: "oauth-login-btn",
    label: "GitHub OAuth 登入 (推薦)",
    className: "btn-premium github", // Used "btn-premium github" to inherit the black premium UI style
  });

  // footer now only contains skipBtn (placed at the top)
  footer.appendChild(skipBtn);

  // Layout: Moving Status at top, then skip-footer
  formContainer.appendChild(statusMsg);
  formContainer.appendChild(footer); // "進入預覽模式" at the top

  // New GitHub OAuth wrapper
  const oauthWrapper = document.createElement("div");
  oauthWrapper.className = "oauth-wrapper";
  oauthWrapper.style.textAlign = "center";
  oauthWrapper.appendChild(oauthBtn); // removed margin so it sits nicely in accordion

  const accordions: HTMLElement[] = [];
  const createAccordion = (title: string, content: HTMLElement, isOpen: boolean = false) => {
    const acc = document.createElement("div");
    acc.className = "mol-accordion";
    if (isOpen) acc.classList.add("open");

    const header = document.createElement("div");
    header.className = "accordion-header";
    header.innerHTML = `
      <span>${title}</span>
      <svg class="accordion-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
      </svg>
    `;

    const body = document.createElement("div");
    body.className = "accordion-content";
    const inner = document.createElement("div");
    inner.className = "accordion-content-inner";
    inner.appendChild(content);

    body.appendChild(inner);
    acc.appendChild(header);
    acc.appendChild(body);

    header.addEventListener("click", () => {
      const isCurrentlyOpen = acc.classList.contains("open");

      // Close all other accordions
      accordions.forEach((a) => a.classList.remove("open"));

      // Toggle current one
      if (!isCurrentlyOpen) {
        acc.classList.add("open");
      }
    });

    accordions.push(acc);
    return acc;
  };

  // Build the 4 requested Accordion groups
  const accordionGroup = document.createElement("div");
  accordionGroup.style.marginTop = "0px"; // Removed margin to minimize whitespace under preview btn

  accordionGroup.appendChild(createAccordion("Google Gemini", geminiCard, true));
  accordionGroup.appendChild(createAccordion("GitHub OAuth (推薦)", oauthWrapper, false));
  accordionGroup.appendChild(createAccordion("GitHub Copilot", githubCard, false));
  accordionGroup.appendChild(createAccordion("Connect Copilot CLI", cliBtn, false));

  formContainer.appendChild(accordionGroup);

  container.appendChild(formContainer);

  return container;
}
