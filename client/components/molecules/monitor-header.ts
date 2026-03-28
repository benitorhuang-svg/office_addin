import { NexusPowerState, NexusState } from "@shared/types";

export interface MonitorHeaderProps {
    onAuth: () => void;
    onSession: () => void;
    onTheme: () => void;
    onPatch: () => void;
    onWarmup: () => void;
}

/**
 * Molecule: Monitor Header (Zen Edition)
 * "Less is More" - A high-fidelity, uncluttered focal point.
 */
export function createMonitorHeader(props: MonitorHeaderProps) {
    const header = document.createElement("div");
    header.id = "nexus-zen-header";
    header.className = "nexus-flex nexus-items-center nexus-justify-between nexus-w-full nexus-h-full nexus-animate-spring";
    
    header.innerHTML = `
        <!-- Luxury Branding & Global Status Hub -->
        <div class="nexus-flex nexus-items-center nexus-gap-12">
            <div class="brand-logo nexus-flex nexus-items-center nexus-gap-5 nexus-group nexus-cursor-default">
                <div class="nexus-w-2-5 nexus-h-8 nexus-bg-leaf-green nexus-rounded-full nexus-shadow-leaf-green nexus-group-hover:nexus-scale-y-125 nexus-transition-all nexus-duration-500"></div>
                <div class="nexus-flex nexus-flex-col">
                    <h1 class="nexus-text-17px nexus-font-black nexus-uppercase nexus-tracking-ultra-wide nexus-text-slate-900 nexus-leading-none">Nexus</h1>
                    <span class="nexus-text-tiny nexus-font-bold nexus-uppercase nexus-tracking-wide-4 nexus-text-leaf-green nexus-opacity-40 nexus-mt-1">Industrial_Precision</span>
                </div>
            </div>
            
            <div id="status-chip" class="nexus-px-5 nexus-py-2 nexus-rounded-full nexus-bg-white-60 nexus-border nexus-border-slate-100 nexus-shadow-sm nexus-flex nexus-items-center nexus-gap-3 nexus-animate-spring">
                <div id="status-pulse" class="nexus-w-2 nexus-h-2 nexus-rounded-full nexus-bg-leaf-green nexus-shadow-leaf-green"></div>
                <div class="nexus-flex nexus-flex-col">
                   <span id="status-text" class="nexus-text-9px nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-slate-800">System_Alive</span>
                   <span class="nexus-text-tiny nexus-font-bold nexus-uppercase nexus-tracking-widest nexus-text-slate-400">Ver_7.5_Uplink</span>
                </div>
            </div>
        </div>

        <!-- Action Cluster (High-Fidelity) -->
        <div class="nexus-flex nexus-items-center nexus-gap-6">
            <!-- Main Power Toggle (Clean Ring Style) -->
            <button id="main-power-btn" class="spring-button nexus-flex nexus-items-center nexus-gap-4 nexus-px-8 nexus-py-3-5 nexus-rounded-full nexus-group nexus-cursor-pointer nexus-border-none nexus-bg-white-80 nexus-shadow-lg hover:shadow-leaf-green">
                <div class="nexus-relative nexus-w-4 nexus-h-4 nexus-flex nexus-items-center nexus-justify-center">
                    <div class="nexus-absolute nexus-inset-0 nexus-rounded-full nexus-border-2 nexus-border-leaf-green nexus-opacity-20"></div>
                    <div id="power-indicator" class="nexus-w-1-5 nexus-h-1-5 nexus-rounded-full nexus-bg-leaf-green nexus-shadow-leaf-green"></div>
                </div>
                <span id="power-label" class="nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-slate-800">Uplink_Established</span>
            </button>

            <!-- Advanced Control Gear (Refined Refraction) -->
            <div class="nexus-relative nexus-group-menu">
                <button class="nexus-p-3-5 nexus-rounded-full hover:nexus-bg-white nexus-text-slate-400 hover:text-leaf-green nexus-transition-all nexus-shadow-sm hover:shadow-md nexus-cursor-pointer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </button>
                
                <div class="nexus-absolute nexus-right-0 nexus-top-full nexus-mt-4 nexus-w-56 glass-card nexus-p-3 nexus-hidden nexus-group-hover-menu:nexus-block nexus-animate-spring nexus-z-100 nexus-border-none nexus-shadow-2xl">
                    <button id="zen-theme-btn" class="nexus-w-full nexus-text-left nexus-p-4 hover:nexus-bg-slate-50 nexus-rounded-2xl nexus-text-tiny nexus-uppercase nexus-font-black nexus-tracking-widest nexus-text-slate-600 nexus-flex nexus-items-center nexus-gap-4 nexus-transition-all nexus-cursor-pointer">
                        <span class="nexus-w-2-5 nexus-h-2-5 nexus-rounded-full nexus-border-2 nexus-border-slate-300"></span> Aesthetics_Shift
                    </button>
                    <button id="zen-patch-btn" class="nexus-w-full nexus-text-left nexus-p-4 hover:bg-rose-50 nexus-rounded-2xl nexus-text-tiny nexus-uppercase nexus-font-black nexus-tracking-widest nexus-text-red-500 nexus-flex nexus-items-center nexus-gap-4 nexus-transition-all nexus-cursor-pointer">
                        <div class="nexus-w-2-5 nexus-h-2-5 nexus-rounded-full nexus-bg-red-500 nexus-shadow-red"></div> Engine_Restore
                    </button>
                    <button id="zen-warm-btn" class="nexus-w-full nexus-text-left nexus-p-4 hover:bg-amber-50 nexus-rounded-2xl nexus-text-tiny nexus-uppercase nexus-font-black nexus-tracking-widest nexus-text-amber-500 nexus-flex nexus-items-center nexus-gap-4 nexus-transition-all nexus-cursor-pointer">
                        <div class="nexus-w-2-5 nexus-h-2-5 nexus-rounded-full nexus-bg-amber-500 nexus-shadow-amber"></div> Station_Warmup
                    </button>
                </div>
            </div>
        </div>
    `;

    header.querySelector("#main-power-btn")?.addEventListener("click", props.onSession);
    header.querySelector("#zen-theme-btn")?.addEventListener("click", props.onTheme);
    header.querySelector("#zen-patch-btn")?.addEventListener("click", props.onPatch);
    header.querySelector("#zen-warm-btn")?.addEventListener("click", props.onWarmup);

    return {
        element: header,
        update: (state: NexusState) => {
            const isOn = state.power === NexusPowerState.ON;
            const powerLabel = header.querySelector("#power-label") as HTMLElement;
            const powerBtn = header.querySelector("#main-power-btn") as HTMLElement;
            const statusText = header.querySelector("#status-text") as HTMLElement;
            const statusPulse = header.querySelector("#status-pulse") as HTMLElement;

            if (powerLabel && powerBtn) {
                powerLabel.innerText = isOn ? "System_Alive" : "Connect_System";
                powerBtn.classList.toggle("active", isOn);
            }

            if (statusText && statusPulse) {
                if (state.isStreaming) {
                    statusText.innerText = "Processing...";
                    statusPulse.className = "nexus-w-1-5 nexus-h-1-5 nexus-rounded-full nexus-bg-red-400 nexus-animate-ping";
                    statusText.className = "nexus-text-8px nexus-font-bold nexus-uppercase nexus-tracking-widest nexus-text-red-500";
                } else {
                    statusText.innerText = isOn ? "Online" : "Standby";
                    statusPulse.className = `nexus-w-1-5 nexus-h-1-5 nexus-rounded-full ${isOn ? 'nexus-bg-leaf-green' : 'nexus-bg-slate-300'} nexus-animate-pulse`;
                    statusText.className = `nexus-text-8px nexus-font-bold nexus-uppercase nexus-tracking-widest ${isOn ? 'nexus-text-leaf-green' : 'nexus-text-slate-400'}`;
                }
            }
        }
    };
}
