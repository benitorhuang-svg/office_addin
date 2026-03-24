/* global document, HTMLElement */

export function createTypingIndicator(): HTMLElement {
  const indicator = document.createElement("div");
  indicator.id = "typing-indicator";
  indicator.className = "flex flex-col w-full max-w-[85%] space-y-2 items-start animate-in fade-in duration-300 px-5";
  
  indicator.innerHTML = `
    <div class="flex items-center gap-2 px-1">
      <div class="w-5 h-5 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg>
      </div>
      <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thinking</span>
    </div>
    <div class="glass-card px-4 py-3 flex gap-1.5 items-center ml-0">
      <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
    </div>
  `;
  return indicator;
}
