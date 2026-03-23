/* global document, HTMLElement */

  
import { createButton } from "../atoms/Button";
import { createInput } from "../atoms/Input";
import { createAccordion } from "../molecules/Accordion";
import { createDivider } from "../atoms/Divider";

export function createOnboardingOrganism(): HTMLElement {
  const container = document.createElement("div");
  container.className = "org-onboarding";

  const formContainer = document.createElement("div");
  formContainer.className = "onboarding-form-container";

  // Status Message (For errors/success)

  // 2. Status Message (For errors/success)
  const statusMsg = document.createElement("div");
  statusMsg.id = "apply-status";
  statusMsg.className = "status-msg";
  formContainer.appendChild(statusMsg);

  // 3. Skip/Preview Button (Modern floating-ish style)
  const skipBtn = createButton({
    id: "skip-login-btn",
    label: "進入預覽模式 →",
    className: "skip-link premium-soft",
  });
  const skipWrapper = document.createElement("div");
  skipWrapper.className = "onboarding-skip-wrapper";
  skipWrapper.appendChild(skipBtn);
  formContainer.appendChild(skipWrapper);

  // 4. Accordion Group
  const accordions: HTMLElement[] = [];
  const accordionGroup = document.createElement("div");
  accordionGroup.className = "onboarding-accordion-group";

  // -- Google Gemini Group
  const geminiCliBtn = createButton({ id: "gemini-cli-connect-btn", label: "Gemini CLI", className: "btn-premium gemini" });
  const geminiInput = createInput({ id: "gemini-input", type: "password", placeholder: "Gemini API Key" });
  const geminiConnectBtn = createButton({ id: "gemini-connect-btn", label: "Gemini API", className: "btn-premium gemini" });
  
  
  
  const geminiContent = document.createElement("div");
  geminiContent.className = "onboarding-auth-group";
  geminiContent.appendChild(createDivider({ label: "方法 1: 本機 CLI 連線" }));
  geminiContent.appendChild(geminiCliBtn);
  geminiContent.appendChild(createDivider({ label: "方法 2: API Key 連線" }));
  geminiContent.appendChild(geminiConnectBtn);
  geminiContent.appendChild(geminiInput);

  // -- GitHub Copilot Group
  const cliBtn = createButton({ id: "cli-connect-btn", label: "Copilot CLI", className: "btn-premium cli-auth" });
  const oauthBtn = createButton({ id: "oauth-login-btn", label: "GitHub OAuth", className: "btn-premium github" });
  const githubBtn = createButton({ id: "pat-connect-btn", label: "GitHub PAT", className: "btn-premium github" });
  const githubInput = createInput({ id: "pat-input", type: "password", placeholder: "ghp_xxxxxxxxxxxx" });

  const githubContent = document.createElement("div");
  githubContent.className = "onboarding-auth-group";
  
  githubContent.appendChild(createDivider({ label: "方法 1: Copilot CLI" }));
  githubContent.appendChild(cliBtn);
  githubContent.appendChild(createDivider({ label: "方法 2: GitHub OAuth" }));
  githubContent.appendChild(oauthBtn);
  githubContent.appendChild(createDivider({ label: "方法 3: GitHub PAT 連線" }));
  githubContent.appendChild(githubBtn);
  githubContent.appendChild(githubInput);

  // -- Azure OpenAI Group
  const azureKey = createInput({ id: "azure-key-input", type: "password", placeholder: "Azure OpenAI API Key" });
  const azureEndpoint = createInput({ id: "azure-endpoint-input", type: "text", placeholder: "https://your-resource.openai.azure.com/" });
  const azureDeploy = createInput({ id: "azure-deployment-input", type: "text", placeholder: "azure-deployment-name" });
  const azureBtn = createButton({ id: "azure-connect-btn", label: "Connect Azure OpenAI", className: "btn-premium azure" });
  
  const azureContent = document.createElement("div");
  azureContent.className = "onboarding-auth-group";
  azureContent.appendChild(azureKey);
  azureContent.appendChild(azureEndpoint);
  azureContent.appendChild(azureDeploy);
  azureContent.appendChild(azureBtn);

  // Assemble accordions
  const accGemini = createAccordion({ title: "Google Gemini", content: geminiContent, isOpen: false });
  const accGH = createAccordion({ title: "GitHub Copilot", content: githubContent, isOpen: false });
  const accAzure = createAccordion({ title: "Azure OpenAI", content: azureContent, isOpen: false });

  const allAcc = [accGemini, accGH, accAzure];
  
  const handleToggle = (activeAcc: HTMLElement) => {
    allAcc.forEach(acc => {
      if (acc !== activeAcc) acc.classList.remove("open");
    });
  };

  accGemini.addEventListener("click", () => handleToggle(accGemini));
  accGH.addEventListener("click", () => handleToggle(accGH));
  accAzure.addEventListener("click", () => handleToggle(accAzure));

  allAcc.forEach(acc => {
    accordionGroup.appendChild(acc);
    accordions.push(acc);
  });

  formContainer.appendChild(accordionGroup);
  container.appendChild(formContainer);

  return container;
}
