import { AuthController, NexusProvider, NexusComponent } from "@shared/types";
import { ModelManager } from "@services/molecules/model-manager";
import { getStoredModel } from "@services/atoms/storage-provider";
import { AppOrchestrator } from "@services/organisms/AppOrchestrator";
import { createHistoryContainer } from "@organisms/history-container";
import { createPromptGroup } from "@molecules/prompt-group";
import { createLayoutBox } from "@atoms/LayoutBox";
import { NexusStateStore } from "@services/molecules/global-state";
import { createZenithInsightButton } from "@molecules/ZenithInsightButton";

export interface ChatOrganismProps {
    auth: AuthController | null;
    provider: NexusProvider | null;
    isConnected: boolean;
    onRefresh: () => void;
}

/**
 * Organism: MainChatOrganism
 * Declaratively assembles the chat stack.
 * REFINED: Zero Auto/Manual switch, just Default + Selected Model usage.
 */
export function createMainChatOrganism({ auth, provider, isConnected }: ChatOrganismProps): NexusComponent {
    // 1. History Layer
    const historyComp = createHistoryContainer({ authProvider: provider });
    const historyLayer = createLayoutBox({
        className: "nexus-flex nexus-flex-col nexus-flex-1 nexus-min-h-0 nexus-relative nexus-z-10",
        children: [historyComp.element]
    });

    // 2. Intelligence Layer (Prompt area / Input)
    const availableModels = ModelManager.getAvailableModels(provider);
    const selectedModel = getStoredModel() || ModelManager.getDefaultModel(availableModels);
    
    const promptComp = createPromptGroup({
        onSend: () => AppOrchestrator.handleSendMessage(auth),
        availableModels: availableModels,
        selectedModel: selectedModel,
        onModelChange: (m: string) => AppOrchestrator.handleModelChange(m),
        provider: provider,
        onProviderChange: (p) => NexusStateStore.setProvider(p),
        onLogout: () => auth?.logout(),
        isConnected: isConnected,
    });

    const promptLayer = createLayoutBox({
        className: "nexus-shrink-0 nexus-p-4 nexus-pb-10 nexus-bg-white-1 nexus-border-t nexus-border-white-5 nexus-relative nexus-z-20",
        children: [promptComp]
    });

    // 3. Main Assembly
    const container = createLayoutBox({
        className: "nexus-flex nexus-flex-col nexus-h-full nexus-w-full nexus-overflow-hidden nexus-animate-fade-in nexus-duration-700",
        children: [historyLayer, promptLayer],
        dataset: { provider: provider || "" }
    });

    // 4. Zenith FAB — mounts directly to the taskpane body (fixed position)
    const insightFab = createZenithInsightButton();
    document.body.appendChild(insightFab);

    return {
        element: container,
        destroy: () => {
            historyComp.destroy?.();
            insightFab.remove();
        }
    };
}
