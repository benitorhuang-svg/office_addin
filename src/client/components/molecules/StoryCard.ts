import { createLayoutBox } from "../atoms/LayoutBox";

/**
 * Molecule: StoryCard
 * A contextual diagnostic card shown at the end of a preview session.
 */
export function createStoryCard(): HTMLElement {
    const card = createLayoutBox({ className: "nexus-story-card nexus-animate-spring nexus-opacity-0" });
    card.innerHTML = `
        <div class="nexus-text-center nexus-mb-4">
            <span class="nexus-text-xs nexus-font-black nexus-text-slate-400 nexus-uppercase nexus-tracking-tighter">系統診斷建議</span>
            <h5 class="nexus-text-sm nexus-font-black nexus-text-slate-800 nexus-mt-1">啟動高階協作模式</h5>
        </div>
        <div class="nexus-space-y-2 nexus-mb-5">
            <p class="nexus-text-13px nexus-text-slate-500 nexus-leading-relaxed">
                <span class="nexus-text-blue-500 nexus-font-black nexus-mr-2">1.</span>檢測到環境為 [PREVIEW]，建議連線至生產環境以解鎖完整功能。
            </p>
        </div>
        <button class="nexus-btn nexus-btn-primary nexus-w-full nexus-py-3">連線至 ENTERPRISE 環境</button>
    `;
    const btn = card.querySelector('button');
    if (btn) btn.onclick = () => window.dispatchEvent(new CustomEvent('NEXUS_RELOGIN_TRIGGER'));
    return card;
}
