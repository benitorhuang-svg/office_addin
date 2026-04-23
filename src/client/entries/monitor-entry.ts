import "../styles/nexus-ui.css";
import { createMonitorOrganism } from "../components/organisms/monitor";
import { AppOrchestrator } from "@services/organisms/AppOrchestrator";
import { NexusStateStore } from "@services/molecules/global-state";
import { NexusState, SocketEvent, NexusPowerState, NexusProvider } from "@shared/types";
import { SocketService } from "@services/molecules/socket-service";

/**
 * Page Organism: Standalone Monitor Launcher
 * Decoupled from Office.js for Dockerized/Headless monitoring.
 */
class MonitorLauncher {
  public async boot() {
    console.log("%c[NEXUS_MONITOR] HUD_Active", "color: #3b82f6; font-weight: bold;");
    
    // 1. Target container
    const root = document.getElementById("nexus-monitor-root-container");
    if (!root) return;

    // 2. Initialize Monitor Organism
    // Note: auth is null here as we are in a standalone monitor mode 
    // where keys are usually managed by Docker ENV on the server side.
    const monitor = createMonitorOrganism({ auth: null });
    root.appendChild(monitor.element);

    // 3. Sync with Server
    try {
      await AppOrchestrator.syncWithServer(() => {
        if (monitor.update) monitor.update({});
      });
      AppOrchestrator.startHealthMonitor();
    } catch { 
      console.warn("[NEXUS_MONITOR] Uplink Probing...");
    }

    // 4. Reactive Updates
    NexusStateStore.subscribe((state: NexusState) => {
        if (monitor.update) monitor.update(state);
    });

    SocketService.on(SocketEvent.SYSTEM_STATE_UPDATED, (data: { power?: NexusPowerState; provider?: NexusProvider; isStreaming?: boolean }) => {
        if (data.power !== undefined) NexusStateStore.setPower(data.power);
        if (data.provider) NexusStateStore.setProvider(data.provider);
        if (typeof data.isStreaming === "boolean") NexusStateStore.update({ isStreaming: data.isStreaming });
    });

    console.log("%c[NEXUS_MONITOR] Matrix_Link_Established", "color: #10b981; font-weight: bold;");
  }
}

// Global initiation
new MonitorLauncher().boot().catch(console.error);
