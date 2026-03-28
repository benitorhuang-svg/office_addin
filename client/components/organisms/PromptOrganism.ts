import { AuthController, NexusProvider, NexusComponent } from "@shared/types";
import { ModelManager } from "@services/molecules/model-manager";
import { AppOrchestrator } from "@services/organisms/AppOrchestrator";
import { createPromptGroup } from "@molecules/prompt-group";
import { createLayoutBox } from "@atoms/LayoutBox";
import { NexusStateStore } from "@services/molecules/global-state";

export interface PromptOrganismProps {
    auth: AuthController | null;
    provider: NexusProvider | null;
    isConnected: boolean;
    isStandby: boolean;
    onRefresh: () => void;
    selectedModel?: string;
}

/**
 * Organism: PromptOrganism
 * Manages the AI input area, including Dual-Dropdowns for Uplink and Model.
 * Handles internal reconciliation to prevent unnecessary re-renders.
 * ACHIEVED: Reactive Environment Switching.
 */
export function createPromptOrganism(props: PromptOrganismProps): NexusComponent {
    const container = createLayoutBox({
        id: "nexus-prompt-container",
        className: "nexus-w-full nexus-transition-all nexus-duration-500 nexus-animate-spring"
    });
    
    // Initial Render Pass
    let currentProvider = props.provider;
    let currentConnected = props.isConnected;
    let currentModel = props.selectedModel;
    let currentStreaming = NexusStateStore.getState().isStreaming;

    renderContents(container, props);

    return {
        element: container,
        update: (props: unknown) => {
            if (!props) return; 
            
            const next = props as PromptOrganismProps;
            const state = NexusStateStore.getState();
            const modelChanged = next.selectedModel !== currentModel;
            const streamingChanged = state.isStreaming !== currentStreaming;

            // Only re-probe if provider, session status, standby state, model, or streaming changed
            if (next.provider !== currentProvider || next.isConnected !== currentConnected || next.isStandby !== (next.isStandby ?? false) || modelChanged || streamingChanged) {
                currentProvider = next.provider;
                currentConnected = next.isConnected;
                currentModel = next.selectedModel;
                currentStreaming = state.isStreaming;

                // Toggle visibility based on standby state
                if (next.isStandby) {
                    container.classList.add('nexus-hidden');
                } else {
                    container.classList.remove('nexus-hidden');
                }

                renderContents(container, next);
            }
        }
    };
}

function renderContents(container: HTMLElement, props: PromptOrganismProps) {
    container.replaceChildren(); 
    
    const state = NexusStateStore.getState();
    const models = ModelManager.getAvailableModels(props.provider);
    const selectedModel = state.selectedModel || ModelManager.getDefaultModel(models);
    
    const nexusGroup = createPromptGroup({
        onSend: () => AppOrchestrator.handleSendMessage(props.auth),
        onStop: () => AppOrchestrator.handleStopConversation(),
        availableModels: models,
        selectedModel: selectedModel,
        onModelChange: (m: string) => AppOrchestrator.handleModelChange(m),
        provider: props.provider,
        onProviderChange: (p) => NexusStateStore.setProvider(p),
        onLogout: () => props.auth?.logout(),
        isConnected: props.isConnected,
        isStandby: props.isStandby,
        isStreaming: state.isStreaming
    });

    container.appendChild(nexusGroup);
}
