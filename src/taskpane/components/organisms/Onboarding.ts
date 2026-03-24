/* global document, HTMLElement */

  
import { createButton } from "../atoms/Button";
import { createInput } from "../atoms/Input";
import { createAccordion } from "../molecules/Accordion";


export function createOnboardingOrganism(): HTMLElement {
  const container = document.createElement("div");
  container.className = "min-h-full flex items-center justify-center p-6 animate-in fade-in duration-700";

  const formContainer = document.createElement("div");
  formContainer.className = "w-full max-w-sm glass-card p-8 space-y-8";

  // 1. Branding Header
  const branding = document.createElement("div");
  branding.className = "text-center space-y-2";
  branding.innerHTML = `
    <h1 class="text-3xl font-bold font-outfit bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">office_Agent</h1>
    <p class="text-slate-500 text-sm">Empowering your Word experience with AI</p>
  `;
  formContainer.appendChild(branding);

  // 2. Status Message
  const statusMsg = document.createElement("div");
  statusMsg.id = "apply-status";
  statusMsg.className = "hidden text-xs font-medium text-center py-2 px-3 rounded-lg bg-red-50 text-red-600 animate-pulse";
  formContainer.appendChild(statusMsg);

  // 3. Accordion Group
  const accordionGroup = document.createElement("div");
  accordionGroup.className = "space-y-4";

  // -- Google Gemini Group
  const geminiCliBtn = createButton({ 
    id: "gemini-cli-connect-btn", 
    label: "Connect via local CLI", 
    className: "w-full bg-slate-900 text-white hover:bg-black" 
  });
  const geminiInput = createInput({ id: "gemini-input", type: "password", placeholder: "Paste Gemini API Key here..." });
  const geminiConnectBtn = createButton({ 
    id: "gemini-api-connect-btn", 
    label: "Connect via API Key", 
    className: "w-full bg-blue-600 text-white hover:bg-blue-700" 
  });
  
  const geminiContent = document.createElement("div");
  geminiContent.className = "space-y-4 pt-2";
  geminiContent.appendChild(geminiCliBtn);
  const geminiOr = document.createElement("div");
  geminiOr.className = "flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest before:flex-1 before:h-[1px] before:bg-slate-100 after:flex-1 after:h-[1px] after:bg-slate-100";
  geminiOr.textContent = "OR";
  geminiContent.appendChild(geminiOr);
  geminiContent.appendChild(geminiInput);
  geminiContent.appendChild(geminiConnectBtn);

  // -- GitHub Copilot Group
  const cliBtn = createButton({ id: "cli-connect-btn", label: "Connect via Copilot CLI", className: "w-full bg-slate-900 text-white hover:bg-black" });
  const oauthBtn = createButton({ id: "oauth-login-btn", label: "Sign in with GitHub OAuth", className: "w-full border border-slate-200 text-slate-700 hover:bg-slate-50" });
  const githubBtn = createButton({ id: "pat-connect-btn", label: "Connect via Personal Access Token", className: "w-full bg-blue-600 text-white hover:bg-blue-700" });
  const githubInput = createInput({ id: "pat-input", type: "password", placeholder: "ghp_xxxxxxxxxxxx" });

  const githubContent = document.createElement("div");
  githubContent.className = "space-y-4 pt-2";
  githubContent.appendChild(cliBtn);
  githubContent.appendChild(oauthBtn);
  githubContent.appendChild(githubInput);
  githubContent.appendChild(githubBtn);

  // -- Azure OpenAI Group
  const azureKey = createInput({ id: "azure-key-input", type: "password", placeholder: "Azure OpenAI API Key" });
  const azureEndpoint = createInput({ id: "azure-endpoint-input", type: "text", placeholder: "Resource Endpoint URL" });
  const azureDeploy = createInput({ id: "azure-deployment-input", type: "text", placeholder: "Deployment Name" });
  const azureBtn = createButton({ id: "azure-connect-btn", label: "Connect Azure OpenAI", className: "w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100" });
  
  const azureContent = document.createElement("div");
  azureContent.className = "space-y-3 pt-2";
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
      if (acc !== activeAcc && acc.classList.contains("is-open")) {
        // Trigger the click programmatically or use the logic in Accordion.ts
        // Since we handle toggle inside Accordion, we just force-close others here
        const body = acc.lastElementChild as HTMLElement;
        acc.classList.remove("is-open");
        body.classList.add("max-h-0", "opacity-0", "py-0");
        body.classList.remove("max-h-[500px]", "opacity-100", "py-4");
      }
    });
  };

  accGemini.firstElementChild?.addEventListener("click", () => handleToggle(accGemini));
  accGH.firstElementChild?.addEventListener("click", () => handleToggle(accGH));
  accAzure.firstElementChild?.addEventListener("click", () => handleToggle(accAzure));

  allAcc.forEach(acc => {
    accordionGroup.appendChild(acc);
  });

  formContainer.appendChild(accordionGroup);

  // 4. Skip/Preview Button
  const skipBtn = createButton({
    id: "skip-login-btn",
    label: "Continue to Preview Mode →",
    className: "w-full text-slate-400 hover:text-slate-600 text-xs font-medium uppercase tracking-widest",
  });
  formContainer.appendChild(skipBtn);

  container.appendChild(formContainer);
  return container;
}
