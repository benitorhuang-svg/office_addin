/**
 * Organism: WelcomeScreen
 * The premium entry portal for modern AI-assisted editing.
 */
import { createTypography } from "@atoms/Typography";
import { createIcon, type IconName } from "@atoms/Icon";

export interface WelcomeScreenProps {
    onStartLive?: () => void;
    onStartPreview?: () => void;
}

export function createWelcomeScreen({ onStartLive, onStartPreview }: WelcomeScreenProps) {
    const container = document.createElement("div");
    container.className = "nexus-flex nexus-flex-col nexus-items-center nexus-justify-center nexus-h-screen nexus-w-full nexus-px-8 nexus-py-12 nexus-bg-white nexus-animate-fade-in";

    // 1. Heritage Header
    const header = document.createElement("header");
    header.className = "nexus-text-center nexus-mb-14";
    
    const logoArea = document.createElement("div");
    logoArea.className = "nexus-w-16 nexus-h-16 nexus-mx-auto nexus-mb-8 nexus-flex nexus-items-center nexus-justify-center nexus-rounded-3xl nexus-bg-brand-blue-50 nexus-text-brand-blue nexus-shadow-brand-soft nexus-animate-spring";
    logoArea.appendChild(createIcon({ name: "gemini", size: 32 }));

    const titleSec = document.createElement("div");
    titleSec.className = "nexus-flex nexus-flex-col nexus-gap-2";
    titleSec.appendChild(createTypography({ variant: "h1", text: "NEXUS CENTER", className: "nexus-text-h1-extrabold nexus-tracking-tighter nexus-text-slate-950" }));
    titleSec.appendChild(createTypography({ variant: "mono-label", text: "INDUSTRIAL_EDIT_V6.0", className: "nexus-text-slate-400 nexus-opacity-60" }));

    header.appendChild(logoArea);
    header.appendChild(titleSec);

    // 2. Value Lattice
    const lattice = document.createElement("div");
    lattice.className = "nexus-w-full nexus-max-w-320 nexus-flex nexus-flex-col nexus-gap-6 nexus-mb-16";

    const createFeature = (icon: IconName, title: string, sub: string) => {
        const item = document.createElement("div");
        item.className = "nexus-flex nexus-items-start nexus-gap-4 nexus-p-5 nexus-bg-slate-50-30 nexus-rounded-2xl nexus-border nexus-border-slate-100-50 nexus-hover-shadow-sm nexus-transition-all";
        
        const iShell = document.createElement("div");
        iShell.className = "nexus-text-brand-blue nexus-mt-0-5";
        iShell.appendChild(createIcon({ name: icon, size: 18 }));
        
        const tShell = document.createElement("div");
        tShell.appendChild(createTypography({ variant: "h3", text: title, className: "nexus-text-slate-900" }));
        tShell.appendChild(createTypography({ variant: "caption", text: sub, className: "nexus-text-slate-500" }));
        
        item.appendChild(iShell);
        item.appendChild(tShell);
        return item;
    };

    lattice.appendChild(createFeature("activity", "原子化排版系統", "自動對齊工業級高密度 UI，確保視覺一致性。"));
    lattice.appendChild(createFeature("gemini", "跨核心協作鏈路", "無縫切換 Gemini 與 Copilot 雲端神經網絡。"));

    // 3. Command HUD Actions
    const actionsSec = document.createElement("div");
    actionsSec.className = "nexus-w-full nexus-max-w-320 nexus-flex nexus-flex-col nexus-gap-4";
    
    const liveBtn = document.createElement("button");
    liveBtn.id = "live-btn";
    liveBtn.className = "nexus-btn nexus-btn-primary nexus-w-full nexus-py-5";
    liveBtn.textContent = "即刻啟動連線";
    liveBtn.onclick = onStartLive || null;
    
    const previewBtn = document.createElement("button");
    previewBtn.id = "preview-btn";
    previewBtn.className = "nexus-btn nexus-btn-secondary nexus-w-full nexus-py-4 nexus-opacity-60";
    previewBtn.textContent = "以訪客模式快速開啟";
    previewBtn.onclick = onStartPreview || null;

    actionsSec.appendChild(liveBtn);
    actionsSec.appendChild(previewBtn);

    // Assembly
    container.appendChild(header);
    container.appendChild(lattice);
    container.appendChild(actionsSec);

    return {
        element: container,
        destroy: () => {}
    };
}
