export function createActivityLog() {
    const container = document.createElement("div");
    container.className = "nexus-flex-1 nexus-flex nexus-flex-col nexus-min-h-0 nexus-relative nexus-overflow-hidden nexus-bg-black-20 nexus-backdrop-blur-3xl";
    
    container.innerHTML = `
        <div class="nexus-flex nexus-items-center nexus-justify-between nexus-px-6 nexus-py-4 nexus-border-b nexus-border-white-5 nexus-bg-white nexus-opacity-2">
            <h3 class="nexus-text-9px nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-slate-500 nexus-font-mono">Relay_Console</h3>
            <button id="clear-btn" class="nexus-p-2 nexus-text-slate-600 hover:text-red-400 nexus-active-scale-95 nexus-transition-all nexus-cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M3 6h18M19 6 v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
        <div id="log-content" class="nexus-flex-1 nexus-p-6 nexus-space-y-3 nexus-overflow-y-auto nexus-scrollbar-none nexus-font-mono">
            <!-- Entries injected here -->
        </div>
    `;

    const logEl = container.querySelector("#log-content") as HTMLElement;
    const clearBtn = container.querySelector("#clear-btn");

    const addEntry = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
        if (!logEl) return;
        
        const entry = document.createElement("div");
        const colors = { 
            info: 'nexus-text-blue-400 nexus-opacity-60', 
            success: 'nexus-text-emerald-400 nexus-opacity-70', 
            error: 'nexus-text-red-400 nexus-opacity-80' 
        };
        
        entry.className = `nexus-flex nexus-items-start nexus-gap-4 nexus-animate-in slide-in-from-left-4 nexus-duration-300 hover:nexus-bg-white nexus-opacity-5 nexus-py-1 nexus-px-2 nexus-rounded-lg nexus-transition-colors nexus-border-l-2 nexus-border-transparent hover:border-blue-500 nexus-opacity-20`;
        entry.innerHTML = `
            <span class="nexus-text-tiny nexus-text-slate-700 nexus-shrink-0 nexus-tabular-nums nexus-font-mono">[${new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
            <div class="nexus-flex-1">
                <span class="${colors[type]} nexus-text-9px nexus-font-mono nexus-tracking-tighter">${msg}</span>
            </div>
        `;
        
        logEl.prepend(entry);
        if (logEl.children.length > 100) logEl.lastElementChild?.remove();
    };

    setTimeout(() => {
        addEntry("STATION_INITIALIZED", "success");
        addEntry("UPLINK_ESTABLISHED", "info");
        addEntry("SECURITY_UPLINK_READY", "success");
    }, 200);

    clearBtn?.addEventListener("click", () => {
        if (logEl) {
            logEl.innerHTML = "";
            addEntry("RELAY_BUFFER_PURGED", "info");
        }
    });

    return {
        element: container,
        addEntry
    };
}
