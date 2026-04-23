import { createLayoutBox } from "@atoms/LayoutBox";
import { AuthController, NexusComponent } from "@shared/types";
import { createAuthGateway } from "@organisms/AuthGateway";

export interface WelcomeMessageProps {
  authProvider?: string | null;
  auth?: AuthController | null;
  isStandby?: boolean;
}

/**
 * Molecule: Welcome Message (Pure 'Zen' Edition)
 * A clean, tight-packed start that waits for user interaction.
 * ACHIEVED: Dialogue-First Interaction.
 */
export function createWelcomeMessage(initialProps?: WelcomeMessageProps): NexusComponent {
    const stage = createLayoutBox({ className: "nexus-welcome-stage" });
    const container = createLayoutBox({
        id: "welcome-message",
        className: "nexus-welcome-container",
        children: [stage]
    });

    let currentProps = initialProps;

    const render = (props?: WelcomeMessageProps) => {
        const isStandby = props?.isStandby ?? false;
        
        // --- Smart Reconcile: If already drawing the same state, skip wipe
        if (stage.children.length > 0 && currentProps?.isStandby === props?.isStandby && currentProps?.authProvider === props?.authProvider) {
            return;
        }

        stage.replaceChildren();
        currentProps = { ...props };
        container.className = `nexus-welcome-container ${isStandby ? 'nexus-standby' : ''}`;
        
        // Force the portal in standby to prevent blank screens
        if (isStandby) {
            const portal = createLayoutBox({ className: "nexus-welcome-portal nexus-animate-fade-in" });
            
            // Add Welcome Content
            const intro = document.createElement("div");
            intro.className = "nexus-welcome-intro nexus-flex nexus-flex-col nexus-items-center nexus-gap-1 nexus-mb-4 nexus-text-center";
            intro.innerHTML = `
                <div>
                    <h2 class="nexus-text-lg nexus-font-black nexus-text-slate-900 nexus-tracking-tighter">開啟您的 Nexus 旅程</h2>
                    <p class="nexus-text-slate-500 nexus-text-11px nexus-max-w-xs" style="line-height:1.2;">您的智慧型 Office 助理，助您一臂之力。</p>
                </div>
            `;
            portal.appendChild(intro);

            const auth = props?.auth || null;
            portal.appendChild(createAuthGateway({ auth }).element);
            stage.appendChild(portal);
        }
    };

    render(initialProps);

    return {
        element: container,
        update: (newProps: unknown) => render(newProps as WelcomeMessageProps)
    };
}
