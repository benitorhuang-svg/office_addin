import { createLayoutBox } from "@atoms/LayoutBox";

export interface SendButtonProps {
    isConnected: boolean;
    onClick?: () => void;
}

/**
 * Molecule/Atom: SendButton
 * Premium industrial-styled send button for AI narrative transmission.
 */
export function createSendButton({ isConnected, onClick }: SendButtonProps): HTMLElement {
    // 1. Shimmer Effect Layer
    const shimmer = createLayoutBox({
        className: "nexus-absolute inset-0 w-[200%] nexus-h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full nexus-group-hover/btn:translate-x-full nexus-transition-all nexus-duration-1000 ease-in-out"
    });

    // 2. Icon Atom
    const icon = document.createElement("div");
    icon.className = "nexus-relative nexus-z-10 nexus-p-4 nexus-transition-all";
    icon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>`;

    // 3. Button Assembly
    const btn = createLayoutBox({
        tag: "button",
        id: "send-btn",
        className: `nexus-group/btn nexus-relative nexus-overflow-hidden rounded-3xl nexus-transition-all nexus-transform shrink-0 nexus-flex nexus-items-center nexus-justify-center ${
            isConnected 
              ? "nexus-bg-blue-600 nexus-text-white hover:bg-blue-700 shadow-[0_10px_30px_-5px_rgba(37,99,235,0.4)] nexus-active-scale-95" 
              : "nexus-bg-white/5 nexus-text-white/20 cursor-not-allowed"
        }`,
        children: [shimmer, icon]
    });

    if (isConnected && onClick) (btn as HTMLButtonElement).onclick = onClick;
    if (!isConnected) (btn as HTMLButtonElement).disabled = true;

    return btn;
}
