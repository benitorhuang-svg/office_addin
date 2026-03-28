import { OfficeAction } from "@shared/types";
import { createLayoutBox } from "@atoms/LayoutBox";

export interface ChatActionGroupProps {
    actions: OfficeAction[];
    onAction: (type: string, value: string) => void;
}

/**
 * Molecule: ChatActionGroup
 * Premium action pill matrix for AI-suggested interactions.
 */
export function createChatActionGroup({ actions, onAction }: ChatActionGroupProps): HTMLElement {
    const container = createLayoutBox({
        className: "nexus-flex nexus-flex-wrap nexus-gap-2 nexus-mt-4 nexus-animate-in nexus-animate-fade-in nexus-duration-700"
    });

    actions.forEach(action => {
        const label = action.text || "Execute";
        const iconName = action.icon || (action.type === 'INSERT' ? 'edit' : 'copy');
        
        const btn = document.createElement("button");
        const isInsert = action.type === 'INSERT';
        
        btn.className = `nexus-group nexus-relative nexus-flex nexus-items-center nexus-gap-2.5 nexus-px-4-5 nexus-py-2-5 nexus-rounded-14px nexus-transition-all nexus-duration-400 nexus-border-2 nexus-shadow-sm nexus-animate-in nexus-active:nexus-scale-95`;
        
        if (isInsert) {
            btn.className += " nexus-bg-blue-600 nexus-border-blue-700 nexus-text-white nexus-hover:nexus-bg-blue-700 nexus-hover:nexus-shadow-blue-200/50";
        } else {
            btn.className += " nexus-bg-white nexus-border-slate-100 nexus-text-slate-700 nexus-hover:nexus-border-blue-400/40 nexus-hover:nexus-text-blue-600 nexus-hover:nexus-shadow-lg";
        }
        
        const iconSvg = isInsert 
            ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`
            : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="nexus-text-slate-400 nexus-group-hover:nexus-text-blue-500"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

        btn.innerHTML = `
            ${iconSvg}
            <span class="nexus-text-11px nexus-font-black nexus-uppercase nexus-tracking-widest">${label}</span>
        `;

        btn.onclick = (e) => {
            e.stopPropagation();
            btn.disabled = true;
            btn.classList.add("nexus-opacity-50", "nexus-cursor-wait");
            const val = action.value || action.text || "";
            onAction(action.type, val);

            setTimeout(() => {
                btn.disabled = false;
                btn.classList.remove("nexus-opacity-50", "nexus-cursor-wait");
            }, 1000);
        };

        container.appendChild(btn);
    });

    return container;
}
