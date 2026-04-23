import { resolveLocalApiUrl } from "@services/molecules/local-server-resolver";

export interface AskUserCardProps {
    sessionId: string;
    question: string;
}

/**
 * Molecule: AskUserCard
 * Interactive premium card for the AI's ask_user tool flow.
 */
export function createAskUserCard({ sessionId, question }: AskUserCardProps): HTMLElement {
    const container = document.createElement("div");
    container.id = `ask-user-${sessionId}`;
    container.className = "ask-user-premium-card nexus-group nexus-hover-border-blue-500/30 nexus-transition-all nexus-duration-500 nexus-p-6 nexus-rounded-4xl nexus-bg-white/[0.02] nexus-border nexus-border-white-5 nexus-shadow-2xl nexus-space-y-4 nexus-mb-4 nexus-relative nexus-overflow-hidden nexus-animate-in nexus-zoom-in-95 nexus-animate-fade-in nexus-duration-500";
    
    // Aesthetic Glassmorphism Flare
    const flare = document.createElement("div");
    flare.className = "nexus-absolute nexus--top-12 nexus--right-12 nexus-w-24 nexus-h-24 nexus-bg-blue-500/10 nexus-blur-[48px] nexus-rounded-full nexus-group-hover-bg-blue-500/20 nexus-transition-all";
    container.appendChild(flare);

    const questionEl = document.createElement("div");
    questionEl.className = "ask-user-question nexus-text-11px nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-blue-400 nexus-opacity-80 nexus-mb-2 nexus-font-mono nexus-flex nexus-items-center nexus-gap-3";
    questionEl.innerHTML = `
        <span class="nexus-w-1-5 nexus-h-1-5 nexus-rounded-full nexus-bg-blue-400 nexus-animate-pulse"></span>
        <span>Awaiting_Response</span>
    `;
    container.appendChild(questionEl);

    const promptText = document.createElement("div");
    promptText.className = "nexus-text-sm nexus-text-white nexus-opacity-80 nexus-font-medium nexus-leading-relaxed nexus-mb-6 nexus-font-outfit";
    promptText.textContent = question;
    container.appendChild(promptText);

    const inputArea = document.createElement("div");
    inputArea.className = "nexus-relative nexus-flex nexus-flex-col nexus-gap-3";
    
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "SYSTEM_INPUT_REQUIRED...";
    input.className = "nexus-w-full nexus-px-5 nexus-py-4 nexus-text-xs nexus-font-mono nexus-bg-white/5 nexus-border nexus-border-white-10 nexus-rounded-2xl nexus-focus-outline-none nexus-focus-border-blue-500/50 nexus-focus-ring-4 nexus-focus-ring-blue-500/10 nexus-transition-all nexus-text-white nexus-placeholder-white/30";
    
    const sendBtn = document.createElement("button");
    sendBtn.textContent = "TRANSMIT_RESPONSE";
    
    // Industrial Standard Styling: Locking colors via inline style for maximum compatibility
    Object.assign(sendBtn.style, {
        backgroundColor: "#2563eb",
        color: "#ffffff",
        padding: "16px",
        borderRadius: "16px",
        border: "none",
        fontWeight: "900",
        fontSize: "10px",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)",
        width: "100%",
        display: "block"
    });

    sendBtn.onmouseenter = () => { sendBtn.style.backgroundColor = "#1d4ed8"; sendBtn.style.transform = "scale(1.01)"; };
    sendBtn.onmouseleave = () => { sendBtn.style.backgroundColor = "#2563eb"; sendBtn.style.transform = "scale(1)"; };

    const handleSend = async () => {
        const answer = input.value.trim();
        if (!answer) {
            input.style.borderColor = "#ef4444";
            setTimeout(() => input.style.borderColor = "", 1000);
            return;
        }

        sendBtn.disabled = true;
        input.disabled = true;
        sendBtn.textContent = "SENDING_UPLINK...";
        sendBtn.style.opacity = "0.7";
        
        try {
            const baseUrl = await resolveLocalApiUrl("");
            const res = await fetch(`${baseUrl}/api/copilot/response`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, answer }),
            });
            
            if (res.ok) {
                container.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px;">
                        <div style="background: #10b981; border-radius: 50%; padding: 4px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 10px; font-weight: 900; color: #10b981; text-transform: uppercase;">Response_Relayed</span>
                            <span style="font-size: 12px; color: #666; font-style: italic;">"${answer}"</span>
                        </div>
                    </div>
                `;
                setTimeout(() => {
                    container.style.opacity = "0";
                    container.style.transform = "translateX(20px)";
                    setTimeout(() => container.remove(), 700);
                }, 2000);
            } else {
                throw new Error("Transmitting error.");
            }
        } catch (_err) {
            sendBtn.disabled = false;
            input.disabled = false;
            sendBtn.textContent = "RETRY_TRANSMISSION";
            sendBtn.style.backgroundColor = "#ef4444";
            sendBtn.style.opacity = "1";
        }
    };

    input.onkeydown = (e) => {
        if (e.key === "Enter") handleSend();
    };

    sendBtn.onclick = handleSend;

    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);
    container.appendChild(inputArea);

    return container;
}
