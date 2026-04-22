/**
 * Template: NexusBaseLayout
 * The foundational app-shell architecture for the Nexus Center.
 * RESPONSIBILITY: Providing and managing slots (Header, Onboarding, History, Prompt).
 * ACHIEVED: Reactive Slot Management.
 */
import { NEXUS_SLOTS } from "@services/atoms/layout-registry";
import { createLayoutBox } from "@atoms/LayoutBox";
import { NexusComponent } from "@shared/types";

interface LayoutModeProps {
    mode: 'chat' | 'welcome' | 'offline' | 'monitor';
    provider?: string | null;
    isCLI?: boolean;
}

function isLayoutModeProps(props: unknown): props is LayoutModeProps {
    if (typeof props !== "object" || props === null || !("mode" in props)) {
        return false;
    }

    const mode = (props as { mode?: unknown }).mode;
    return mode === 'chat' || mode === 'welcome' || mode === 'offline' || mode === 'monitor';
}

export function createNexusBaseLayout(): NexusComponent {
    const header = createLayoutBox({ id: NEXUS_SLOTS.HEADER, className: "nexus-slot-header" });
    const onboarding = createLayoutBox({ id: NEXUS_SLOTS.ONBOARDING, className: "nexus-slot-onboarding" });
    const history = createLayoutBox({ id: NEXUS_SLOTS.HISTORY, className: "nexus-slot-history" });
    const prompt = createLayoutBox({ id: NEXUS_SLOTS.PROMPT, className: "nexus-slot-prompt" });
    const toast = createLayoutBox({ id: NEXUS_SLOTS.TOAST, className: "nexus-slot-toast" });

    const layout = createLayoutBox({
        id: "nexus-main-stage",
        className: "nexus-layout-root",
        children: [header, onboarding, history, prompt, toast]
    });

    /**
     * Update: Handles the visibility choreography of slots.
     */
    const update = (props: LayoutModeProps) => {
        if (!props) return;

        // Reset visibility for all slots
        header.classList.add("nexus-none");
        onboarding.classList.add("nexus-none");
        history.classList.add("nexus-none");
        prompt.classList.add("nexus-none");

        switch (props.mode) {
            case 'welcome':
            case 'offline':
                onboarding.classList.remove("nexus-none");
                onboarding.classList.add("nexus-flex", "nexus-animate-fade-in");
                break;

            case 'chat':
                header.classList.remove("nexus-none");
                header.classList.add("nexus-block");
                history.classList.remove("nexus-none");
                history.classList.add("nexus-flex");
                
                // Show prompt if provider selected or CLI mode active
                if (props.provider || props.isCLI) {
                    prompt.classList.remove("nexus-none");
                    prompt.classList.add("nexus-block");
                }
                break;

            case 'monitor':
                header.classList.remove("nexus-none");
                header.classList.add("nexus-block");
                onboarding.classList.remove("nexus-none");
                onboarding.classList.add("nexus-flex");
                break;
        }
    };

    return {
        element: layout,
        update: (props: unknown) => {
            if (isLayoutModeProps(props)) {
                update(props);
            }
        },
        destroy: () => {}
    };
}
