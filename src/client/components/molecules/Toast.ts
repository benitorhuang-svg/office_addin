import { createLayoutBox } from "@atoms/LayoutBox";
import { NEXUS_SLOTS } from "@services/atoms/layout-registry";

/**
 * Molecule: Toast Notification
 * Managed floating toast for system alerts.
 * Refactored to use LayoutBox and specific Slot registration.
 */
export const Toast = {
    show(message: string, type: "info" | "success" | "error" = "info") {
        const bgColor = type === "success" 
            ? "nexus-bg-emerald-500 nexus-shadow-emerald-500/30" 
            : type === "error" 
                ? "nexus-bg-rose-600 shadow-rose-500/20" 
                : "nexus-bg-slate-900 shadow-slate-900/40";
        
        // Internal Content Atom
        const dot = createLayoutBox({ className: "w-2 h-2 nexus-items-center nexus-flex-shrink-0 nexus-rounded-full nexus-bg-white/40 nexus-animate-pulse" });
        const text = createLayoutBox({ tag: "span", className: "nexus-white-space-nowrap", children: [document.createTextNode(message)] });
        const inner = createLayoutBox({ 
            className: "nexus-flex nexus-items-center nexus-gap-2-5", 
            children: [dot, text] 
        });

        // Main Toast Molecule (Extreme Tail-Weighted Padding: Left 24px, Right 96px)
        const toast = createLayoutBox({
            className: `nexus-fixed nexus-z-100 nexus-pl-6 nexus-pr-24 nexus-py-2 nexus-rounded-full nexus-text-white nexus-text-12px nexus-font-black nexus-uppercase nexus-tracking-tighter nexus-shadow-2xl nexus-transition-all nexus-duration-500 nexus-opacity-0 pointer-events-none ${bgColor} border border-white/10 backdrop-blur-3xl`,
            children: [inner]
        });
        
        // FOOLPROOF POSITIONAL BLOCK (Gap Anchor: Between + and Folder)
        toast.style.setProperty("top", "12px", "important");
        toast.style.setProperty("right", "130px", "important");
        toast.style.setProperty("left", "auto", "important");
        toast.style.setProperty("transform", "translateY(-8px)", "important");
        toast.style.setProperty("transition", "all 0.5s var(--ease-spring)", "important");
        
        // Anchor Strategy: Header Slot OR Global Fixed
        const headerSlot = document.getElementById("nexus-header-toast-slot");
        const container = headerSlot || document.getElementById(NEXUS_SLOTS.TOAST) || document.body;
        
        if (headerSlot) {
            // Header-Specific Anchor (Weighted towards the Left for better balance)
            toast.style.setProperty("position", "absolute", "important");
            toast.style.setProperty("top", "50%", "important");
            toast.style.setProperty("left", "42%", "important"); // Shifted left to balance the larger right-hand expert hub
            toast.style.setProperty("right", "auto", "important");
            toast.style.setProperty("transform", "translate(-50%, -50%) translateY(-5px)", "important");
            toast.style.setProperty("margin", "0", "important");
        }
        
        container.appendChild(toast);
        
        // Entry Animation Matrix
        requestAnimationFrame(() => {
            toast.style.setProperty("opacity", "1", "important");
            if (headerSlot) {
                toast.style.setProperty("transform", "translate(-50%, -50%)", "important");
            } else {
                toast.style.setProperty("transform", "translateY(0)", "important");
            }
        });

        // Auto-remove cycle
        const timer = setTimeout(() => {
            toast.style.setProperty("opacity", "0", "important");
            if (headerSlot) {
                toast.style.setProperty("transform", "translate(-50%, -50%) translateY(-5px)", "important");
            } else {
                toast.style.setProperty("transform", "translateY(-10px)", "important");
            }
            setTimeout(() => toast.remove(), 700);
        }, 3000);

        return {
            element: toast,
            dismiss: () => {
                clearTimeout(timer);
                toast.style.setProperty("opacity", "0", "important");
                if (headerSlot) {
                    toast.style.setProperty("transform", "translate(-50%, -50%) translateY(-5px)", "important");
                } else {
                    toast.style.setProperty("transform", "translateY(-10px)", "important");
                }
                setTimeout(() => toast.remove(), 700);
            }
        };
    }
};
