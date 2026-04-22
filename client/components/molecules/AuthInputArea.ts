import { createInput } from "../atoms/Input";
import { createButton } from "../atoms/Button";
import { AUTH_BTN_IDS } from "@services/atoms/layout-registry";
import { NexusProvider } from "@shared/types";
import { ProviderProfile } from "@services/atoms/provider-profiles";

export interface AuthInputAreaProps {
    profile: ProviderProfile;
    onVerify: (type: "gemini" | "github", value: string) => Promise<void>;
    onEnter: (provider: NexusProvider) => void;
    isVerified?: boolean;
}

/**
 * Molecule: AuthInputArea
 * Handles credential input and verification logic for a specific provider.
 * UPGRADED: Support for industrial-grade persistent verification states.
 */
export function createAuthInputArea({ profile, onVerify, onEnter, isVerified = false }: AuthInputAreaProps): HTMLElement {
    const inputArea = document.createElement("div");
    inputArea.className = "nexus-flex nexus-flex-col nexus-gap-1.5 nexus-px-4 nexus-pb-2 nexus-animate-fade-in nexus-auth-input-area";
    
    // Hide by default unless orchestrated by the gateway
    inputArea.classList.add("nexus-hidden");
    
    if (profile.provider === NexusProvider.GEMINI_API) {
        const input = createInput({ id: "gemini-input", type: "password", placeholder: "輸入 Google AI API Key..." });
        input.className += " nexus-auth-input";
        
        // --- ➕ 記憶功能：自動載入 ---
        const savedKey = localStorage.getItem("nexus_gemini_key");
        if (savedKey) input.value = savedKey;

        inputArea.appendChild(input);

        const btnGroup = document.createElement("div");
        btnGroup.className = "nexus-flex nexus-gap-2.5 nexus-w-full";
        
        const verifyBtn = createButton({
            id: "gemini-verify-btn",
            label: isVerified ? "驗證成功" : "驗證 API 連線",
            icon: isVerified ? "check" : "shield-check",
            className: `nexus-flex-1 nexus-px-2 ${isVerified ? 'nexus-bg-emerald-50 nexus-text-emerald-600 nexus-border-emerald-200' : 'nexus-bg-white nexus-text-slate-600 nexus-border-slate-200'}`
        });
        
        verifyBtn.onclick = async (e) => {
            e.stopPropagation();
            const key = (document.getElementById("gemini-input") as HTMLInputElement)?.value;
            if (key) {
                // --- ➕ 記憶功能：自動儲存 ---
                localStorage.setItem("nexus_gemini_key", key);

                verifyBtn.innerHTML = `驗證中...`;
                await onVerify("gemini", key);
            } else {
                import("../molecules/Toast").then(({ Toast }) => Toast.show("API_KEY_REQUIRED", "error"));
            }
        };
        
        const enterBtn = createButton({
            id: AUTH_BTN_IDS.GEMINI,
            label: "進入對話模式",
            icon: "arrow-right",
            className: "nexus-flex-1 nexus-bg-blue-600 nexus-text-white nexus-border-none nexus-px-2"
        });
        
        enterBtn.onclick = (e) => {
            e.stopPropagation();
            onEnter(NexusProvider.GEMINI_API);
        };
        
        btnGroup.appendChild(verifyBtn);
        btnGroup.appendChild(enterBtn);
        inputArea.appendChild(btnGroup);
    } else if (profile.provider === NexusProvider.COPILOT_PAT) {
        const input = createInput({ id: "pat-input", type: "password", placeholder: "輸入 GitHub Personal Token..." });
        input.className += " nexus-auth-input";

        // --- ➕ 記憶功能：自動載入 ---
        const savedToken = localStorage.getItem("nexus_github_pat");
        if (savedToken) input.value = savedToken;

        inputArea.appendChild(input);

        const btnGroup = document.createElement("div");
        btnGroup.className = "nexus-flex nexus-gap-2.5 nexus-w-full";
        
        const verifyBtn = createButton({
            id: "github-verify-btn",
            label: isVerified ? "驗證成功" : "驗證 Token 有效性",
            icon: isVerified ? "check" : "shield-check",
            className: `nexus-flex-1 nexus-px-2 ${isVerified ? 'nexus-bg-emerald-50 nexus-text-emerald-600 nexus-border-emerald-200' : 'nexus-bg-white nexus-text-slate-600 nexus-border-slate-200'}`
        });
        
        verifyBtn.onclick = async (e) => {
            e.stopPropagation();
            const token = (document.getElementById("pat-input") as HTMLInputElement)?.value;
            if (token) {
                // --- ➕ 記憶功能：自動儲存 ---
                localStorage.setItem("nexus_github_pat", token);

                verifyBtn.innerHTML = `驗證中...`;
                await onVerify("github", token);
            } else {
                import("../molecules/Toast").then(({ Toast }) => Toast.show("TOKEN_REQUIRED", "error"));
            }
        };

        const btn = createButton({
            id: AUTH_BTN_IDS.PAT,
            label: "同步開發權限",
            icon: "github",
            className: "nexus-flex-1 nexus-bg-slate-900 nexus-text-white nexus-border-none nexus-px-2"
        });

        btn.onclick = (e) => {
            e.stopPropagation();
            onEnter(NexusProvider.COPILOT_PAT);
        };
        
        btnGroup.appendChild(verifyBtn);
        btnGroup.appendChild(btn);
        inputArea.appendChild(btnGroup);
    }

    return inputArea;
}
