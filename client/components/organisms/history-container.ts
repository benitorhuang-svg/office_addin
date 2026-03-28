import { NexusComponent, AuthController } from "@shared/types";
import { createLayoutBox } from "@atoms/LayoutBox";

export interface HistoryContainerProps {
  authProvider: string | null;
  auth?: AuthController | null;
  isStandby?: boolean;
}

/**
 * Organism: HistoryContainer
 * Manages the scrolling message feed.
 * ACHIEVED: 100% Declarative anchoring via LayoutBox.
 */
export function createHistoryContainer({
  isStandby
}: HistoryContainerProps): NexusComponent {
    const container = createLayoutBox({
        id: "chat-history",
        className: `nexus-slot-history ${isStandby ? 'nexus-standby' : ''}`,
        dataset: { ariaLive: "polite" }
    });

    let currentStandby = isStandby;
    const renderMatrix = () => {
        container.replaceChildren();
        // Atomic Design: HistoryContainer no longer manages onboarding/welcome.
        // It strictly manages the message stack.
    };

    renderMatrix();
    
    const clear = () => renderMatrix();

    return {
        element: container,
        clear,
        update: (newProps: unknown) => {
            const next = newProps as HistoryContainerProps;
            if (next.isStandby !== currentStandby) {
                currentStandby = next.isStandby;
                container.className = `nexus-slot-history ${next.isStandby ? 'nexus-standby' : ''}`;
                renderMatrix();
            }
        },
        destroy: () => {}
    };
}
