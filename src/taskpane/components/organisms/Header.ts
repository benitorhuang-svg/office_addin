import { createModelSelector } from "../molecules/ModelSelector";

export interface HeaderProps {
  brandName: string;
  availableModels: string[];
  selectedModel?: string;
  onModelChange: (model: string) => void;
  onLogout: () => void;
  onNewChat: () => void;
}

export function createHeader({
  brandName,
  availableModels,
  selectedModel,
  onModelChange,
  onLogout,
  onNewChat,
}: HeaderProps) {
  const header = document.createElement("header");
  header.className = "mol-header";

  const top = document.createElement("div");
  top.className = "header-top";

  const actions = document.createElement("div");
  actions.className = "header-actions full-width";

  const selectors = document.createElement("div");
  selectors.className = "selectors-group";

  const modelSelector = createModelSelector({
    id: "model-select",
    models: availableModels,
    selectedModel,
    onChange: onModelChange,
  });

  selectors.appendChild(modelSelector);

  const logoutBtn = document.createElement("button");
  logoutBtn.id = "logout-btn";
  logoutBtn.className = "icon-btn-secondary";
  logoutBtn.title = "Change Account / Log out";
  logoutBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;
  logoutBtn.onclick = onLogout;

  const clearBtn = document.createElement("button");
  clearBtn.id = "clear-btn";
  clearBtn.className = "icon-btn-primary";
  clearBtn.title = "New Chat";
  clearBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
  clearBtn.onclick = onNewChat;

  actions.appendChild(selectors);
  actions.appendChild(logoutBtn);
  actions.appendChild(clearBtn);

  top.appendChild(actions);
  header.appendChild(top);

  return header;
}
