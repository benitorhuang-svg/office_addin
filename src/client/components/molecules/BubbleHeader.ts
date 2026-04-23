import { createLayoutBox } from "@atoms/LayoutBox";

export interface BubbleHeaderProps {
    role: "user" | "assistant";
    isTyping?: boolean;
}

/**
 * Molecule: BubbleHeader
 * Industrial branding for chat bubbles with role-specific iconography.
 */
export function createBubbleHeader({ role, isTyping = false }: BubbleHeaderProps): HTMLElement {
    const isUser = role === "user";
    
    // 1. Icon Atom
    const icon = createLayoutBox({
        className: `nexus-w-6 nexus-h-6 nexus-flex nexus-items-center nexus-justify-center nexus-rounded-xl nexus-border nexus-transition-all nexus-duration-500 ${
            isUser ? "nexus-bg-blue-600 nexus-opacity-10 nexus-border-blue-500 nexus-opacity-20 nexus-text-blue-400" : "nexus-bg-white nexus-opacity-5 nexus-border-white nexus-opacity-10 nexus-text-white nexus-opacity-40"
        }`,
        tag: "div"
    });
    
    icon.innerHTML = isUser 
        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
        : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>`;

    // 2. Role Label Atom
    const label = createLayoutBox({
        tag: "span",
        className: "nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-tight-wide nexus-text-white nexus-opacity-20 font-mono",
        children: [document.createTextNode(isUser ? "LINK_USER" : "NEXUS_AGENT")]
    });

    // 3. Typing Indicator Molecule (Internal)
    const children: Node[] = isUser ? [label, icon] : [icon, label];

    if (!isUser) {
        const dots = createLayoutBox({
            className: "typing-dots nexus-flex gap-1 nexus-items-center ml-1 transition-opacity nexus-duration-300",
            style: { opacity: isTyping ? "1" : "0" },
            children: [
                createLayoutBox({ className: "nexus-w-1 nexus-h-1 nexus-bg-blue-500 nexus-rounded-full nexus-animate-bounce" }),
                createLayoutBox({ className: "nexus-w-1 nexus-h-1 nexus-bg-blue-500 nexus-rounded-full nexus-animate-bounce" }),
                createLayoutBox({ className: "nexus-w-1 nexus-h-1 nexus-bg-blue-500 nexus-rounded-full nexus-animate-bounce" })
            ]
        });
        children.push(dots);
    }

    return createLayoutBox({
        className: `nexus-flex nexus-items-center nexus-gap-1-5 nexus-px-1 ${isUser ? "nexus-flex-row-reverse" : "nexus-flex-row"}`,
        children
    });
}
