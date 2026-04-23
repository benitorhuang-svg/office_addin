import { NexusState, NexusPowerState, NexusProvider } from "@shared/types";

type StateListener = (state: NexusState) => void;

// --- Persistence Helpers
const getStoredModel = () => localStorage.getItem("nexus_selected_model");
const setStoredModel = (m: string) => localStorage.getItem("nexus_selected_model") !== m && localStorage.setItem("nexus_selected_model", m);
const setStoredUplink = (u: string) => localStorage.getItem("nexus_uplink") !== u && localStorage.setItem("nexus_uplink", u);

/**
 * Molecule Service: NexusStateStore
 * Centralized reactive store for the application lifecycle.
 */
let state: NexusState = {
    power: NexusPowerState.STANDBY,
    provider: NexusProvider.NONE, 
    latency: 0,
    isStreaming: false,
    isServerConnected: true,
    language: 'zh',
    lastError: null,
    selectedModel: getStoredModel() || undefined,
    uplinkMode: "CLI", // Force PREVIEW initially
    attachments: [] as string[],
    enabledAttachments: [] as string[]
};

const listeners = new Set<StateListener>();

export const NexusStateStore = {
    getState(): NexusState {
        return { ...state };
    },

    update(patch: Partial<NexusState>) {
        state = { ...state, ...patch };
        
        // Broadcast
        listeners.forEach(l => l({ ...state }));

        // Persistence Sync
        if (patch.selectedModel) setStoredModel(patch.selectedModel);
        if (patch.uplinkMode) setStoredUplink(patch.uplinkMode);
    },

    // --- High-fidelity convenience methods (Restored for Orchestrator compatibility)
    setPower(on: boolean | NexusPowerState) {
        let newState: NexusPowerState;
        if (typeof on === 'boolean') {
            newState = on ? NexusPowerState.ON : NexusPowerState.OFF;
        } else {
            newState = on;
        }
        this.update({ power: newState });
    },

    setProvider(provider: NexusProvider) {
        // High-fidelity auto-modeling: Reset to default engine on provider swap
        import("@services/molecules/model-manager").then(({ ModelManager }) => {
            const models = ModelManager.getAvailableModels(provider);
            const defaultModel = ModelManager.getDefaultModel(models);
            
            // Critical Sync: Update both provider and model to maintain engine integrity
            this.update({ 
                provider, 
                selectedModel: defaultModel 
            });
        });
    },

    setServerConnected(connected: boolean) {
        this.update({ isServerConnected: connected });
    },

    subscribe(listener: StateListener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }
};

export { setStoredModel, setStoredUplink };
