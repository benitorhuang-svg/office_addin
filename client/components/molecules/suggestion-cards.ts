/**
 * Molecule: Suggestion Cards
 * Provides quick-start prompt cards to guide the user.
 * ACHIEVED: Content Parity with Word AI Experience.
 */
import { createLayoutBox } from "../atoms/LayoutBox";

export interface Suggestion {
  icon: string;
  text: string;
  prompt: string;
}

const WORD_SUGGESTIONS: Suggestion[] = [
  {
    icon: "✍️",
    text: "撰寫草稿",
    prompt: "請協助我根據以下標題寫一段文章草稿，並確保語氣呈現專業且具有說服力："
  },
  {
    icon: "📝",
    text: "總結摘要",
    prompt: "這是一段產品介紹草案，請協助我將重點提取出來，並整理成 3 個條列式的精簡摘要："
  },
  {
    icon: "🌐",
    text: "語言優化",
    prompt: "這是一段商業書信的草稿，請協助我將其優化得更具禮貌且專業，並確認沒有語法錯誤："
  }
];

export function createSuggestionCards(onSelect: (prompt: string) => void): HTMLElement {
  const wrapper = createLayoutBox({
    className: "nexus-suggestions-wrapper nexus-flex nexus-gap-3 nexus-overflow-x-auto nexus-pb-2 nexus-scrollbar-none nexus-w-full"
  });

  WORD_SUGGESTIONS.forEach(s => {
    const card = document.createElement("div");
    card.className = "nexus-suggestion-card nexus-flex nexus-flex-col nexus-items-start nexus-gap-2 nexus-p-4 nexus-bg-white/5 nexus-border nexus-border-slate-200/50 nexus-rounded-2xl nexus-cursor-pointer nexus-hover-bg-white/10 nexus-hover-border-blue-400 nexus-transition-all nexus-active-scale-95 nexus-shrink-0 nexus-w-40";
    
    card.innerHTML = `
      <div class="nexus-text-2xl">${s.icon}</div>
      <div class="nexus-text-11px nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-slate-500 nexus-transition-colors">${s.text}</div>
    `;
    
    card.onclick = () => onSelect(s.prompt);
    wrapper.appendChild(card);
  });
  
  return wrapper;
}
