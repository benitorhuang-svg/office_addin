import "../styles/nexus-ui.css";
import { createAuthController } from "../services/molecules/auth-aggregator";
import { AuthController, NexusState, NexusPowerState, NexusProvider, AuthUIContext, SocketEvent } from "@shared/types";
import { SocketService } from "@services/molecules/socket-service";
import { NexusStateStore } from "@services/molecules/global-state";
import { AppOrchestrator } from "@services/organisms/AppOrchestrator";
import { RenderManager } from "@services/organisms/RenderManager";

/**
 * Page Organism: Taskpane Launcher
 * High-fidelity system bootstrap with nexus-absolute atomic structural grounding.
 */
class TaskpaneLauncher {
  private authController: AuthController | null = null;
  private isInitializing = true;

  public async boot() {
    console.log("%c[NEXUS_BOOT] Proto_X_Active", "color: #3b82f6; font-weight: bold;");
    
    // 1. Connection Lifecycle Integration
    const ctx: AuthUIContext = { 
        authStatusEl: null, 
        applyStatusEl: null, 
        historyEl: null 
    };
    
    this.authController = createAuthController(ctx, { 
        onAuthStateChanged: () => this.refreshUI() 
    });

    // 3. Initial Render (Now with valid authController)
    this.refreshUI();

    // 4. High-Level Hub Sync & Initial Auth Check
    try {
      await AppOrchestrator.syncWithServer(() => this.refreshUI());
      if (this.authController) {
        await this.authController.checkInitialAuth();
      }
    } catch { 
      console.warn("[NEXUS_BOOT] Primary Uplink Failure. Standby.");
    }
    
    this.refreshUI(); 
    
    // 4. Matrix Hardening
    setTimeout(() => {
        const loading = document.getElementById("loading-screen");
        if (loading) {
            loading.classList.add("nexus-opacity-0");
            setTimeout(() => loading.remove(), 700);
        }
        AppOrchestrator.startHealthMonitor();
        AppOrchestrator.initListeners();
    }, 500);

    // 5. Reactive Subscription Map
    NexusStateStore.subscribe((_state: NexusState) => {
        if (!this.isInitializing) this.refreshUI();
    });

    SocketService.on(SocketEvent.SYSTEM_STATE_UPDATED, (data: { power: NexusPowerState; provider: NexusProvider }) => {
        if (AppOrchestrator.getIsHomeResetting?.()) return; // Lock UI state
        if (data.power) NexusStateStore.update({ power: data.power });
        if (data.provider) NexusStateStore.setProvider(data.provider);
    });

    this.isInitializing = false;
    this.refreshUI(); // Final Genesis Sync
    console.log("%c[NEXUS] Matrix_Sync_Complete", "color: #10b981; font-weight: bold;");
  }

  private refreshUI() {
    RenderManager.renderAtomicDesign(this.authController, AppOrchestrator.getStatus().isConnected, () => this.refreshUI());
  }
}

// Initiation
Office.onReady(() => {
    new TaskpaneLauncher().boot().catch(console.error);
});
