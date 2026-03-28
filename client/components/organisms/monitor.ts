/**
 * Organism: Nexus Ultra-Grand Monitor (Prestige Edition)
 * High-fidelity implementation with staggered animations and luxury glassmorphism.
 */
import { createActivityLog } from "@molecules/activity-log";
import { AuthController, NexusComponent } from "@shared/types";
import { createMetricItem } from "@molecules/MetricItem";
import { createStatusHub } from "@molecules/StatusHub";
import { StitchConnector } from "@services/organisms/StitchConnector";

export interface MonitorOrganismProps {
    auth: AuthController | null;
}

export function createMonitorOrganism(_props: MonitorOrganismProps): NexusComponent {
    // Force Prestige Styles
    if (!document.getElementById("nexus-prestige-styles")) {
        const link = document.createElement("link");
        link.id = "nexus-prestige-styles";
        link.rel = "stylesheet";
        link.href = "styles/spring-bloom.css";
        document.head.appendChild(link);
    }

    const container = document.createElement("div");
    container.id = "nexus-monitor-root";
    container.className = "nexus-flex nexus-h-screen nexus-w-full nexus-font-outfit nexus-relative nexus-overflow-hidden nexus-grand-root nexus-p-0";

    // --- 0. Absolute Floating Status Hub ---
    const hub = createStatusHub();
    hub.element.style.animation = "prestige-reveal 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards";
    container.appendChild(hub.element);

    // --- 1. Sidebar (Premium Control Deck) ---
    const sidebar = document.createElement("aside");
    sidebar.className = "nexus-w-440 nexus-shrink-0 nexus-h-full nexus-flex nexus-flex-col nexus-py-24 nexus-px-20 nexus-z-20 nexus-border-r nexus-border-slate-100-30 nexus-relative nexus-bg-white-30 nexus-backdrop-blur-3xl nexus-transition-all nexus-duration-1000";
    
    // Logo Group
    const brand = document.createElement("div");
    brand.className = "nexus-mb-40 nexus-flex nexus-items-center nexus-gap-10 nexus-animate-grand";
    brand.style.animationDelay = "0.1s";
    brand.innerHTML = `
        <div class="nexus-w-10 nexus-h-10 nexus-bg-blue-600 nexus-rounded-full nexus-shadow-blue-glow"></div>
        <div class="nexus-flex nexus-flex-col">
            <h1 class="nexus-text-h1-large nexus-uppercase nexus-tracking-widest nexus-text-slate-900 nexus-leading-none nexus-mb-3 nexus-mr-minus-1-3">Nexus</h1>
            <span class="nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-blue-500-50">Industrial_Precision</span>
        </div>
    `;
    sidebar.appendChild(brand);

    const createNavBtn = (icon: string, label: string, sub: string, color: string, active: boolean = false) => {
        const btn = document.createElement("div");
        btn.className = `nexus-flex nexus-items-center nexus-gap-8 nexus-cursor-pointer nexus-group nexus-transition-all nexus-duration-500 nexus-hover-translate-x-3`;
        btn.innerHTML = `
            <div class="nexus-w-18 nexus-h-18 nexus-rounded-32px ${color} ${active ? 'nexus-shadow-2xl' : 'nexus-opacity-40 nexus-group-hover-nexus-opacity-100'} nexus-flex nexus-items-center nexus-justify-center nexus-text-white nexus-transition-all nexus-duration-700 nexus-group-hover-rotate-6 nexus-group-hover-scale-110">
                ${icon}
            </div>
            <div class="nexus-flex nexus-flex-col">
                <span class="nexus-text-body nexus-font-black nexus-text-slate-800 nexus-uppercase nexus-tracking-widest nexus-leading-none nexus-transition-colors nexus-group-hover-nexus-text-blue-600">${label}</span>
                <span class="nexus-text-tiny nexus-font-bold nexus-text-slate-400 nexus-uppercase nexus-tracking-widest nexus-mt-2">${sub}</span>
            </div>
        `;
        return btn;
    };

    const iconHome = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
    const iconChart = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>`;

    const sideNav = document.createElement("div");
    sideNav.className = "nexus-flex nexus-flex-col nexus-gap-14";
    sideNav.appendChild(createNavBtn(iconHome, "Overview", "HOME_STATION", "nexus-bg-blue-600 nexus-shadow-blue-300-50 nexus-icon-glow-blue", true));
    sideNav.appendChild(createNavBtn(iconChart, "System Monitor", "DATA_PULSE", "nexus-bg-emerald-500 nexus-shadow-emerald-300-50 nexus-icon-glow-emerald"));
    sidebar.appendChild(sideNav);

    // --- 2. Main Workspace ---
    const mainframe = document.createElement("main");
    mainframe.className = "nexus-flex-1 nexus-flex nexus-flex-col nexus-h-screen nexus-z-10 nexus-overflow-hidden nexus-bg-white-20 nexus-relative";

    const topBar = document.createElement("header");
    topBar.className = "nexus-h-56 nexus-px-24 nexus-flex nexus-items-end nexus-pb-16 nexus-justify-between nexus-z-40";
    
    const navGroup = document.createElement("div");
    navGroup.className = "nexus-flex nexus-items-center nexus-gap-16 nexus-animate-grand";
    navGroup.style.animationDelay = "0.2s";
    
    const pillBtn = document.createElement("button");
    pillBtn.className = "nexus-px-16 nexus-py-7 nexus-bg-white nexus-shadow-blue-pulse nexus-rounded-full nexus-text-15px nexus-font-black nexus-uppercase nexus-text-slate-900 nexus-tracking-widest nexus-border nexus-border-blue-50-50 nexus-transform nexus-hover-scale-110 nexus-transition-all nexus-hover-bg-blue-50-50";
    pillBtn.textContent = "Overview";
    navGroup.appendChild(pillBtn);
    
    ["Services", "Security", "Reports"].forEach(text => {
        const btn = document.createElement("button");
        btn.className = "nexus-text-15px nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-slate-400 nexus-hover-text-slate-900 nexus-transition-all nexus-duration-700 nexus-hover--translate-y-1";
        btn.textContent = text;
        navGroup.appendChild(btn);
    });

    const searchBar = document.createElement("div");
    searchBar.className = "nexus-flex nexus-items-center nexus-gap-8 nexus-bg-white-90 nexus-p-6 nexus-rounded-full nexus-border nexus-border-slate-100 nexus-px-14 nexus-backdrop-blur-2xl nexus-shadow-glass nexus-group-search nexus-transition-all nexus-hover-shadow-blue-pulse nexus-hover-border-blue-200 nexus-animate-grand";
    searchBar.style.animationDelay = "0.3s";
    searchBar.innerHTML = `
         <input type="text" placeholder="SEARCH SYSTEM..." class="nexus-bg-transparent nexus-border-none nexus-outline-none nexus-text-13px nexus-font-black nexus-text-slate-900 nexus-w-72 nexus-placeholder-slate-300 nexus-tracking-widest nexus-uppercase">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" class="nexus-text-slate-400 nexus-group-hover-nexus-text-blue-600 nexus-transition-colors"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
    `;

    
    topBar.appendChild(navGroup);
    topBar.appendChild(searchBar);
    mainframe.appendChild(topBar);

    const scrollArea = document.createElement("div");
    scrollArea.className = "nexus-flex-1 nexus-overflow-y-auto nexus-px-24 nexus-pb-24 nexus-custom-scrollbar";

    const perfTitle = document.createElement("h4");
    perfTitle.className = "nexus-text-xs nexus-font-black nexus-text-slate-400 nexus-uppercase nexus-tracking-widest nexus-mb-20 nexus-opacity-30 nexus-mt-6 nexus-animate-grand";
    perfTitle.style.animationDelay = "0.4s";
    perfTitle.innerText = "Performance Grid Matrix";
    scrollArea.appendChild(perfTitle);

    const nexusGrid = document.createElement("div");
    nexusGrid.className = "nexus-wide-grid nexus-pb-32";
    
    const iconSat = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 7 9 3 5 7l4 4ZM17 11l4 4-4 4-4-4ZM4.5 15.5l2 2ZM11.5 8.5l2 2ZM13 15l-2-2ZM18.5 4.5l-2 2"/></svg>`;
    const iconWave = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12a10 10 0 0 1 10-10 10 10 0 0 1 10 10M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5"/></svg>`;
    const iconHeat = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M16 7l-4-4-4 4M16 17l-4 4-4-4"/></svg>`;
    const iconMem = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M6 14h12M14 6v12M10 6v12M6 10h12"/></svg>`;

    const uplink = createMetricItem({ label: "Uplink Relay", value: "8.5", unit: "Gbps", icon: iconSat, colorClass: "nexus-text-blue-600", progress: 94, statusText: "Stable" });
    const latency = createMetricItem({ label: "Fluid Latency", value: "12", unit: "ms", icon: iconWave, colorClass: "nexus-text-emerald-500", progress: 12, statusText: "Low" });
    const flux = createMetricItem({ label: "AI Flux Heat", value: "39", unit: "°C", icon: iconHeat, colorClass: "nexus-text-amber-500", progress: 39, statusText: "Stable" });
    const memory = createMetricItem({ label: "Core Memory", value: "3.2", unit: "TB / 16 TB", icon: iconMem, colorClass: "nexus-text-violet-500", progress: 19, statusText: "Stable" });

    [uplink, latency, flux, memory].forEach((item, i) => {
        item.element.style.animationDelay = `${0.5 + i * 0.15}s`;
        item.element.classList.add('nexus-animate-grand');
        nexusGrid.appendChild(item.element);
    });

    scrollArea.appendChild(nexusGrid);
    const log = createActivityLog();
    scrollArea.appendChild(log.element);
    mainframe.appendChild(scrollArea);

    container.appendChild(sidebar);
    container.appendChild(mainframe);

    const updateStats = async () => {
        try {
            const data = (await StitchConnector.fetchPerformancePulse()) as Record<string, number>;
            uplink.update(data.uplink.toFixed(1), data.uplink);
            latency.update(data.latency.toString(), data.latency);
            flux.update(data.fluxHeat.toString(), data.fluxHeat);
            memory.update(data.coreMemory.toFixed(1), data.coreMemory);
        } catch {}
    };
    const timer = window.setInterval(updateStats, 3000);

    return {
        element: container,
        update: () => {}, 
        destroy: () => clearInterval(timer)
    };
}
