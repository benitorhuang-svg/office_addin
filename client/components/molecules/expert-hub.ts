/**
 * Molecule: Expert Hub
 * Contains quick actions like Excel Wizard and Eraser.
 */
import { createButton } from "../atoms/Button";
import { NexusStateStore } from "../../services/molecules/global-state";

export function createExpertHub(onClearChat?: () => void) {
    const container = document.createElement("div");
    container.className = "nexus-flex nexus-items-center nexus-gap-2";

    // --- Excel Wizard Quick Access
    const excelBtn = createButton({
        icon: "step-01",
        variant: "zen",
        onClick: (e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent("NEXUS_EXCEL_TOGGLE"));
        }
    });

    const updateExcelUI = (isActive: boolean = false) => {
        excelBtn.className = `nexus-expert-btn ${
            isActive 
                ? "nexus-pill-gemini nexus-active-glow" 
                : "nexus-pill-preview nexus-hover-glow"
        }`;
    };

    NexusStateStore.subscribe((state: any) => updateExcelUI(state.isExcelActive));
    updateExcelUI(NexusStateStore.getState().isExcelActive);

    // --- Gemini Login (Visible only when in Preview/None mode)
    const loginBtn = createButton({
        icon: "gemini",
        variant: "zen",
        title: "登入 Gemini API",
        onClick: () => window.dispatchEvent(new CustomEvent("NEXUS_AUTH_TRIGGER"))
    });

    const updateLoginUI = (provider: string) => {
        if (provider === "NONE" || provider === "") {
            loginBtn.classList.remove("nexus-hidden");
        } else {
            loginBtn.classList.add("nexus-hidden");
        }
    };

    NexusStateStore.subscribe((state: any) => updateLoginUI(state.provider));
    updateLoginUI(NexusStateStore.getState().provider);

    const eraserBtn = createButton({
        icon: "eraser",
        variant: "zen",
        title: "掃除此對話區塊",
        onClick: (e) => {
            e.stopPropagation();
            onClearChat?.();
        }
    });

    container.appendChild(loginBtn);
    container.appendChild(excelBtn);
    container.appendChild(eraserBtn);

    return { 
        element: container 
    };
}
