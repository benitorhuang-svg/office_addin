import { createLayoutBox } from "@atoms/LayoutBox";
import { createStepItem, IntelligenceStep } from "@atoms/StepItem";
import { createBatchFileDetails } from "./BatchFileDetails";
import { createStoryCard } from "./StoryCard";
import { NexusStateStore } from "@services/molecules/global-state";

export interface ChatBubbleProps {
  role: "user" | "assistant";
  text: string;
  onApply?: () => void;
  steps?: IntelligenceStep[];
  isStory?: boolean; 
  animate?: boolean; 
  batchFiles?: string[];
}

/**
 * Molecule: ChatBubble
 * High-fidelity 'Chain of Thought' messaging.
 * REFACTORED: Atomic separation of StepItems, BatchDetails, and StoryCards.
 */
export function createChatBubble({ role, text, onApply, steps = [], isStory = false, animate = false, batchFiles = [] }: ChatBubbleProps): HTMLElement | null {
    const isAssistant = role === "assistant";
    const processSteps: IntelligenceStep[] = (steps.length > 0) ? steps : [];
    const hasSteps = processSteps.length > 0;
    const hasText = text.trim().length > 0;

    if (!isAssistant) {
        return createLayoutBox({
            className: "nexus-bubble-user",
            children: [document.createTextNode(text)]
        });
    }

    const processBox = hasSteps ? createLayoutBox({ className: "nexus-process-box" }) : null;
    const resultWrapper = createLayoutBox({ className: "nexus-result-text nexus-opacity-0" });

    if (resultWrapper && hasText) {
        resultWrapper.textContent = text;
        if (onApply) renderApplyButton(resultWrapper, onApply);
    }

    const batchBox = (batchFiles && batchFiles.length > 0) ? createBatchFileDetails(batchFiles) : null;
    const storyCard = isStory ? createStoryCard() : null;

    const contentWrapper = createLayoutBox({
        className: "nexus-assistant-bubble",
        children: [processBox, resultWrapper, batchBox].filter(Boolean) as Node[]
    });

    const container = createLayoutBox({
        className: "nexus-bubble-assistant-container",
        children: [contentWrapper]
    });

    if (animate && (processBox || resultWrapper)) {
        initializeAnimation(container, resultWrapper, processBox, processSteps, storyCard, text, hasText, onApply);
    } else {
        renderStatic(container, resultWrapper, processBox, processSteps, storyCard);
    }

    return container;
}

// --- Internal Helpers for ChatBubble ---

function renderApplyButton(parent: HTMLElement, onApply: () => void) {
    const btn = document.createElement("div");
    btn.className = "nexus-mt-4 nexus-inline-flex nexus-px-3 nexus-py-2 nexus-bg-blue-50 nexus-text-blue-600 nexus-text-11px nexus-font-black nexus-uppercase nexus-rounded-12px nexus-border nexus-border-blue-200 nexus-cursor-pointer nexus-tracking-widest nexus-animate-in";
    btn.innerHTML = `<span>立刻執行</span> <span class="nexus-ml-2 nexus-opacity-40">同步資料庫與編輯器</span>`;
    btn.onclick = onApply;
    parent.appendChild(btn);
}

function renderStatic(container: HTMLElement, resultWrapper: HTMLElement, processBox: HTMLElement | null, steps: IntelligenceStep[], storyCard: HTMLElement | null) {
    if (processBox) steps.forEach(s => processBox.appendChild(createStepItem(s)));
    if (resultWrapper) {
        resultWrapper.style.opacity = "1";
        resultWrapper.classList.remove("nexus-opacity-0");
    }
    if (storyCard) {
        container.appendChild(storyCard);
        storyCard.style.opacity = "1";
        storyCard.classList.remove("nexus-opacity-0");
    }
}

async function initializeAnimation(container: HTMLElement, resultWrapper: HTMLElement, processBox: HTMLElement | null, steps: IntelligenceStep[], storyCard: HTMLElement | null, text: string, hasText: boolean, onApply?: () => void) {
    if (processBox) processBox.replaceChildren();
    if (resultWrapper) resultWrapper.style.opacity = "0";

    if (processBox && steps.length > 0) {
        for (const step of steps) {
            await new Promise(r => setTimeout(r, 600));
            processBox.appendChild(createStepItem(step));
            scrollHistory();
        }
        await new Promise(r => setTimeout(r, 400));
    }

    if (resultWrapper && hasText) {
        await new Promise(r => setTimeout(r, 100));
        resultWrapper.style.opacity = "1";
        resultWrapper.classList.add("nexus-animate-spring");
        
        const originalText = text;
        resultWrapper.textContent = ""; 
        
        let i = 0;
        const typeInterval = setInterval(() => {
            const globalStreaming = NexusStateStore.getState().isStreaming ?? false;
            if (globalStreaming) {
                clearInterval(typeInterval);
                resultWrapper.textContent = originalText;
                if (onApply) renderApplyButton(resultWrapper, onApply);
                return;
            }

            if (i < originalText.length) {
                resultWrapper.textContent += originalText[i];
                i++;
                if (i % 4 === 0 || i === originalText.length) scrollHistory();
            } else {
                clearInterval(typeInterval);
                if (onApply) renderApplyButton(resultWrapper, onApply);
            }
        }, 15);
        await new Promise(r => setTimeout(r, 1200));
    }
    
    if (storyCard) {
        await new Promise(r => setTimeout(r, 500));
        container.appendChild(storyCard);
        requestAnimationFrame(() => {
            storyCard.style.opacity = "1";
            storyCard.classList.remove("nexus-opacity-0");
            setTimeout(scrollHistory, 150);
        });
    }
}

function scrollHistory() {
    const history = document.getElementById("chat-history");
    if (history) history.scrollTo({ top: history.scrollHeight, behavior: "smooth" });
}
