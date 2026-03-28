import { createLayoutBox } from "./LayoutBox";

export interface IntelligenceStep {
    title: string;
    description?: string;
    status: "done" | "active" | "pending";
}

/**
 * Atom: StepItem
 * A high-fidelity single step in the 'Chain of Thought' process.
 * UPGRADED: Added premium pulse effects, indicator lines, and refined typography.
 */
export const createStepItem = (step: IntelligenceStep): HTMLElement => {
    const isActive = step.status === "active";
    const isDone = step.status === "done";

    const item = createLayoutBox({
        className: "nexus-step-item nexus-animate-in nexus-flex nexus-gap-4",
        children: [
            // 1. The Vertical 'Thought Trace' Line
            (() => {
                const line = document.createElement("div");
                line.className = "nexus-step-indicator";
                return line;
            })(),

            // 2. The Core Status Dot (Pulsing if Active)
            (() => {
                const shell = document.createElement("div");
                shell.className = "nexus-flex-shrink-0 nexus-mt-1 nexus-relative nexus-z-10";
                
                if (isDone) {
                    shell.className += " nexus-text-emerald-500 nexus-scale-110";
                    shell.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
                } else if (isActive) {
                    // Premium Pulsing Core
                    const pulse = document.createElement("div");
                    pulse.className = "nexus-absolute nexus-inset-0 nexus-rounded-full nexus-bg-blue-500 nexus-animate-pulse-blue";
                    shell.appendChild(pulse);
                    
                    const core = document.createElement("div");
                    core.className = "nexus-relative nexus-w-2.5 nexus-h-2.5 nexus-bg-blue-600 nexus-rounded-full nexus-m-1 nexus-border nexus-border-white";
                    shell.appendChild(core);
                } else {
                    shell.className += " nexus-text-slate-200";
                    shell.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/></svg>`;
                }
                return shell;
            })(),

            // 3. The Contextual Information
            (() => {
                const content = document.createElement("div");
                content.className = "nexus-flex nexus-flex-col nexus-pb-6";
                
                const labelText = step.title.includes("：") ? step.title.split("：")[0] : "任務";
                const titleText = step.title.includes("：") ? step.title.split("：")[1] : step.title;
                
                const label = createLayoutBox({ 
                    tag: "div", 
                    className: `nexus-step-label ${isActive ? 'nexus-text-blue-500/80 nexus-font-black' : 'nexus-text-slate-400'}`, 
                    children: [document.createTextNode(labelText)] 
                });
                
                const title = createLayoutBox({ 
                    tag: "div", 
                    className: `nexus-step-title ${isActive ? 'nexus-text-slate-900 nexus-font-black' : 'nexus-text-slate-600'}`, 
                    children: [document.createTextNode(titleText)] 
                });
                
                content.appendChild(label); 
                content.appendChild(title);

                if (step.description) {
                    const desc = document.createElement("div");
                    desc.className = `nexus-text-11px nexus-mt-1.5 nexus-leading-relaxed nexus-transition-opacity ${isActive ? 'nexus-text-slate-500' : 'nexus-text-slate-400 nexus-opacity-70'}`;
                    desc.textContent = step.description;
                    
                    if (isActive) {
                        desc.className += " nexus-animate-fade-in";
                        // Optional Shimmer (High-end Texture)
                        const shimmer = document.createElement("div");
                        shimmer.className = "nexus-absolute nexus-inset-0 nexus-pointer-events-none nexus-animate-shimmer-fast nexus-opacity-20";
                        desc.appendChild(shimmer);
                    }
                    
                    content.appendChild(desc);
                }
                return content;
            })()
        ]
    });

    return item;
};
