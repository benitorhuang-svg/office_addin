import { NexusState } from "@shared/types";

/**
 * Molecule: Status Hub
 * 100% Mockup Fidelity: The central circular focal point of the dashboard.
 */
export function createStatusHub() {
    const hub = document.createElement("div");
    hub.className = "nexus-absolute nexus-left-1-2 nexus-top-4 nexus-translate-x-1-2 nexus-flex nexus-flex-col nexus-items-center nexus-z-50 nexus-animate-grand";
    
    hub.innerHTML = `
        <div class="nexus-relative nexus-w-36 nexus-h-36 status-hub-ring nexus-flex nexus-flex-col nexus-items-center nexus-justify-center nexus-p-6 nexus-text-center nexus-bg-white nexus-shadow-2xl">
            <!-- Green Inner Ring -->
            <div class="nexus-absolute nexus-inset-2 nexus-rounded-full nexus-border-1-5 nexus-border-emerald-500-10"></div>
            
            <h4 class="nexus-text-xs nexus-font-black nexus-text-slate-800 nexus-tracking-widest nexus-uppercase nexus-mb-2">System_Hub</h4>
            
            <div class="nexus-flex nexus-flex-col nexus-items-center nexus-gap-1">
                <div class="nexus-flex nexus-items-center nexus-gap-2">
                    <span class="nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-slate-400">Status:</span>
                    <span class="nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-emerald-500">Operational</span>
                </div>
                
                <div class="nexus-flex nexus-items-center nexus-gap-1.5 nexus-mt-2">
                    <div class="nexus-w-1-5 nexus-h-1-5 nexus-rounded-full nexus-bg-emerald-500 nexus-animate-pulse"></div>
                    <span class="nexus-text-9px nexus-font-black nexus-text-slate-800">98.7% ONLINE</span>
                </div>
                
                <span id="uptime-clock" class="nexus-text-9px nexus-font-bold nexus-text-slate-400 nexus-mt-1 nexus-uppercase nexus-tracking-widest">24m 18s</span>
            </div>
        </div>
    `;

    return {
        element: hub,
        update: (_state: NexusState) => {}
    };
}
