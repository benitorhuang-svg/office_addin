import { HistoryManager } from "@services/molecules/HistoryManager";
import { ChatContext } from "@shared/types";
import { NexusStateStore } from "@services/molecules/global-state";

/**
 * Molecule Service: Diagnostic Engine
 * Manages the generation of interactive system diagnostic stories and Word/Excel analytical simulations.
 */
export class DiagnosticEngine {
    
    public static async triggerWelcomeDiagnostic(prompt: string, ctx: ChatContext) {
        if (!ctx.historyEl) return;
        
        HistoryManager.appendMessage({ historyEl: ctx.historyEl, role: "user", text: prompt });
        if (ctx.promptEl) ctx.promptEl.value = "";

        HistoryManager.showTypingIndicator(ctx.historyEl);
        await new Promise(r => setTimeout(r, 1500));
        HistoryManager.removeTypingIndicator();

        const bubble = HistoryManager.appendMessage({
            historyEl: ctx.historyEl,
            role: "assistant",
            text: "正在進行分層環境對齊評估...",
            steps: [
                { title: "步驟 1：環境診斷", status: "active" },
                { title: "步驟 2：核心映射同步", description: "正在檢查 ACP 協議與系統對齊，確保預覽模式穩定。", status: "pending" }
            ],
            isStory: true,
            animate: true 
        });

        await new Promise(r => setTimeout(r, 1200));
        HistoryManager.updateAssistantBubble(bubble as HTMLElement, "已完成系統偵測與任務對齊，具體掃描結果如下：", (txt) => txt);
        HistoryManager.updateAssistantSteps(bubble as HTMLElement, [
            { title: "步驟 1：環境診斷", status: "done" },
            { title: "步驟 2：核心映射同步", description: "ACP 鏈路檢測完成，通訊協議對齊成功。", status: "active" }
        ]);

        await new Promise(r => setTimeout(r, 1200));
        HistoryManager.updateAssistantSteps(bubble as HTMLElement, [
            { title: "步驟 1：環境診斷", status: "done" },
            { title: "步驟 2：核心映射同步", status: "done" }
        ]);
        
        const finalSimulationText = `您好！我是您的智慧助手。目前檢測到您正在使用 **${prompt}** 作為測試提示。在「預覽模式」下，我提供了這場系統診斷模擬以確保 UI 元件運作正常。若要獲得 AI 的即時生成回覆，請點擊下方的 **登入/連線** 按鈕。`;
        HistoryManager.updateAssistantBubble(bubble as HTMLElement, finalSimulationText, (t) => t);
        HistoryManager.completeAssistantBubble(bubble as HTMLElement, finalSimulationText);


        HistoryManager.forceScroll();
        NexusStateStore.update({ isStreaming: false });
    }

    public static async triggerExcelWizardStory(ctx: ChatContext) {
        if (!ctx.historyEl) return;
        
        HistoryManager.showTypingIndicator(ctx.historyEl);
        await new Promise(r => setTimeout(r, 1200));
        HistoryManager.removeTypingIndicator();

        HistoryManager.appendMessage({
            historyEl: ctx.historyEl,
            role: "assistant",
            text: "Excel 精靈分析引擎已就緒！目前工作環境分析完成，我已掌握當前活頁簿的工作表結構與數據分佈。您可以直接提出如「分析本月營收趨勢」或「生成自動化統計公式」等進階指令。",
            steps: [
                { title: "解析活頁簿物件", status: "done" },
                { title: "建立數據拓樸映射", description: "已偵測到多個數據透視關聯與自定義公式。", status: "done" },
                { title: "對齊提示詞上下文", status: "active" }
            ],
            isStory: true,
            animate: true
        });
        HistoryManager.forceScroll();
    }
}
