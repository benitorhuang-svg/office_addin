/* global document */

/**
 * Atom: ActionButton
 */
export const createActionButton = (label: string, onClick: () => void) => {
  const btn = document.createElement("button");
  btn.className = "action-pill-btn";
  btn.innerHTML = `<span>${label}</span>`;
  btn.onclick = () => {
    btn.disabled = true;
    btn.style.opacity = "0.5";
    onClick();
    setTimeout(() => {
      btn.disabled = false;
      btn.style.opacity = "1";
    }, 1000);
  };
  return btn;
};

/**
 * Atom: ErrorBlock with Retry
 */
export const createErrorBlock = (errorText: string, onRetry?: () => void) => {
  const container = document.createElement("div");
  container.style.color = "#DC3545";
  container.style.marginTop = "8px";
  
  const text = document.createElement("div");
  text.textContent = errorText;
  container.appendChild(text);

  if (onRetry) {
    const retryBtn = document.createElement("button");
    retryBtn.textContent = "🔄 重試";
    retryBtn.className = "action-pill-btn";
    retryBtn.style.marginTop = "8px";
    retryBtn.style.color = "#DC3545";
    retryBtn.onclick = onRetry;
    container.appendChild(retryBtn);
  }
  
  return container;
};

/**
 * Atom: AskUserForm (Rich)
 */
export const createAskUserForm = (
  sessionId: string, 
  config: { type: string; options?: string[] }, 
  question: string,
  onSubmit: (answer: string) => Promise<void>
) => {
  const container = document.createElement("div");
  container.className = "ask-user-premium-card";
  
  const qEl = document.createElement("div");
  qEl.className = "ask-user-question";
  qEl.textContent = question;
  container.appendChild(qEl);

  const controlsWrapper = document.createElement("div");
  controlsWrapper.className = "ask-user-controls";

  let getVal = () => "";

  if (config.type === "checkbox" && config.options) {
    const list = document.createElement("div");
    list.className = "ask-user-file-list";
    const checks: HTMLInputElement[] = [];
    
    config.options.forEach(opt => {
      const item = document.createElement("label");
      item.className = "file-item";
      
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = true;
      cb.value = opt;
      
      const icon = document.createElement("div");
      icon.className = "file-icon";
      icon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
      
      const name = document.createElement("span");
      name.className = "file-name";
      name.textContent = opt;

      item.appendChild(cb);
      item.appendChild(icon);
      item.appendChild(name);
      list.appendChild(item);
      checks.push(cb);
    });
    controlsWrapper.appendChild(list);
    getVal = () => checks.filter(c => c.checked).map(c => c.value).join(", ");
  } else if (config.type === "select" && config.options) {
    const select = document.createElement("select");
    select.className = "ask-user-select";
    config.options.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    });
    controlsWrapper.appendChild(select);
    getVal = () => select.value;
  } else {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "ask-user-input";
    input.placeholder = "請輸入回覆...";
    controlsWrapper.appendChild(input);
    getVal = () => input.value.trim();
  }
  
  container.appendChild(controlsWrapper);

  const footer = document.createElement("div");
  footer.className = "ask-user-footer";

  const submitBtn = document.createElement("button");
  submitBtn.className = "ask-user-btn primary";
  submitBtn.textContent = config.type === "checkbox" ? "🎯 使用選取項目" : "傳送";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "ask-user-btn secondary";
  cancelBtn.textContent = "❌ 不使用";

  submitBtn.onclick = async () => {
    const answer = getVal();
    if (!answer) return;
    submitBtn.disabled = true;
    submitBtn.textContent = "處理中...";
    try {
      await onSubmit(answer);
      container.innerHTML = `<div class="ask-user-success">✅ 已確認使用：${answer}</div>`;
      setTimeout(() => container.remove(), 2500);
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = "重發";
    }
  };

  cancelBtn.onclick = async () => {
    cancelBtn.disabled = true;
    try {
      await onSubmit("__REJECTED__");
      container.remove();
    } catch {
      cancelBtn.disabled = false;
    }
  };

  footer.appendChild(submitBtn);
  footer.appendChild(cancelBtn);
  container.appendChild(footer);

  return container;
};
