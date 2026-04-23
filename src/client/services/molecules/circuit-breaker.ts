import { NexusProvider } from "../atoms/types";
import { NexusStateStore } from "./global-state";

/**
 * Molecule: Circuit Breaker
 * Monitors provider health and triggers automatic fallback.
 */
export class CircuitBreaker {
    private static failures: Map<NexusProvider, number> = new Map();
    private static readonly FAILURE_THRESHOLD = 3;
    private static readonly FALLBACK_MAP: Partial<Record<NexusProvider, NexusProvider>> = {
        [NexusProvider.GEMINI_CLI]: NexusProvider.GEMINI_API,
        [NexusProvider.COPILOT_CLI]: NexusProvider.COPILOT_SDK,
        [NexusProvider.GEMINI_API]: NexusProvider.NONE,
        [NexusProvider.COPILOT_SDK]: NexusProvider.NONE,
        [NexusProvider.AZURE_BYOK]: NexusProvider.NONE,
        [NexusProvider.REMOTE_CLI]: NexusProvider.GEMINI_API,
        [NexusProvider.NONE]: NexusProvider.NONE
    };

    public static recordFailure(provider: NexusProvider) {
        const count = (this.failures.get(provider) || 0) + 1;
        this.failures.set(provider, count);
        console.warn(`[CircuitBreaker] Provider ${provider} failure count: ${count}`);

        if (count >= this.FAILURE_THRESHOLD) {
            this.trip(provider);
        }
    }

    public static recordSuccess(provider: NexusProvider) {
        this.failures.delete(provider);
    }

    private static trip(provider: NexusProvider) {
        const fallback = this.FALLBACK_MAP[provider] || NexusProvider.NONE;
        console.error(`[CircuitBreaker] Tripped for ${provider}. Falling back to ${fallback}`);
        
        if (fallback !== NexusProvider.NONE) {
            NexusStateStore.setProvider(fallback);
            // Optionally notify user
        }
        
        this.failures.delete(provider); // Reset for the next cycle
    }
}
