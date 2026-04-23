/**
 * Service: RenderManager
 * Orchestrator for the Atomic Design architecture.
 * RESPONSIBILITY: Mapping Global State to the Unified App Shell.
 */
import { UIRouter } from "@services/molecules/ui-router";
import { NexusStateStore } from "@services/molecules/global-state";
import { NexusPowerState, AuthController, NexusProvider, HeaderProps } from "@shared/types";
import { NEXUS_SLOTS } from "@services/atoms/layout-registry";
import { createNexusBaseLayout } from "@components/templates/nexus-base-layout";

// Organisms
import { createHeader } from "@organisms/header";
import { createWelcomeMessage } from "@molecules/welcome-message";
import { createHistoryContainer } from "@organisms/history-container";
import { createPromptOrganism, PromptOrganismProps } from "@organisms/PromptOrganism";
import { createOfflineOrganism } from "@organisms/offline";
import { AppOrchestrator } from "./AppOrchestrator";

export class RenderManager {
    /**
     * Executes the Atomic Render Pass.
     * Aligns the physical DOM with the logical state.
     */
    public static renderAtomicDesign(auth: AuthController | null, isConnected: boolean, onRefresh: () => void) {
        const state = NexusStateStore.getState();
        const isStandby = state.power !== NexusPowerState.ON;
        const provider = state.provider;
        const isCLI = state.uplinkMode === 'CLI';

        // 1. Mount the Template (Main App Shell)
        const layoutMode = !isConnected ? 'offline' : (isStandby ? 'welcome' : 'chat');
        const layoutProps = { mode: layoutMode, provider, isCLI };

        UIRouter.mountOrganism('main-template', NEXUS_SLOTS.APP_ROOT, () => createNexusBaseLayout(), layoutProps);

        // 2. Global State Sync for the Template
        UIRouter.getComponent('main-template')?.update?.(layoutProps);

        // 3. Mount Slot: HEADER
        const headerProps: HeaderProps = { 
            onClearChat: () => {
                const history = UIRouter.getComponent('history-panel');
                if (history?.clear) history.clear();
                onRefresh();
            },
            onLogout: () => auth?.logout(),
            onGoHome: async () => {
               await AppOrchestrator.triggerHomeReset(auth);
               onRefresh();
            }
        };
        UIRouter.mountOrganism('app-header', NEXUS_SLOTS.HEADER, () => createHeader(headerProps), headerProps);

        // 4. Mount Slot: ONBOARDING / WELCOME
        if (layoutMode === 'welcome') {
            const welcomeProps = { authProvider: provider, auth, isStandby: true };
            UIRouter.mountOrganism('welcome-anchor', NEXUS_SLOTS.ONBOARDING, () => createWelcomeMessage(welcomeProps), welcomeProps);
        } else if (layoutMode === 'offline') {
            const offlineProps = { onReconnect: onRefresh };
            UIRouter.mountOrganism('offline-main', NEXUS_SLOTS.ONBOARDING, () => createOfflineOrganism(offlineProps), offlineProps);
        }

        // 5. Mount Slot: HISTORY
        if (layoutMode === 'chat') {
            UIRouter.mountOrganism('history-panel', NEXUS_SLOTS.HISTORY, () => 
                createHistoryContainer({ authProvider: provider, auth, isStandby }),
                { authProvider: provider, auth, isStandby }
            );
            
            // Auto-trigger welcome if list is empty
            setTimeout(() => AppOrchestrator.ensurePreviewWelcome(), 300);
        }

        // 6. Mount Slot: PROMPT
        if (layoutMode === 'chat' && (provider !== NexusProvider.NONE || isCLI)) {
            const promptProps: PromptOrganismProps = { 
                auth, provider, isConnected, isStandby, onRefresh,
                selectedModel: state.selectedModel 
            };
            UIRouter.mountOrganism('prompt-panel', NEXUS_SLOTS.PROMPT, () => createPromptOrganism(promptProps), promptProps);
        }
    }
}
