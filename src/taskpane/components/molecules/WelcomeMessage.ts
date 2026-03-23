export interface WelcomeMessageProps {
  authProvider?: string | null;
}

/**
 * Molecule: Welcome Message
 * Hero component for the initial state of the chat.
 */
export function createWelcomeMessage(props?: WelcomeMessageProps): HTMLElement {
  const container = document.createElement("div");
  container.className = "welcome-message-container";

  const header = document.createElement("h2");
  header.className = "welcome-header";
  header.innerHTML = `<span>我是您的專屬</span> <span style="color: var(--primary-color)">office_Agent</span>`;
  container.appendChild(header);

  const footer = document.createElement("p");
  footer.className = "welcome-footer";
  const provider = props?.authProvider
    ? `目前連線模式：${props.authProvider}`
    : `您可以自由編輯文件區(拖曳左側邊框)。如需使用其他模型，切換至 Copilot 或 Gemini 連線，請點擊右下角 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> 登出按鈕。`;
  footer.innerHTML = provider;
  container.appendChild(footer);

  const capabilities = document.createElement("div");
  capabilities.className = "welcome-capabilities";

  const items = [
    { icon: "📝", text: "撰寫內容" },
    { icon: "💡", text: "提案建議" },
    { icon: "📊", text: "建立表格" },
    { icon: "🎨", text: "格式美化" },
  ];

  items.forEach((item) => {
    const el = document.createElement("div");
    el.className = "capability-item";
    el.innerHTML = `<span style="font-size: 24px;">${item.icon}</span><span>${item.text}</span>`;
    capabilities.appendChild(el);
  });

  container.appendChild(capabilities);


  return container;
}
