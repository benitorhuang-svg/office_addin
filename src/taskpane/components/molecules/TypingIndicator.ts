/* global document, HTMLElement */

export function createTypingIndicator(): HTMLElement {
  const indicator = document.createElement("div");
  indicator.className = "mol-chat-bubble assistant-card";
  indicator.id = "typing-indicator";
  indicator.setAttribute("aria-label", "AI is typing");
  indicator.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  return indicator;
}
