import { NexusStateStore } from "@services/molecules/global-state";
import { NexusProvider, ChatContext, AuthController } from "@shared/types";
import { setStoredModel, getStoredModel } from "@services/atoms/storage-provider";
import { ChatOrchestrator } from "./chat-orchestrator";
import { ModelManager } from "@services/molecules/model-manager";
import { Toast } from "@molecules/Toast";
import { NEXUS_IDS } from "@services/atoms/layout-registry";
import { HistoryManager } from "@services/molecules/HistoryManager";
import { resolveProviderProfile } from "@services/atoms/provider-profiles";
import { SessionManager } from "../molecules/SessionManager";
import { DiagnosticEngine } from "../molecules/DiagnosticEngine";

/**
 * Organism Service: App Orchestrator
 * High-level coordinator delegating specialized tasks to Molecule services.
 */
export class AppOrchestrator {
    private static chatOrchestrator = new ChatOrchestrator();
    private static isWelcomeScheduling: boolean = false;

    public static async syncWithServer(onSuccess?: () => void) {
        await SessionManager.syncState(onSuccess);
        
        // Finalize model configuration loading
        const { getConfig } = await import("../organisms/api-orchestrator");
        const config = await getConfig();
        ModelManager.loadConfig(config as any);
    }

    public static startHealthMonitor() { SessionManager.startMonitoring(); }

    public static collectContext(): ChatContext {
        const modelEl = document.getElementById(NEXUS_IDS.MODEL_SELECT) as HTMLSelectElement;
        const presetEl = document.getElementById(NEXUS_IDS.PRESET_SELECT) as HTMLSelectElement;

        return {
            historyEl: document.getElementById(NEXUS_IDS.CHAT_HISTORY),
            promptEl: document.getElementById(NEXUS_IDS.CHAT_INPUT) as HTMLTextAreaElement,
            sendBtn: document.getElementById(NEXUS_IDS.SEND_BTN) as HTMLButtonElement,
            applyStatus: document.getElementById(NEXUS_IDS.APPLY_STATUS),
            responseEl: null,
            runtimeModel: document.getElementById(NEXUS_IDS.RUNTIME_MODEL),
            selectedModel: modelEl?.value || getStoredModel() || "gpt-5-mini",
            presetId: presetEl?.value || window.localStorage.getItem("selected_preset") || "general"
        };
    }

    public static ensurePreviewWelcome() {
        if (this.isWelcomeScheduling) return;
        this.isWelcomeScheduling = true;

        setTimeout(() => {
            const ctx = this.collectContext();
            if (!ctx.historyEl) { this.isWelcomeScheduling = false; return; }
            
            const existingMessages = ctx.historyEl.querySelectorAll('.nexus-bubble-assistant-container');
            if (existingMessages.length === 0) {
                const state = NexusStateStore.getState();
                
                if (state.provider === NexusProvider.NONE || SessionManager.getIsHomeResetting()) {
                    this.isWelcomeScheduling = false;
                    return;
                }

                const profile = resolveProviderProfile(state.provider);
                const welcomeText = profile.welcomeText;

                if (state.provider === NexusProvider.PREVIEW && state.isExcelActive) {
                    DiagnosticEngine.triggerExcelWizardStory(ctx);
                } else {
                    HistoryManager.appendMessage({
                        historyEl: ctx.historyEl,
                        role: "assistant",
                        text: welcomeText,
                        steps: [],
                        isStory: false,
                        animate: true
                    });
                }
            }
            this.isWelcomeScheduling = false;
        }, 100);
    }

    public static async triggerHomeReset(auth?: AuthController | null) {
        await SessionManager.resetHome(auth, () => {
            const ctx = this.collectContext();
            if (ctx.historyEl) ctx.historyEl.innerHTML = "";
            this.isWelcomeScheduling = false;
            window.dispatchEvent(new CustomEvent("NEXUS_UI_RESET"));
        });
    }

    public static getIsHomeResetting() { return SessionManager.getIsHomeResetting(); }
    public static clearHomeResetLock() { SessionManager.unlockReset(); }

    public static async handleSendMessage(auth: AuthController | null, modelId?: string) {
        const ctx = this.collectContext();
        if (!ctx.promptEl?.value.trim()) return;
        
        const promptValue = ctx.promptEl.value.trim();
        const state = NexusStateStore.getState();

        if (state.provider === NexusProvider.PREVIEW) {
            NexusStateStore.update({ isStreaming: true });
            await DiagnosticEngine.triggerWelcomeDiagnostic(promptValue, ctx);
            return;
        }


        try {
            if (!auth) throw new Error("AUTH_CONTROLLER_MISSING");
            const models = ModelManager.getAvailableModels(state.provider);
            let selectedModel = modelId || getStoredModel() || ModelManager.getDefaultModel(models);
            
            if (!models.includes(selectedModel)) selectedModel = ModelManager.getDefaultModel(models);

            const presetSelect = document.getElementById(NEXUS_IDS.PRESET_SELECT) as HTMLSelectElement;
            const selectedPresetId = presetSelect?.value || window.localStorage.getItem("selected_preset") || "general";
            
            await this.chatOrchestrator.handleSend(promptValue, selectedModel, selectedPresetId, auth, ctx);
        } catch (error) {
            console.error("Chat flow failed:", error);
            Toast.show("UPLINK_FAILURE", "error");
        }
    }

    public static handleModelChange(m: string) {
        setStoredModel(m);
        NexusStateStore.update({ selectedModel: m });
        Toast.show(`ENGINE_LINK: [${m}]`, "success");
    }

    public static handleStopConversation() {
        NexusStateStore.update({ isStreaming: false });
        Toast.show("UPLINK_HALTED", "info");
    }

    public static initListeners() {
        window.addEventListener("NEXUS_ATTACH_FILE", (e: any) => this.handleFileAttach(e.detail));
        window.addEventListener("NEXUS_ATTACH_BATCH", (e: any) => this.handleBatchAttach(e.detail));
        window.addEventListener("NEXUS_EXCEL_TOGGLE", () => this.handleExcelToggle());
        window.addEventListener("NEXUS_AUTH_TRIGGER", () => { this.triggerHomeReset(); Toast.show("REDIRECT: AUTH_GATEWAY", "info"); });

        // Industrial Protocol Bridge V14: Zero-Latency Charting from Python Tool
        const { SocketService } = require("@services/molecules/socket-service");
        const { SocketEvent } = require("@shared/enums");
        const { createExcelChart } = require("@services/molecules/excel-actions");

        SocketService.on(SocketEvent.EXCEL_CHART_EXTERNAL, async (payload: any) => {
            console.log(`%c[BRIDGE] External_Dispatch_Received: ${payload.title} (Index: ${payload.index})`, "color: #f59e0b; font-weight: bold;");
            Toast.show(`BRIDGE_LINK: Rendering [${payload.title}]`, "success");
            try {
                await createExcelChart(payload.title, payload.chartType, payload.range, payload.index || 0);
            } catch (e) {
                console.warn("[BRIDGE] External Chart Render Fail:", e);
                Toast.show("BRIDGE_ERROR: Render_Blocked", "error");
            }
        });
    }

    private static handleFileAttach(file: any) {
        if (!file) return;
        const state = NexusStateStore.getState();
        const nextAttachments = Array.from(new Set([...(state.attachments || []), file.name]));
        const nextEnabled = Array.from(new Set([...(state.enabledAttachments || []), file.name]));
        NexusStateStore.update({ attachments: nextAttachments, enabledAttachments: nextEnabled });
        Toast.show(`ATTACH_READY: [${file.name}]`, "success");
        
        const ctx = this.collectContext();
        HistoryManager.appendMessage({ historyEl: ctx.historyEl, role: "assistant", text: `已成功掛載附件：**${file.name}**。正在分析文件內容並與當前任務對齊...` });
        HistoryManager.forceScroll();
    }

    private static handleBatchAttach(fileNames: string[]) {
        if (!fileNames.length) return;
        const state = NexusStateStore.getState();
        const nextAttachments = Array.from(new Set([...(state.attachments || []), ...fileNames]));
        const nextEnabled = Array.from(new Set([...(state.enabledAttachments || []), ...fileNames]));
        NexusStateStore.update({ attachments: nextAttachments, enabledAttachments: nextEnabled });
        Toast.show(`BATCH_READY: [${fileNames.length} Files]`, "success");
        
        const ctx = this.collectContext();
        HistoryManager.appendMessage({ historyEl: ctx.historyEl, role: "assistant", text: "已成功掃描並掛載資料夾內容，目前已選定參與模型對話的專案清單如下：", batchFiles: fileNames });
        HistoryManager.forceScroll();
    }

    private static handleExcelToggle() {
        const state = NexusStateStore.getState();
        const nextActive = !state.isExcelActive;
        NexusStateStore.update({ isExcelActive: nextActive });

        if (nextActive) {
            DiagnosticEngine.triggerExcelWizardStory(this.collectContext());
            Toast.show("EXCEL_WIZARD: [Active]", "success");
        } else {
            Toast.show("EXCEL_WIZARD: [Disabled]", "info");
        }
    }

    public static getStatus() { return { isConnected: SessionManager.getConnectedStatus() }; }
}
