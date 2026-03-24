export interface WelcomeMessageProps {
  authProvider?: string | null;
}

/**
 * Molecule: Welcome Message
 * Hero component for the initial state of the chat.
 */
export function createWelcomeMessage(props?: WelcomeMessageProps): HTMLElement {
  const container = document.createElement("div");
  container.className = "max-w-md mx-auto py-12 px-4 text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000";

  const header = document.createElement("div");
  header.className = "space-y-3";
  header.innerHTML = `
    <h2 class="text-3xl font-bold font-outfit text-slate-900 tracking-tight">
      Meet <span class="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">office_Agent</span>
    </h2>
    <p class="text-slate-500 text-sm max-w-[280px] mx-auto leading-relaxed italic">
      Your specialized AI workspace assistant, crafted for Word.
    </p>
  `;
  container.appendChild(header);

  const capabilities = document.createElement("div");
  capabilities.className = "grid grid-cols-2 gap-3 w-full";

  const items = [
    { icon: "✨", text: "Smart Writing", desc: "Crafting polished content instantly." },
    { icon: "💡", text: "Creative Ideas", desc: "Unlocking new perspectives." },
    { icon: "📊", text: "Tabular Data", desc: "Generating structured insights." },
    { icon: "🎨", text: "Style Sync", desc: "Keeping your brand consistent." },
  ];

  items.forEach((item) => {
    const el = document.createElement("div");
    el.className = "glass-card p-4 text-left hover:scale-[1.02] transition-transform duration-300";
    el.innerHTML = `
      <div class="text-2xl mb-2">${item.icon}</div>
      <div class="text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">${item.text}</div>
      <div class="text-[10px] text-slate-400 leading-tight">${item.desc}</div>
    `;
    capabilities.appendChild(el);
  });
  container.appendChild(capabilities);

  const footer = document.createElement("div");
  footer.className = "text-[10px] text-slate-400/60 font-medium px-4 leading-relaxed";
  
  const provider = props?.authProvider
    ? `Currently connected via ${props.authProvider.toUpperCase()}`
    : `Experience the future of document collaboration. Connect your preferred AI model to unlock full capabilities.`;
  
  footer.textContent = provider;
  container.appendChild(footer);

  return container;
}
