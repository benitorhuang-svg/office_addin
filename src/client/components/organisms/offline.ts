/**
 * Organism: Offline / Disconnected State
 * Enhanced with certificate trust help for Office Add-in users.
 */
import { NexusComponent } from "@shared/types";
import { NexusI18n } from "@services/molecules/i18n-service";
import { createTypography } from "@atoms/Typography";
import { createIcon } from "@atoms/Icon";

export interface OfflineProps {
    onReconnect: () => void;
}

export function createOfflineOrganism(props: OfflineProps): NexusComponent {
    const container = document.createElement("div");
    container.className = "nexus-flex-1 nexus-flex nexus-flex-col nexus-items-center nexus-justify-center nexus-p-8 nexus-space-y-8 nexus-h-full nexus-text-center nexus-relative nexus-overflow-hidden nexus-bg-white nexus-font-outfit";
    
    // 1. Icon Section (Minimalist)
    const iconRoot = document.createElement("div");
    iconRoot.className = "nexus-relative nexus-w-24 nexus-h-24 nexus-mx-auto nexus-mb-4 nexus-flex nexus-items-center nexus-justify-center";
    iconRoot.appendChild(createIcon({ name: "disconnected", size: 32, className: "text-rose-500" }));


    // 2. Text Section
    const content = document.createElement("div");
    content.className = "nexus-space-y-4";
    content.appendChild(createTypography({ 
        variant: "h2", 
        text: NexusI18n.t("UPLINK_DISCONNECTED"),
        className: "text-rose-500 italic font-black uppercase tracking-widest scale-y-110 drop-nexus-shadow-sm"
    }));
    
    const hint = document.createElement("div");
    hint.className = "nexus-text-tiny nexus-text-slate-500 nexus-max-w-xs nexus-mx-auto nexus-leading-relaxed nexus-font-medium";
    hint.innerText = NexusI18n.t("OFFLINE_HINT");
    content.appendChild(hint);

    // 3. Trust Helper (NEW)
    const trustHelper = document.createElement("div");
    trustHelper.className = "nexus-px-6 nexus-py-4 nexus-bg-slate-100/50 nexus-border nexus-border-slate-200/50 nexus-rounded-2xl nexus-space-y-3";
    
    const trustTitle = document.createElement("div");
    trustTitle.className = "nexus-text-[9px] nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-blue-400";
    trustTitle.innerText = `${NexusI18n.t("TRUST_SYSTEM_UPLINK")}`;
    trustHelper.appendChild(trustTitle);

    const trustBtn = document.createElement("button");
    trustBtn.className = "nexus-block nexus-w-full nexus-text-center nexus-mt-2 nexus-text-tiny nexus-text-slate-500 nexus-font-bold nexus-underline nexus-underline-offset-4 nexus-decoration-blue-500/30 nexus-hover-text-slate-900 nexus-transition-colors nexus-cursor-pointer";
    trustBtn.innerText = NexusI18n.t("TRUST_UPLINK_DESC");
    trustHelper.appendChild(trustBtn);

    trustBtn.addEventListener("click", () => {
        const trustUrl = "https://localhost:4000/api/config";
        if (typeof Office !== 'undefined' && Office.context && Office.context.ui) {
            Office.context.ui.displayDialogAsync(trustUrl, { height: 40, width: 40, displayInIframe: false }, (res) => {
                if (res.status === Office.AsyncResultStatus.Succeeded) {
                    const dialog = res.value;
                    dialog.addEventHandler(Office.EventType.DialogEventReceived, () => dialog.close());
                    // Once closed, try to reconnect
                    dialog.addEventHandler(Office.EventType.DialogMessageReceived, () => {
                        dialog.close();
                        props.onReconnect();
                    });
                } else {
                    window.open(trustUrl, "_blank");
                }
            });
        } else {
            window.open(trustUrl, "_blank");
        }
    });

    // 4. Action Section
    const btn = document.createElement("button");
    btn.id = "reconnect-btn";
    btn.className = "nexus-w-full nexus-py-4 nexus-bg-slate-900 nexus-hover-bg-black nexus-text-white nexus-rounded-2xl nexus-transition-all nexus-font-black nexus-text-[9px] nexus-uppercase nexus-tracking-[0.4em] nexus-active-scale-95 nexus-cursor-pointer nexus-shadow-lg";
    btn.innerText = NexusI18n.t("CHECK_LINK_STATUS");

    // Assembly
    const wrapper = document.createElement("div");
    wrapper.className = "nexus-relative nexus-z-20 nexus-space-y-8 nexus-max-w-sm nexus-mx-auto nexus-animate-in nexus-animate-fade-in nexus-slide-in-from-bottom-6 nexus-duration-700";
    wrapper.appendChild(iconRoot);
    wrapper.appendChild(content);
    wrapper.appendChild(trustHelper);
    wrapper.appendChild(btn);
    
    container.appendChild(wrapper);
    
    // Internal Binding
    let isConnecting = false;
    btn.addEventListener("click", async () => {
        if (isConnecting) return;
        isConnecting = true;
        
        const originalText = btn.innerText;
        btn.innerText = NexusI18n.t("UPLINK_PROBING");
        btn.classList.add("nexus-opacity-50", "cursor-wait");

        try {
            await props.onReconnect();
        } finally {
            isConnecting = false;
            btn.innerText = originalText;
            btn.classList.remove("nexus-opacity-50", "cursor-wait");
        }
    });

    return {
        element: container
    };
}
