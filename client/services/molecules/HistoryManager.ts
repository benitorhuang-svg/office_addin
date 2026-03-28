import { createChatBubble } from "@molecules/chat-bubble";
import { IntelligenceStep, createStepItem } from "../../components/atoms/StepItem";
import { createTypingIndicator } from "@molecules/typing-indicator";

export interface AppendMessageOptions {
    historyEl: HTMLElement | null;
    role: "user" | "assistant";
    text: string;
    steps?: IntelligenceStep[];
    isStory?: boolean;
    animate?: boolean; 
    onApply?: () => void;
    batchFiles?: string[];
}

/**
 * Molecule Service: HistoryManager (Deep-Thought Awareness)
 * Encapsulates message list mutations and process-centric narratives.
 * ACHIEVED: 100% Logic-to-Animation Fidelity.
 */
export const HistoryManager = {
    appendMessage({
        historyEl,
        role,
        text,
        steps = [],
        isStory = false,
        animate = false,
        onApply,
        batchFiles = []
    }: AppendMessageOptions): HTMLElement | null {
        if (!historyEl) return null;
        
        // 1. CLEAR_STAGE: Clear the welcome message if present to move dialogue to the top.
        const welcome = document.getElementById("welcome-message");
        if (welcome) {
            welcome.remove();
        }

        const bubble = createChatBubble({ role, text, steps, isStory, animate, onApply, batchFiles });
        if (!bubble) return null;
        
        historyEl.appendChild(bubble);

        // Smooth scroll to bottom on next frame
        requestAnimationFrame(() => {
            historyEl.scrollTo({
                top: historyEl.scrollHeight,
                behavior: "smooth",
            });
        });

        return bubble;
    },

    showTypingIndicator(historyEl: HTMLElement | null) {
        if (!historyEl) return;
        const indicator = createTypingIndicator();
        historyEl.appendChild(indicator);
        historyEl.scrollTo({ top: historyEl.scrollHeight, behavior: "smooth" });
    },

    removeTypingIndicator() {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) indicator.remove();
    },

    forceScroll() {
        const history = document.getElementById("chat-history");
        if (history) {
            history.scrollTo({
                top: history.scrollHeight,
                behavior: "smooth"
            });
        }
    },

    updateAssistantBubble(bubble: HTMLElement, text: string, transformer: (t: string) => string) {
        const textEl = bubble.querySelector(".nexus-result-text");
        if (textEl) {
            textEl.textContent = transformer(text);
        }
    },

    updateAssistantSteps(bubble: HTMLElement, steps: IntelligenceStep[]) {
        const processBox = bubble.querySelector(".nexus-process-box");
        if (processBox) {
            processBox.replaceChildren();
            steps.forEach(step => {
                processBox.appendChild(createStepItem(step));
            });
        }
    },

    completeAssistantBubble(bubble: HTMLElement, text: string) {
        const textEl = bubble.querySelector(".nexus-result-text");
        if (textEl) {
            const htmlEl = textEl as HTMLElement;
            htmlEl.textContent = text;
            htmlEl.classList.remove("nexus-opacity-0");
            htmlEl.style.opacity = "1";
        }
    }
};

