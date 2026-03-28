/**
 * Molecule: Context Manager
 * Handles the project manifest list and attachment toggling.
 */
import { NexusStateStore } from "../../services/molecules/global-state";

export function createContextManager() {
    const wrapper = document.createElement("div");
    wrapper.className = "nexus-relative";

    const btn = document.createElement("button");
    btn.className = "nexus-w-10 nexus-h-10 nexus-flex nexus-items-center nexus-justify-center nexus-rounded-full nexus-bg-slate-50 nexus-text-slate-400 nexus-hover-bg-emerald-50 nexus-hover-text-emerald-600 nexus-transition-all nexus-cursor-pointer nexus-relative nexus-ml-1";
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;

    const badge = document.createElement("div");
    badge.className = "nexus-absolute nexus-top-0 nexus-right-0 nexus-w-2-5 nexus-h-2-5 nexus-bg-emerald-500 nexus-rounded-full nexus-hidden nexus-border-2 nexus-border-white";
    btn.appendChild(badge);

    const menu = document.createElement("div");
    // NUCLEAR FIX: Injected high-priority inline styles to bypass flex-compression
    menu.className = "nexus-absolute nexus-right-0 nexus-backdrop-blur-3xl nexus-border nexus-border-white/40 nexus-rounded-24px nexus-shadow-2xl nexus-z-100 nexus-p-3 nexus-hidden nexus-animate-spring";
    menu.style.background = "linear-gradient(165deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)";
    menu.style.top = "calc(100% + 10px)";
    menu.style.boxShadow = "0 30px 70px -15px rgba(15, 23, 42, 0.15), 0 10px 30px -5px rgba(15, 23, 42, 0.05)";

    // Forced Horizontal Integrity
    menu.style.setProperty("width", "max-content", "important");
    menu.style.setProperty("min-width", "288px", "important");
    menu.style.setProperty("white-space", "nowrap", "important");

    const refreshItems = (attachments: string[] = [], enabled: string[] = []) => {
        menu.innerHTML = `<div class="nexus-text-10px nexus-font-bold nexus-text-slate-400 nexus-px-3 nexus-mb-2 nexus-uppercase nexus-tracking-wider">目前內容載入列表</div>`;
        if (attachments.length === 0) {
            const empty = document.createElement("div");
            empty.className = "nexus-text-xs nexus-text-slate-400 nexus-px-3 nexus-py-4 nexus-text-center";
            empty.innerText = "目前無夾帶任何內容";
            menu.appendChild(empty);
            badge.classList.add("nexus-hidden");
            return;
        }
        badge.classList.remove("nexus-hidden");

        attachments.forEach(name => {
            const isEnabled = enabled.includes(name);
            const row = document.createElement("div");
            row.className = "nexus-w-full nexus-flex nexus-items-center nexus-gap-3 nexus-px-3 nexus-py-2-5 nexus-rounded-16px nexus-hover-bg-slate-50 nexus-transition-all nexus-mb-1";

            const checkBtn = document.createElement("button");
            checkBtn.className = `nexus-w-6 nexus-h-6 nexus-flex nexus-items-center nexus-justify-center nexus-rounded-lg nexus-border-2 nexus-transition-all nexus-cursor-pointer ${isEnabled ? "nexus-bg-emerald-500 nexus-border-emerald-500 nexus-text-white" : "nexus-bg-white nexus-border-slate-200"}`;
            checkBtn.innerHTML = isEnabled ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : "";

            checkBtn.onclick = (e) => {
                e.stopPropagation();
                const currentEnabled = NexusStateStore.getState().enabledAttachments || [];
                const next = isEnabled ? currentEnabled.filter((a: string) => a !== name) : [...currentEnabled, name];
                NexusStateStore.update({ enabledAttachments: next });
            };

            const rightPart = document.createElement("div");
            rightPart.className = "nexus-flex nexus-items-center nexus-gap-3 nexus-flex-1";
            rightPart.innerHTML = `
                <div class="nexus-w-8 nexus-h-8 nexus-flex nexus-items-center nexus-justify-center nexus-rounded-xl ${isEnabled ? "nexus-bg-emerald-50 nexus-text-emerald-500" : "nexus-bg-slate-100 nexus-text-slate-400"}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <span class="nexus-text-xs nexus-font-bold ${isEnabled ? "nexus-text-slate-700" : "nexus-text-slate-400"}">${name}</span>
            `;

            row.appendChild(checkBtn);
            row.appendChild(rightPart);
            menu.appendChild(row);
        });

        const clearAllContainer = document.createElement("div");
        clearAllContainer.className = "nexus-w-full nexus-flex nexus-justify-center nexus-mt-2";

        const clearAll = document.createElement("button");
        clearAll.className = "nexus-px-6 nexus-py-2 nexus-text-10px nexus-font-black nexus-text-red-400 nexus-hover-bg-red-50 nexus-rounded-full nexus-transition-all nexus-cursor-pointer nexus-border-none nexus-uppercase nexus-tracking-widest";
        clearAll.innerText = "全部清除";
        clearAll.onclick = (e) => {
            e.stopPropagation();
            NexusStateStore.update({ attachments: [], enabledAttachments: [] });
        };
        clearAllContainer.appendChild(clearAll);
        menu.appendChild(clearAllContainer);
    };

    NexusStateStore.subscribe((state: any) => refreshItems(state.attachments, state.enabledAttachments));
    refreshItems(NexusStateStore.getState().attachments, NexusStateStore.getState().enabledAttachments);

    btn.onclick = (e) => {
        e.stopPropagation();
        menu.classList.toggle("nexus-hidden");
        // Use Global Close Strategy for sibling menus
        document.querySelectorAll(".nexus-absolute:not(.nexus-hidden)").forEach(el => {
            if (el !== menu) el.classList.add("nexus-hidden");
        });
    };

    const closeHandler = () => menu.classList.add("nexus-hidden");
    document.addEventListener("click", closeHandler);

    wrapper.appendChild(btn);
    wrapper.appendChild(menu);

    return { 
        element: wrapper,
        close: closeHandler
    };
}
