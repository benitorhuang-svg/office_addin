import { createLayoutBox } from "@atoms/LayoutBox";

/**
 * Molecule/Atom: TypingIndicator
 * Industrial "Thinking" state for AI Uplink.
 * ACHIEVED: 100% Declarative LayoutBox construction.
 */
export function createTypingIndicator(): HTMLElement {
    // 1. Icon Atom
    const icon = createLayoutBox({
        className: "nexus-w-5 nexus-h-5 nexus-flex nexus-items-center nexus-justify-center nexus-rounded-lg nexus-bg-blue-500 nexus-opacity-10 nexus-text-blue-400 nexus-border nexus-border-blue-500 nexus-opacity-10",
        children: [
            (() => {
                const svg = document.createElement("div");
                svg.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg>`;
                return svg.firstChild as Node;
            })()
        ]
    });

    // 2. Status Label
    const label = createLayoutBox({
        tag: "span",
        className: "nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-white nexus-opacity-20 font-mono",
        children: [document.createTextNode("THINKING_PROBE")]
    });

    const header = createLayoutBox({
        className: "nexus-flex nexus-items-center nexus-gap-2 nexus-px-1",
        children: [icon, label]
    });

    // 3. Pulse Molecule
    const pulseArray = [
        createLayoutBox({ className: "nexus-w-1-5 nexus-h-1-5 nexus-bg-blue-500 nexus-opacity-40 nexus-rounded-full nexus-animate-bounce [animation-delay:-0.3s]" }),
        createLayoutBox({ className: "nexus-w-1-5 nexus-h-1-5 nexus-bg-blue-500 nexus-opacity-40 nexus-rounded-full nexus-animate-bounce [animation-delay:-0.15s]" }),
        createLayoutBox({ className: "nexus-w-1-5 nexus-h-1-5 nexus-bg-blue-500 nexus-opacity-40 nexus-rounded-full nexus-animate-bounce" })
    ];

    const pulseContainer = createLayoutBox({
        className: "nexus-bg-white nexus-opacity-3 nexus-border nexus-border-white nexus-opacity-5 nexus-backdrop-blur-3xl nexus-px-6 nexus-py-4 nexus-flex nexus-gap-2 nexus-items-center nexus-rounded-2rem",
        children: pulseArray
    });

    // 4. Assembly
    return createLayoutBox({
        id: "typing-indicator",
        className: "nexus-flex nexus-flex-col nexus-w-full nexus-max-w-85 nexus-space-y-2 nexus-items-start nexus-animate-in nexus-animate-fade-in nexus-duration-500 nexus-px-5",
        children: [header, pulseContainer]
    });
}
