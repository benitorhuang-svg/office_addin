/**
 * Molecule: Control Matrix (Zen Studio Edition)
 * Professional system navigation for the System Hub. 
 * Featuring: OAuth, PAT, and API tracks with zero-friction memory.
 */
import { validateACPToken } from "@services/organisms/api-orchestrator";
import { Toast } from "@molecules/Toast";
import { CryptoProvider } from "@services/atoms/crypto-provider";
import { setStoredGeminiToken, setStoredToken } from "@services/atoms/storage-provider";
import { createTypography } from "@atoms/Typography";

export interface ControlMatrixProps {
    onMethodChange: (method: string) => void;
}

interface ControlField {
    id: string;
    label: string;
    placeholder?: string;
}

interface ControlMethod {
    id: string;
    label: string;
    sub: string;
    icon: string;
    iconBg: string;
    type: "oauth" | "auto" | "input";
    fields?: ControlField[];
}

export function createControlMatrix(props: ControlMatrixProps) {
    const container = document.createElement("div");
    container.className = "nexus-flex nexus-flex-col nexus-gap-4 nexus-w-full nexus-p-2 nexus-animate-in nexus-animate-fade-in nexus-slide-in-from-bottom-2 nexus-duration-500 nexus-font-outfit";
    
    // --- Configuration State (Industrial Encryption Layer) ---
    const getStored = async (key: string) => {
        const encrypted = window.localStorage.getItem(`NEXUS_SECRET_${key}`);
        if (!encrypted) return "";
        return await CryptoProvider.decrypt(encrypted) || "";
    };

    const setStored = async (key: string, val: string) => {
        const encrypted = await CryptoProvider.encrypt(val);
        window.localStorage.setItem(`NEXUS_SECRET_${key}`, encrypted);
        
        if (key === 'gemini') setStoredGeminiToken(val);
        if (key === 'pat') setStoredToken(val);
    };

    const methods: ControlMethod[] = [
        { 
            id: 'overview', 
            label: "Overview", 
            sub: "HOME_RELAY",
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
            iconBg: "nexus-bg-blue-600",
            type: 'oauth'
        },
        { 
            id: 'monitor', 
            label: "Monitor", 
            sub: "DATA_ANALYSIS",
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
            iconBg: "nexus-bg-emerald-600",
            type: 'auto'
        },
        { 
            id: 'data', 
            label: "Token Channel", 
            sub: "UPLINK_FIELD",
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/></svg>`,
            iconBg: "nexus-bg-violet-600",
            type: 'input',
            fields: [{ id: 'pat', label: 'Access Token', placeholder: 'ghp_...' }]
        },
        { 
            id: 'settings', 
            label: "Matrix Settings", 
            sub: "SYSTEM_CORE",
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
            iconBg: "nexus-bg-slate-800",
            type: 'oauth'
        }
    ];

    const renderMethodBtn = (m: ControlMethod) => {
        const wrapper = document.createElement("div");
        wrapper.className = "nexus-flex nexus-flex-col nexus-group/item";
        
        const btn = document.createElement("button");
        btn.dataset.method = m.id;
        btn.className = "nexus-w-full nexus-text-left nexus-p-3-5 nexus-rounded-2xl nexus-flex nexus-items-center nexus-justify-between nexus-hover-bg-slate-50 nexus-transition-all nexus-duration-300 nexus-group nexus-ring-transparent nexus-hover-ring-slate-100";
        
        btn.innerHTML = `
            <div class="nexus-flex nexus-items-center nexus-gap-4">
                <div class="nexus-w-11 nexus-h-11 nexus-rounded-1-25rem ${m.iconBg} nexus-text-white nexus-shadow-xl nexus-flex nexus-items-center nexus-justify-center nexus-transition-all nexus-group-hover:scale-105 nexus-group-hover:rotate-2">
                    ${m.icon}
                </div>
                <div class="nexus-flex nexus-flex-col">
                    <span class="nexus-text-13px nexus-font-bold nexus-text-slate-800 nexus-tracking-tight nexus-leading-none nexus-mb-1">${m.label}</span>
                    <span class="nexus-text-tiny nexus-font-black nexus-text-slate-400 nexus-uppercase nexus-tracking-widest nexus-opacity-60">${m.sub}</span>
                </div>
            </div>
            <div class="indicator nexus-w-1-5 nexus-h-1-5 nexus-rounded-full nexus-bg-slate-100 nexus-transition-all nexus-group-hover:bg-blue-300"></div>
        `;

        // -- Input Matrix Drawer --
        const drawer = document.createElement("div");
        drawer.className = "nexus-hidden nexus-flex-col nexus-gap-3 nexus-p-4 nexus-bg-slate-50-50 nexus-border nexus-border-slate-100 nexus-rounded-2xl nexus-mt-2 nexus-animate-in nexus-animate-fade-in nexus-slide-in-from-top-1 nexus-duration-300";
        
        if (m.type === 'input' && m.fields) {
            const inputFields = m.fields;

            inputFields.forEach((f) => {
                const input = document.createElement("input");
                input.type = "password";
                input.className = "nexus-w-full nexus-px-4 nexus-py-2-5 nexus-bg-white nexus-border nexus-border-slate-200 nexus-rounded-xl nexus-text-11px nexus-focus-outline-none nexus-focus-ring-2 nexus-focus-ring-blue-500/10 nexus-focus-border-blue-500 nexus-transition-all";
                input.placeholder = f.placeholder ?? f.label;
                
                getStored(f.id).then(v => { input.value = v; });
                
                input.onchange = async (event) => {
                    const target = event.currentTarget;
                    if (!(target instanceof HTMLInputElement)) return;
                    const val = target.value;
                    await setStored(f.id, val);
                    Toast.show(`PROTO_SYNC: ${f.label.toUpperCase()}`, "info");
                };
                drawer.appendChild(input);
            });

            const verifyBtn = document.createElement("button");
            verifyBtn.className = "nexus-w-full nexus-py-2-5 nexus-bg-blue-600 nexus-hover-bg-blue-700 nexus-text-white nexus-rounded-xl nexus-text-tiny nexus-font-black nexus-uppercase nexus-tracking-widest nexus-shadow-md nexus-transition-all nexus-active-scale-95 nexus-mt-1";
            verifyBtn.innerText = "Verify Uplink";
            verifyBtn.onclick = async () => {
                Toast.show("Probing Matrix...", "info");
                const field = inputFields[0];
                if (!field) return;
                const pat = await getStored(field.id);
                const res = await validateACPToken('copilot', pat);
                if (res.ok) Toast.show("Uplink Established!", "success");
                else Toast.show(`Refused: ${res.message}`, "error");
            };
            drawer.appendChild(verifyBtn);
        } else if (m.type === 'oauth') {
             const hint = createTypography({ variant: "mono-label", text: "CLOUD_PROXY_SERVICE", className: "nexus-text-blue-500 nexus-opacity-50 nexus-text-tiny nexus-text-center" });
             drawer.appendChild(hint);
        }

        btn.onclick = () => {
            props.onMethodChange(m.id);
            const allDrawers = container.querySelectorAll(".nexus-flex-col.nexus-animate-in");
            allDrawers.forEach(d => d.classList.add("nexus-hidden"));
            drawer.classList.remove("nexus-hidden");
        };

        wrapper.appendChild(btn);
        wrapper.appendChild(drawer);
        return wrapper;
    };

    methods.forEach(m => container.appendChild(renderMethodBtn(m)));

    // -- System Purge --
    const flushBtn = document.createElement("button");
    flushBtn.className = "nexus-text-tiny nexus-text-slate-400 nexus-hover-text-rose-500 nexus-transition-colors nexus-text-center nexus-w-full nexus-mt-6 nexus-uppercase nexus-font-black nexus-tracking-widest nexus-opacity-40 nexus-hover-opacity-100";
    flushBtn.innerText = "??Terminate All Secrets";
    flushBtn.onclick = () => {
        if(confirm("Terminate memory of all secrets?")) {
            Object.keys(localStorage).forEach(k => {
                if(k.startsWith("NEXUS_SECRET_")) localStorage.removeItem(k);
            });
            Toast.show("Memory Purged", "info");
            location.reload();
        }
    };
    container.appendChild(flushBtn);

    return {
        element: container,
        update: (activeProvider: string) => {
            const allBtns = container.querySelectorAll<HTMLButtonElement>("button[data-method]");
            allBtns.forEach((btn) => {
                const isTarget = btn.dataset.method === activeProvider;
                const indicator = btn.querySelector<HTMLElement>(".indicator");
                indicator?.classList.toggle("nexus-bg-blue-600", isTarget);
                indicator?.classList.toggle("nexus-scale-125", isTarget);
                btn.classList.toggle("nexus-bg-blue-50-50", isTarget);
            });
        }
    };
}
