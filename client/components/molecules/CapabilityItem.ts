import { createLayoutBox } from "@atoms/LayoutBox";

export interface CapabilityItemProps {
    index: number;
    icon: string;
    text: string;
    desc: string;
}

/**
 * Molecule: CapabilityItem
 * A premium industrial-styled card for featured capabilities.
 */
export function createCapabilityItem({ index, icon, text, desc }: CapabilityItemProps): HTMLElement {
    const code = `CODE_${(index + 1).toString().padStart(2, '0')}`;
    const slug = text.replace(' ', '_').toUpperCase();

    const iconEl = document.createElement("div");
    iconEl.className = "nexus-text-2xl nexus-mb-4 nexus-grayscale nexus-group-hover-grayscale-0 nexus-transition-all nexus-duration-700 nexus-opacity-40 nexus-group-hover-nexus-opacity-100";
    iconEl.textContent = icon;

    const label = document.createElement("div");
    label.className = "nexus-text-tiny nexus-font-black nexus-text-white nexus-opacity-40 nexus-group-hover-text-blue-400 nexus-mb-1 nexus-uppercase nexus-tracking-widest nexus-transition-colors nexus-font-mono";
    label.textContent = `${code} // ${slug}`;

    const descEl = document.createElement("div");
    descEl.className = "nexus-text-11px nexus-font-bold nexus-text-slate-500 nexus-group-hover-text-slate-300 nexus-leading-tight nexus-uppercase nexus-transition-colors";
    descEl.textContent = desc;

    return createLayoutBox({
        className: "nexus-group nexus-p-5 nexus-bg-white nexus-opacity-2 nexus-border nexus-border-white nexus-opacity-5 nexus-rounded-2rem nexus-text-left hover:nexus-bg-white nexus-opacity-6 hover:border-blue-500 nexus-opacity-30 nexus-transition-all nexus-duration-500 nexus-transform hover:scale-103 nexus-animate-spring nexus-mb-0",
        style: `animation-delay: ${index * 150}ms`,
        children: [iconEl, label, descEl]
    });
}
