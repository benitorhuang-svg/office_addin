import { createIcon } from "../atoms/Icon";
import { createTypography } from "../atoms/Typography";
import { ProviderProfile } from "@services/atoms/provider-profiles";

export interface ProviderCardProps {
    id: string;
    profile: ProviderProfile;
    isSkip?: boolean;
    onHeaderClick?: () => void;
}

/**
 * Molecule: ProviderCard
 * capsule-themed card representing a connection node (Gemini, Copilot, Preview).
 */
export function createProviderCard({ id, profile, isSkip = false, onHeaderClick }: ProviderCardProps): { card: HTMLElement; arrow: HTMLElement; iconShell: HTMLElement; textBody: HTMLElement } {
    const card = document.createElement("div");
    card.id = id;
    card.className = `nexus-auth-card nexus-auth-card-${profile.pillVariant} ${isSkip ? 'nexus-auth-card-visitor' : ''} nexus-group`;
    
    const header = document.createElement("div");
    header.className = "nexus-flex nexus-items-center nexus-gap-4 nexus-px-4 nexus-pt-4 nexus-pb-1.5 nexus-cursor-pointer";
    
    const iconShell = document.createElement("div");
    const iconColorMap: Record<string, string> = {
        preview: "nexus-bg-blue-50 nexus-text-blue-500",
        gemini: "nexus-bg-indigo-50 nexus-text-indigo-500",
        github: "nexus-bg-slate-100 nexus-text-slate-600",
    };
    iconShell.className = `nexus-auth-icon-shell ${iconColorMap[profile.pillVariant] || 'nexus-bg-slate-50 nexus-text-slate-400'} group-hover:scale-110 nexus-transition-all`;
    iconShell.appendChild(createIcon({ name: profile.icon as any, size: 24 }));
    
    const textBody = document.createElement("div");
    textBody.className = "nexus-flex nexus-flex-col nexus-flex-1";
    textBody.appendChild(createTypography({ variant: "mono-label", text: profile.displayName, className: "nexus-font-bold nexus-text-slate-800 nexus-text-sm" }));
    textBody.appendChild(createTypography({ variant: "mono-label", text: profile.subtitle, className: "nexus-text-slate-400 nexus-text-9px" }));

    const arrow = document.createElement("div");
    arrow.className = "nexus-text-slate-300 nexus-transition-transform group-hover:translate-x-1";
    arrow.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;

    header.appendChild(iconShell);
    header.appendChild(textBody);
    header.appendChild(arrow);
    card.appendChild(header);

    if (onHeaderClick) header.onclick = onHeaderClick;

    return { card, arrow, iconShell, textBody };
}
