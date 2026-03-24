/**
 * Molecule: Suggestion Cards
 * Provides quick-start prompt cards to guide the user.
 */

export interface Suggestion {
  icon: string;
  text: string;
  prompt: string;
}

export const WORD_SUGGESTIONS: Suggestion[] = [
  {
    icon: "🔍",
    text: "總結目前選取內容",
    prompt: "請幫我摘要目前選取的文字內容，列出三個重點。"
  },
  {
    icon: "🪄",
    text: "精簡潤飾內容",
    prompt: "請幫我潤飾目前的文字，使其更加正式且專業。"
  },
  {
    icon: "📄",
    text: "產出會議記錄摘要",
    prompt: "這是一份會議記錄草稿，請幫我整理成正式的紀要格式。"
  }
];

export function createSuggestionCards(onSelect: (prompt: string) => void): HTMLElement {
  const container = document.createElement("div");
  container.className = "mol-suggestions";

  const wrapper = document.createElement("div");
  wrapper.className = "suggestions-wrapper";

  WORD_SUGGESTIONS.forEach(s => {
    const card = document.createElement("div");
    card.className = "suggestion-card";
    card.innerHTML = `
      <div class="card-icon">${s.icon}</div>
      <div class="card-text">${s.text}</div>
    `;
    card.onclick = () => onSelect(s.prompt);
    wrapper.appendChild(card);
  });

  container.appendChild(wrapper);
  return container;
}
