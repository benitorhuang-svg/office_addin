import { createLayoutBox } from "@atoms/LayoutBox";
import { NexusStateStore } from "@services/molecules/global-state";

export interface StatusHUDProps {
    isConnected: boolean;
}

/**
 * Molecule: StatusHUD — Industrial Telemetry Bar
 *
 * Displays real-time metrics from the last streaming turn:
 *   • Uplink status (connected / standby)
 *   • Tokens/sec — live generation speed
 *   • TTFT — time to first token in ms
 *   • Active persona / preset label
 *
 * Subscribes to NexusStateStore so values update without re-mounting.
 */
export function createStatusHUD({ isConnected }: StatusHUDProps): HTMLElement {
    // ── Uplink indicator ─────────────────────────────────────────────────────
    const pulse = createLayoutBox({
        className: `w-2 h-2 nexus-rounded-full ${isConnected ? "bg-blue-500 nexus-animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.8)]" : "nexus-bg-red-500"}`
    });

    const ping = isConnected ? createLayoutBox({
        className: "nexus-absolute nexus-inset-0 w-2 h-2 nexus-rounded-full nexus-bg-blue-400 animate-ping"
    }) : null;

    const matrix = createLayoutBox({
        className: "nexus-relative nexus-flex nexus-items-center nexus-justify-center",
        children: ping ? [pulse, ping] : [pulse]
    });

    const uplinkLabel = document.createElement('span');
    uplinkLabel.className = "nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-widest font-mono";
    uplinkLabel.textContent = isConnected ? "NEXUS_UPLINK: ACTIVE" : "UPLINK: STANDBY";

    const uplinkStack = createLayoutBox({
        className: "nexus-flex nexus-items-center nexus-gap-2",
        children: [matrix, uplinkLabel]
    });

    // ── Telemetry metrics ────────────────────────────────────────────────────
    const makeStat = (id: string, icon: string, init: string): HTMLElement => {
        const el = document.createElement('span');
        el.id = id;
        el.className = "nexus-flex nexus-items-center nexus-gap-1 nexus-text-tiny nexus-font-mono nexus-text-slate-400";
        el.innerHTML = `<span class="nexus-opacity-60">${icon}</span><span class="stat-val">${init}</span>`;
        return el;
    };

    const tpsEl = makeStat('hud-tps', '⚡', '--');
    const ttftEl = makeStat('hud-ttft', '🧠', '--');
    const personaEl = makeStat('hud-persona', '🤖', '—');

    const divider = () => {
        const d = document.createElement('span');
        d.className = 'nexus-text-slate-600 nexus-opacity-30';
        d.textContent = '|';
        return d;
    };

    const telemetryRow = createLayoutBox({
        className: "nexus-flex nexus-items-center nexus-gap-2 nexus-border-l nexus-border-white-5 nexus-pl-3 nexus-ml-1",
        children: [tpsEl, divider(), ttftEl, divider(), personaEl]
    });

    // ── Subscribe to live updates ─────────────────────────────────────────────
    NexusStateStore.subscribe((state) => {
        const setVal = (el: HTMLElement, val: string) => {
            const v = el.querySelector<HTMLElement>('.stat-val');
            if (v) v.textContent = val;
        };
        if (state.tokensPerSec !== undefined) {
            setVal(tpsEl, state.tokensPerSec > 0 ? `${state.tokensPerSec} t/s` : '--');
        }
        if (state.ttft !== undefined) {
            setVal(ttftEl, state.ttft >= 0 ? `${state.ttft}ms` : '--');
        }
        if (state.activePersona !== undefined) {
            setVal(personaEl, state.activePersona || '—');
        }
    });

    // ── Container ────────────────────────────────────────────────────────────
    return createLayoutBox({
        className: `nexus-flex nexus-items-center nexus-gap-3 nexus-px-4 nexus-py-2 nexus-rounded-2xl nexus-border nexus-transition-all nexus-duration-700 ${
            isConnected
                ? "bg-blue-500/5 border-blue-500/10 nexus-text-blue-400"
                : "nexus-bg-red-500/5 border-red-500/10 text-red-500"
        }`,
        children: [uplinkStack, telemetryRow]
    });
}

