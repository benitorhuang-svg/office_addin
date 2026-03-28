import { createLayoutBox } from "@atoms/LayoutBox";
import { createButton } from "@atoms/Button";

export interface BubbleActionsProps {
    onApply?: () => void;
    onCopy?: () => void;
}

/**
 * Molecule: BubbleActions
 * Premium industrial-styled message actions (Sync, Copy).
 */
export function createBubbleActions({ onApply, onCopy }: BubbleActionsProps): HTMLElement {
    // 1. Apply Atom (Standardized Industrial Action)
    const applyBtn = createButton({
        label: "SYNC_TO_DOCUMENT",
        className: "nexus-group-hover-shine nexus-relative nexus-overflow-hidden nexus-px-5 nexus-py-2-5 nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-widest nexus-bg-blue-600 nexus-text-white nexus-rounded-2xl hover:bg-blue-700 nexus-transition-all nexus-active-scale-95 nexus-shadow-lg nexus-border-none",
    });
    
    // Add glowing shine effect
    const shine = createLayoutBox({
        className: "nexus-absolute nexus-inset-0 nexus-w-full nexus-h-full nexus-bg-gradient-shine nexus--translate-x-full nexus-transition-all nexus-duration-1000 nexus-ease-in-out"
    });
    const label = createLayoutBox({
        tag: "span",
        className: "nexus-relative nexus-z-10 nexus-font-black",
        children: [document.createTextNode("SYNC_TO_DOCUMENT")]
    });
    applyBtn.appendChild(shine);
    applyBtn.appendChild(label);
    if (onApply) (applyBtn as HTMLButtonElement).onclick = onApply;

    // 2. Copy Atom (Utility Action)
    const copyBtn = createButton({
        label: "COPY_RAW",
        className: "nexus-px-5 nexus-py-2-5 nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-widest nexus-bg-white nexus-opacity-5 nexus-text-white nexus-opacity-40 hover:nexus-bg-white nexus-opacity-10 nexus-border nexus-border-white nexus-opacity-5 nexus-rounded-2xl nexus-transition-all nexus-active-scale-95 nexus-inline-flex nexus-items-center",
        onClick: () => {
            onCopy?.();
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "COPIED";
            copyBtn.classList.add("text-blue-400");
            setTimeout(() => { 
                copyBtn.textContent = originalText; 
                copyBtn.classList.remove("text-blue-400");
            }, 1500);
        }
    });

    return createLayoutBox({
        className: "bubble-footer nexus-flex nexus-items-center nexus-gap-3 nexus-pt-5 nexus-border-t",
        children: [applyBtn, copyBtn]
    });
}
