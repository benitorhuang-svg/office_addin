export interface MetricItemProps {
    label: string;
    value: string;
    unit?: string;
    icon?: string;
    colorClass?: string;
    progress?: number;
    statusText?: string;
    sparklinePoints?: number[];
}

/**
 * Molecule: Ultra-Grand Metric Card V12.0
 * RICH AESTHETIC: Featuring Dynamic Glows, Floating Micro-animations, and Frosted Glass.
 */
export function createMetricItem(props: MetricItemProps) {
    const container = document.createElement("div");
    container.className = "nexus-flex nexus-flex-col nexus-gap-10 nexus-p-12 glass-card-premium nexus-min-w-500 nexus-animate-spring nexus-animate-float nexus-group nexus-cursor-default";

    // 1. Top Row: Icon + Label (Left) and Value (Right)
    const topRow = document.createElement("div");
    topRow.className = "nexus-flex nexus-items-center nexus-justify-between";
    
    // Left Group: Icon + Label
    const leftGroup = document.createElement("div");
    leftGroup.className = "nexus-flex nexus-items-center nexus-gap-10";
    
    const iconSlot = document.createElement("div");
    const colorTag = props.colorClass?.split('-')[1] || 'blue';
    iconSlot.className = `nexus-w-18 nexus-h-18 nexus-rounded-30px nexus-bg-white icon-glow-${colorTag} nexus-flex nexus-items-center nexus-justify-center nexus-text-slate-800 nexus-transition-all nexus-duration-700 nexus-shadow-sm nexus-group-hover:rotate-12 nexus-group-hover:scale-115`;
    iconSlot.innerHTML = props.icon || `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20" /></svg>`;
    
    const labelGroup = document.createElement("div");
    labelGroup.className = "nexus-flex nexus-flex-col nexus-gap-2";
    const labelTxt = document.createElement("span");
    labelTxt.className = "nexus-text-14px nexus-font-black nexus-uppercase nexus-tracking-tight-wide nexus-text-slate-400";
    labelTxt.textContent = props.label;
    const subTxt = document.createElement("span");
    subTxt.className = "nexus-text-tiny nexus-font-bold nexus-uppercase nexus-tracking-widest nexus-text-slate-300";
    subTxt.textContent = "REALTIME_UPLINK";
    labelGroup.appendChild(labelTxt);
    labelGroup.appendChild(subTxt);
    
    leftGroup.appendChild(iconSlot);
    leftGroup.appendChild(labelGroup);
    
    // Right Group: Large Value
    const valueGroup = document.createElement("div");
    valueGroup.className = "nexus-flex nexus-flex-col nexus-items-end nexus-gap-1";
    const dataVal = document.createElement("span");
    dataVal.className = "nexus-text-5xl nexus-font-black nexus-text-slate-900 nexus-tracking-tighter nexus-leading-none nexus-group-hover-nexus-text-blue-600 nexus-transition-colors nexus-duration-500";
    dataVal.textContent = props.value;
    const dataUnit = document.createElement("span");
    dataUnit.className = "nexus-text-13px nexus-font-black nexus-text-slate-400 nexus-uppercase nexus-tracking-widest";
    dataUnit.textContent = props.unit || "";
    
    valueGroup.appendChild(dataVal);
    valueGroup.appendChild(dataUnit);
    
    topRow.appendChild(leftGroup);
    topRow.appendChild(valueGroup);
    container.appendChild(topRow);

    // 2. Bottom Row: Status Text (Left) + Pill (Right)
    const bottomRow = document.createElement("div");
    bottomRow.className = "nexus-flex nexus-items-center nexus-justify-between nexus-mt-auto nexus-pt-8 nexus-border-t nexus-border-slate-50/50";
    
    const statusTextDisplay = document.createElement("span");
    statusTextDisplay.className = "nexus-text-xs nexus-font-black nexus-text-slate-400 nexus-uppercase nexus-tracking-widest nexus-flex nexus-items-center nexus-gap-3";
    statusTextDisplay.innerHTML = `<span class="nexus-w-2 nexus-h-2 nexus-rounded-full nexus-bg-slate-200 nexus-animate-pulse"></span> STATUS: ${props.progress || 0}%`;
    
    const isStable = (props.progress || 0) > 30;
    const pill = document.createElement("div");
    pill.className = `nexus-px-6 nexus-py-2-5 nexus-rounded-2xl nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-widest ${isStable ? 'status-pill-stable' : 'status-pill-low'} nexus-shadow-sm nexus-transition-all nexus-duration-500 nexus-hover-scale-110`;
    pill.textContent = props.statusText || (isStable ? "Stable" : "Caution");
    
    bottomRow.appendChild(statusTextDisplay);
    bottomRow.appendChild(pill);
    container.appendChild(bottomRow);

    return {
        element: container,
        update: (newValue: string, newProgress?: number) => {
            dataVal.textContent = newValue;
            if (newProgress !== undefined) {
                const roundedProgress = Math.round(newProgress);
                statusTextDisplay.innerHTML = `<span class="nexus-w-2 nexus-h-2 nexus-rounded-full nexus-bg-slate-200 nexus-animate-pulse"></span> STATUS: ${roundedProgress}%`;
                const stable = roundedProgress > 30;
                pill.className = `nexus-px-6 nexus-py-2-5 nexus-rounded-2xl nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-widest ${stable ? 'status-pill-stable' : 'status-pill-low'} nexus-shadow-sm nexus-transition-all nexus-duration-500 nexus-hover-scale-110`;
                pill.textContent = stable ? "Stable" : "Caution";
            }
        }
    };
}
