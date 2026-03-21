export function createHistoryContainer(): HTMLElement {
  const container = document.createElement("div");
  container.id = "history";
  container.className = "org-history-container atom-text";
  container.setAttribute("aria-live", "polite");

  const welcome = document.createElement("div");
  welcome.className = "welcome-message-container";
  welcome.innerHTML = `
    <div class="welcome-header">
      你好！我是 <strong>office_Agent</strong>，<span>你的文案助手</span>
    </div>
    <div class="welcome-capabilities">
       <div class="capability-item">📝 撰寫、編輯文件內容</div>
       <div class="capability-item">💡 延伸主題、提煉賣點</div>
       <div class="capability-item">📊 建立表格、清單結構</div>
       <div class="capability-item">🎨 格式化文字與排版</div>
    </div>
    <div class="welcome-footer">
      請告訴我你想寫什麼，或直接貼上需要修改的內容，我們開始吧！
    </div>
  `;

  container.appendChild(welcome);
  return container;
}
