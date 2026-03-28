import { NexusStateStore } from "@services/molecules/global-state";
import { NexusPowerState, NexusProvider, AuthController } from "@shared/types";
import { getHealth } from "@services/organisms/api-orchestrator";

/**
 * Molecule Service: Session Manager
 * Orchestrates server synchronization, connectivity monitoring, and the Home Reset stability gate.
 * Standardized to ensure deterministic identity selection across all providers.
 */
export class SessionManager {
    private static isConnected: boolean = false;
    private static isHomeResetting: boolean = false;
    private static stabilityTimeout: any = null;
    private static healthInterval: number | null = null;

    public static async syncState(onSuccess?: () => void) {
        try {
            const { resolveLocalApiUrl: resolveApi } = await import("../molecules/local-server-resolver");
            const { fetchWithTimeout } = await import("../atoms/api-client");
            
            const url = await resolveApi("/api/system/state");
            const res = await fetchWithTimeout(url, { method: "GET" }, 2500);
            
            if (!res.ok) throw new Error(`HTTP_ERROR: ${res.status}`);
            const serverState = await res.json();
            
            if (this.isHomeResetting) {
                console.log("[SYSTEM] 🧘 sync_silenced_during_reset");
                return;
            }
            
            NexusStateStore.update({ 
                power: serverState.power,
                uplinkMode: serverState.uplinkMode || 'CLI' // Sync APC/CLI mode from server
            });
            if (serverState.provider) NexusStateStore.setProvider(serverState.provider);
            
            this.isConnected = true;
            NexusStateStore.setServerConnected(true);
            onSuccess?.();
        } catch (e: unknown) {
            this.isConnected = false;
            NexusStateStore.setServerConnected(false);
            console.warn(`[SessionManager] Sync Failure`);
        }
    }

    public static startMonitoring() {
        if (this.healthInterval) return;
        const check = async () => {
            try {
                const health = await getHealth();
                if (health.status === 'ok' && !this.isConnected) {
                    this.isConnected = true;
                    NexusStateStore.setServerConnected(true);
                }
            } catch {
                if (this.isConnected) {
                    this.isConnected = false;
                    NexusStateStore.setServerConnected(false);
                }
            }
        };
        check();
        this.healthInterval = window.setInterval(check, 15000) as unknown as number;
    }

    public static async resetHome(auth?: AuthController | null, onResetDone?: () => void) {
        console.log("%c[SYSTEM] 🌈 initiating_deterministic_home_reset", "color: #3b82f6; font-weight: bold;");
        
        if (this.stabilityTimeout) clearTimeout(this.stabilityTimeout);
        this.isHomeResetting = true;
        
        if (auth) {
            try { await auth.logout(); } catch (e) { console.warn("[SessionManager] logout_failed", e); }
        }

        NexusStateStore.update({ 
            power: NexusPowerState.STANDBY, 
            provider: NexusProvider.NONE,
            uplinkMode: 'CLI',
            isExcelActive: false,
            isStreaming: false,
            attachments: [],
            enabledAttachments: [],
            lastError: null
        });

        onResetDone?.();

        this.stabilityTimeout = setTimeout(() => { 
            this.isHomeResetting = false; 
            this.stabilityTimeout = null;
            console.log("[SYSTEM] 🌈 reset_stabilized");
        }, 1500);
    }

    public static getIsHomeResetting() { return this.isHomeResetting; }

    public static unlockReset() {
        if (this.isHomeResetting) {
            console.log("[SessionManager] 🔓 force_unlock_stability_gate");
            this.isHomeResetting = false;
        }
    }

    public static getConnectedStatus() { return this.isConnected; }
}
