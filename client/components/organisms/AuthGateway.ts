/**
 * Organism: AuthGateway
 * The Nexus Enrollment Hub.
 * REFACTORED: Atomic separation of ProviderCards and AuthInputAreas.
 */
import { NexusComponent, AuthController, NexusProvider } from "@shared/types";
import { AUTH_BTN_IDS } from "@services/atoms/layout-registry";
import { PROVIDER_PROFILES, ProviderProfile } from "@services/atoms/provider-profiles";
import { createProviderCard } from "../molecules/ProviderCard";
import { createAuthInputArea } from "../molecules/AuthInputArea";
import { createButton } from "../atoms/Button";

export interface AuthGatewayProps {
    auth: AuthController | null;
}

export function createAuthGateway({ auth }: AuthGatewayProps): NexusComponent {
    const container = document.createElement("div");
    container.className = "nexus-flex nexus-flex-col nexus-gap-3 nexus-w-full nexus-px-6 nexus-py-2 nexus-pb-10 nexus-animate-fade-in";

    if (!auth) {
        container.innerHTML = `<div class="nexus-text-meta" style="color:var(--color-brand-rose);text-align:center;padding:2rem;">SYSTEM_HALT: AUTH_CONTROLLER_UNREACHABLE</div>`;
        return { element: container };
    }

    const selectionGrid = document.createElement("div");
    selectionGrid.className = "nexus-flex nexus-flex-col nexus-gap-3";

    // --- Helper for assembly ---
    const buildProviderNode = (profile: ProviderProfile, isSkip = false) => {
        const { card, arrow, iconShell, textBody } = createProviderCard({
            id: isSkip ? AUTH_BTN_IDS.SKIP : `${profile.provider}-card`,
            profile,
            isSkip
        });

        if (isSkip) return card;

        const providerKey = profile.provider === NexusProvider.GEMINI_API ? 'gemini' : (profile.provider === NexusProvider.COPILOT_PAT ? 'github' : null);
        const isVerified = providerKey ? localStorage.getItem(`nexus_verified_${providerKey}`) === 'true' : false;

        const inputArea = createAuthInputArea({
            profile,
            isVerified,
            onVerify: async (type, value) => {
                const btn = card.querySelector(`#${type}-verify-btn`) as HTMLElement;
                try {
                    const res = await fetch(`/auth/verify/${type}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ [type === 'gemini' ? 'key' : 'token']: value })
                    });
                    const data = await res.json();
                    
                    if (res.ok && data.success) {
                        localStorage.setItem(`nexus_verified_${type}`, 'true'); // PERSIST: Remember verification
                        
                        card.classList.add("nexus-auth-card-verified");
                        card.classList.remove(`nexus-auth-card-${profile.pillVariant}`);
                        iconShell.classList.add("nexus-bg-emerald-100", "nexus-text-emerald-600");
                        arrow.classList.add("nexus-text-emerald-400");
                        textBody.querySelector(".nexus-text-slate-800")?.classList.add("nexus-text-emerald-900");
                        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="nexus-mr-1-5"><path d="M20 6 9 17l-5-5"/></svg> 驗證成功`;
                        btn.classList.add("nexus-bg-emerald-100", "nexus-text-emerald-700", "nexus-border-emerald-200");
                        import("../molecules/Toast").then(({ Toast }) => Toast.show("SUCCESS_LINK_ESTABLISHED", "success"));
                    }
 else {
                        btn.innerHTML = `驗證失敗`;
                        import("../molecules/Toast").then(({ Toast }) => Toast.show(data.error || "INVALID_CREDENTIALS", "error"));
                    }
                } catch {
                    btn.innerHTML = `連線異常`;
                    import("../molecules/Toast").then(({ Toast }) => Toast.show("NETWORK_FAILURE", "error"));
                }
            },
            onEnter: (p) => {
                import("@services/molecules/global-state").then(({ NexusStateStore }) => {
                    NexusStateStore.setProvider(p);
                    NexusStateStore.setPower(true);
                });
            }
        });

        card.appendChild(inputArea);

        // Header click logic (Expand/Collapse)
        card.querySelector(".nexus-flex.nexus-items-center")?.addEventListener("click", () => {
            const isClosing = !inputArea.classList.contains("nexus-hidden");
            selectionGrid.querySelectorAll('.nexus-auth-card-selected').forEach(c => c.classList.remove('nexus-auth-card-selected'));
            selectionGrid.querySelectorAll('.nexus-auth-input-area').forEach(a => a.classList.add('nexus-hidden'));
            selectionGrid.querySelectorAll('.nexus-auth-card svg[style*="rotate(90deg)"]').forEach(s => (s as HTMLElement).style.transform = "");

            if (!isClosing) {
                inputArea.classList.remove("nexus-hidden");
                card.classList.add("nexus-auth-card-selected");
                arrow.style.transform = "rotate(90deg)";
                import("@services/molecules/global-state").then(({ NexusStateStore }) => NexusStateStore.setProvider(profile.provider));
            } else {
                import("@services/molecules/global-state").then(({ NexusStateStore }) => NexusStateStore.setProvider(NexusProvider.NONE));
            }
        });
        
        // --- Persistence & State Awareness: Auto-expand and persist success state ---
        import("@services/molecules/global-state").then(({ NexusStateStore }) => {
            const currentProvider = NexusStateStore.getState().provider;
            const providerKey = profile.provider === NexusProvider.GEMINI_API ? 'gemini' : (profile.provider === NexusProvider.COPILOT_PAT ? 'github' : null);
            const isVerified = providerKey ? localStorage.getItem(`nexus_verified_${providerKey}`) === 'true' : false;

            if (isVerified) {
                card.classList.add("nexus-auth-card-verified");
                card.classList.remove(`nexus-auth-card-${profile.pillVariant}`);
                iconShell.classList.add("nexus-bg-emerald-100", "nexus-text-emerald-600");
                arrow.classList.add("nexus-text-emerald-400");
                textBody.querySelector(".nexus-text-slate-800")?.classList.add("nexus-text-emerald-900");
            }

            if (currentProvider === profile.provider) {
                inputArea.classList.remove("nexus-hidden");
                card.classList.add("nexus-auth-card-selected");
                arrow.style.transform = "rotate(90deg)";
            }
        });

        return card;
    };

    // --- Build final grid ---
    const previewCard = buildProviderNode(PROVIDER_PROFILES[NexusProvider.PREVIEW], true);
    previewCard.addEventListener("click", () => {
        import("@services/molecules/global-state").then(({ NexusStateStore }) => {
            NexusStateStore.setProvider(NexusProvider.PREVIEW);
            NexusStateStore.setPower(true);
        });
    });

    selectionGrid.appendChild(previewCard);
    selectionGrid.appendChild(buildProviderNode(PROVIDER_PROFILES[NexusProvider.GEMINI_API]));
    selectionGrid.appendChild(buildProviderNode(PROVIDER_PROFILES[NexusProvider.COPILOT_PAT]));

    container.appendChild(selectionGrid);

    // --- ➕ 全局清除功能：清除所有 API 記憶 ---
    const resetBtn = createButton({
        id: "nexus-global-reset",
        label: "清除所有受信任的 API 記憶",
        icon: "trash-2",
        className: "nexus-w-full nexus-mt-3 nexus-bg-white nexus-text-slate-400 nexus-border-slate-100 nexus-hover-text-red-500 nexus-hover-bg-red-50 nexus-transition-all nexus-opacity-50 nexus-hover-opacity-100"
    });

    resetBtn.onclick = () => {
        const keys = ["nexus_gemini_key", "nexus_github_pat", "nexus_verified_gemini", "nexus_verified_github"];
        keys.forEach(k => localStorage.removeItem(k));
        import("../molecules/Toast").then(({ Toast }) => {
            Toast.show("記憶已清除，正在重新初始化...", "info");
            setTimeout(() => window.location.reload(), 1000);
        });
    };

    container.appendChild(resetBtn);

    // Initial Binding & Auto-Login Handshake
    setTimeout(() => {
        if (auth) {
            auth.bindButtons({
                welcomeConnectBtn: container.querySelector(`#${AUTH_BTN_IDS.PAT}`),
                geminiConnectBtn: container.querySelector(`#${AUTH_BTN_IDS.GEMINI}`),
                welcomeSkipBtn: previewCard,
            });
        }

        // Cross-host sync: If already verified, expand that provider automatically
        import("@services/molecules/global-state").then(({ NexusStateStore }) => {
            const state = NexusStateStore.getState();
            if (state.provider === NexusProvider.NONE || state.provider === NexusProvider.PREVIEW) {
                const geminiVerified = localStorage.getItem('nexus_verified_gemini') === 'true';
                const githubVerified = localStorage.getItem('nexus_verified_github') === 'true';
                
                if (geminiVerified) {
                    NexusStateStore.setProvider(NexusProvider.GEMINI_API);
                } else if (githubVerified) {
                    NexusStateStore.setProvider(NexusProvider.COPILOT_PAT);
                }
            }
        });
    }, 0);

    return {
        element: container,
        update: () => {},
        destroy: () => {}
    };
}
