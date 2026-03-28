import { createLayoutBox } from "@atoms/LayoutBox";

export interface StatusHUDProps {
    isConnected: boolean;
}

/**
 * Molecule: StatusHUD
 * High-fidelity industrial connection monitor for the Prompt area.
 */
export function createStatusHUD({ isConnected }: StatusHUDProps): HTMLElement {
    // 1. Indicator Matrix
    const pulse = createLayoutBox({
        className: `w-2 h-2 nexus-rounded-full ${isConnected ? "bg-blue-500 nexus-animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.8)]" : "nexus-bg-red-500"}`
    });
    
    const ping = isConnected ? createLayoutBox({
        className: "nexus-absolute nexus-inset-0 w-2 h-2 nexus-rounded-full nexus-bg-blue-400 animate-ping"
    }) : null;

    const matrix = createLayoutBox({
        className: "nexus-relative nexus-flex nexus-items-center nexus-justify-center",
        children: ping ? [pulse, ping] : [pulse]
    });

    // 2. Protocol Label
    const label = createLayoutBox({
        tag: "span",
        className: "nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-widest font-mono",
        children: [document.createTextNode(isConnected ? "NEXUS_UPLINK: ACTIVE" : "UPLINK: STANDBY")]
    });

    const stack = createLayoutBox({
        className: "nexus-flex nexus-items-center nexus-gap-3",
        children: [matrix, label]
    });

    // 3. Container
    return createLayoutBox({
        className: `nexus-flex nexus-items-center nexus-gap-3 nexus-px-5 nexus-py-2-5 nexus-rounded-2xl nexus-border nexus-transition-all nexus-duration-700 ${
            isConnected 
                ? "bg-blue-500/5 border-blue-500/10 nexus-text-blue-400" 
                : "nexus-bg-red-500/5 border-red-500/10 text-red-500"
        }`,
        children: [stack]
    });
}
