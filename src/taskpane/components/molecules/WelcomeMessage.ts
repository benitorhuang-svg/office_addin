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

  const capabilities = document.createElement("div");
  capabilities.className = "welcome-capabilities";
  
  const items = [
    { icon: '📝', text: '撰寫內容' },
    { icon: '💡', text: '提案建議' },
    { icon: '📊', text: '建立表格' },
    { icon: '🎨', text: '格式美化' }
  ];

  items.forEach(item => {
    const el = document.createElement("div");
    el.className = "capability-item";
    el.innerHTML = `<span style="font-size: 24px;">${item.icon}</span><span>${item.text}</span>`;
    capabilities.appendChild(el);
  });

  container.appendChild(capabilities);

  const footer = document.createElement("p");
  footer.className = "welcome-footer";
  const provider = props?.authProvider ? `目前連線：${props.authProvider}` : "請在下方輸入訊息來開始對話。";
  footer.textContent = provider;
  container.appendChild(footer);

  return container;
}
