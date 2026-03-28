import { createLayoutBox } from "@atoms/LayoutBox";
import { resolveProviderProfile } from "@services/atoms/provider-profiles";
import { NexusProvider } from "@shared/enums";

export interface PromptGroupProps {
  onSend: () => void;
  onStop?: () => void;
  availableModels: string[];
  selectedModel?: string;
  onModelChange: (model: string) => void;
  provider: NexusProvider | null;
  onProviderChange: (p: NexusProvider) => void;
  onLogout: () => void;
  isConnected?: boolean;
  isStandby?: boolean;
  isStreaming?: boolean;
}

/**
 * Molecule: PromptGroup (Ultra-Compact Edition)
 */
export function createPromptGroup({
  onSend,
  onStop,
  availableModels,
  selectedModel,
  onModelChange,
  provider,
  onProviderChange,
  onLogout,
  isConnected = true,
  isStandby = false,
  isStreaming = false
}: PromptGroupProps): HTMLElement {
    
  const createDropdownMenu = (items: {key: string, title: string, sub?: string, isSelected: boolean, onSelect: () => void}[], headerTitle: string) => {
      const menu = createLayoutBox({
          className: "nexus-dropdown-menu",
          children: [
              createLayoutBox({ tag: "div", className: "nexus-text-meta nexus-px-4 nexus-py-2 nexus-text-slate-400", children: [document.createTextNode(headerTitle)] }),
              ...items.map(item => {
                  const div = document.createElement("div");
                  div.className = `nexus-dropdown-item nexus-flex nexus-flex-col ${item.isSelected ? "nexus-selected" : ""}`;
                  div.innerHTML = `<div class="nexus-text-h3 nexus-text-13px">${item.title}</div>${item.sub ? `<div class="nexus-text-meta nexus-text-9px nexus-mt-0-5">${item.sub}</div>` : ""}`;
                  div.onclick = (e) => { e.stopPropagation(); item.onSelect(); menu.style.display = "none"; };
                  return div;
              })
          ]
      });
      return menu;
  };

  const uplinkMenu = createDropdownMenu([
      { key: 'PREVIEW', title: "預覽模式", sub: "本地 CLI 腳本模擬環境", isSelected: provider === NexusProvider.PREVIEW, onSelect: () => onProviderChange(NexusProvider.PREVIEW) },
      { key: 'GEMINI', title: "Gemini 引擎", sub: "Google 全球 AI 算力中心", isSelected: provider === NexusProvider.GEMINI_API, onSelect: () => onProviderChange(NexusProvider.GEMINI_API) },
      { key: 'GITHUB', title: "Github 引擎", sub: "GitHub Copilot 企業級核心", isSelected: provider === NexusProvider.COPILOT_PAT, onSelect: () => onProviderChange(NexusProvider.COPILOT_PAT) }
  ], "切換通訊鏈路");

  const profile = resolveProviderProfile(provider);
  const providerLabel = profile.pillLabel;
  const pillClass = `nexus-pill-${profile.pillVariant}`;

  const isLive = provider === NexusProvider.COPILOT_PAT || provider === NexusProvider.GEMINI_API;
  
  const uplinkPill = createLayoutBox({
      className: `nexus-pill ${isLive ? 'nexus-pill-live' : pillClass}`,
      children: [
          document.createTextNode(providerLabel), 
          (() => {
              const span = document.createElement("span");
              span.className = "nexus-opacity-40 nexus-ml-1";
              span.innerHTML = `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
              return span;
          })()
      ]
  });
  uplinkPill.onclick = (e) => { e.stopPropagation(); modelMenu.style.display = "none"; uplinkMenu.style.display = uplinkMenu.style.display === "block" ? "none" : "block"; };

  // Dynamic Model Selection & Menu
  const modelMenuItems = [
      ...availableModels.map(m => ({
          key: m,
          title: m.toUpperCase(),
          isSelected: m === selectedModel,
          onSelect: () => onModelChange(m)
      })),
      { key: 'LOGOUT', title: "👋 登出系統", isSelected: false, onSelect: () => onLogout() }
  ];

  const modelMenu = createDropdownMenu(modelMenuItems, isLive ? "切換 AI 模型" : "管理與登出");

    const modelLabel = isLive && selectedModel ? selectedModel.toUpperCase() : "模型選擇";
    const modelPill = createLayoutBox({
        className: `nexus-pill nexus-pill-model ${isLive ? 'nexus-pill-active-model' : ''}`,
        children: [
            document.createTextNode(modelLabel), 
            (() => {
                const span = document.createElement("span");
                span.className = "nexus-opacity-40 nexus-ml-1.5";
                span.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
                return span;
            })()
        ]
    });
    modelPill.onclick = (e) => { e.stopPropagation(); uplinkMenu.style.display = "none"; modelMenu.style.display = modelMenu.style.display === "block" ? "none" : "block"; };

    const textarea = document.createElement("textarea");
    textarea.id = "chat-input";
    textarea.className = "nexus-prompt-textarea";
    textarea.placeholder = "請在此輸入對話內容";
    textarea.rows = 1;
    
    const isActivelyActive = isConnected && !isStandby;
    textarea.disabled = !isActivelyActive;
    if (!isActivelyActive) {
        textarea.className += " nexus-opacity-50";
        textarea.placeholder = isStandby ? "系統已進入待機..." : "鏈路未接通...";
    }

    textarea.oninput = () => { textarea.style.height = "auto"; textarea.style.height = textarea.scrollHeight + "px"; };
    textarea.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && isActivelyActive && !isStreaming) { e.preventDefault(); onSend(); } });

    const actionBtn = document.createElement("button");
    actionBtn.id = "send-btn";
    actionBtn.className = `nexus-action-btn ${isStreaming ? "nexus-action-btn-stop" : isActivelyActive ? "nexus-action-btn-send" : "nexus-action-btn-disabled"}`;
    actionBtn.innerHTML = isStreaming 
       ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect width="14" height="14" x="5" y="5" rx="2"/></svg>`
       : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 1.5px;"><path d="M5 3l14 9-14 9V3z"/></svg>`;
    
    if (isStreaming) { actionBtn.onclick = (e) => { e.stopPropagation(); onStop?.(); }; } 
    else if (isActivelyActive) { actionBtn.onclick = (e) => { e.stopPropagation(); onSend(); }; }

    const footer = createLayoutBox({
        className: "nexus-prompt-footer nexus-flex nexus-items-center nexus-justify-between",
        children: [
            createLayoutBox({ 
                className: "nexus-flex nexus-items-center nexus-gap-2.5", 
                children: [
                    createLayoutBox({ style: "position:relative", children: [uplinkPill, uplinkMenu] }),
                    createLayoutBox({ style: "position:relative", children: [modelPill, modelMenu] })
                ] 
            }), 
            actionBtn
        ]
    });

    return createLayoutBox({
        tag: "section",
        className: "nexus-prompt-container",
        children: [textarea, footer]
    });
}
