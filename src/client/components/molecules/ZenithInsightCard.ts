import { createLayoutBox } from "@atoms/LayoutBox";
import { NexusStateStore } from "@services/molecules/global-state";
import { ActionHistory } from "@services/molecules/ActionHistory";
import { sendToCopilot } from "@services/organisms/api-orchestrator";

/**
 * Molecule: ZenithInsightCard
 *
 * HUD-style floating card that renders a content-aware summary of the
 * current document/spreadsheet (Insight) or a session Milestone Report (Recap).
 * Triggered by ZenithInsightButton — does NOT pollute the main chat thread.
 */

type InsightMode = 'insight' | 'recap';

interface ZenithInsightCardProps {
  mode: InsightMode;
  onClose: () => void;
}

export function createZenithInsightCard({ mode, onClose }: ZenithInsightCardProps): HTMLElement {
  // ── Overlay backdrop ─────────────────────────────────────────────────────
  const backdrop = createLayoutBox({
    className: [
      'nexus-fixed nexus-inset-0 nexus-z-50',
      'nexus-bg-black/40 nexus-backdrop-blur-sm',
      'nexus-flex nexus-items-end nexus-justify-center nexus-p-4',
    ].join(' '),
  });

  // ── Card shell ───────────────────────────────────────────────────────────
  const card = createLayoutBox({
    className: [
      'nexus-w-full nexus-max-w-md nexus-max-h-96',
      'nexus-bg-white nexus-rounded-2xl nexus-shadow-2xl',
      'nexus-border nexus-border-white-5',
      'nexus-flex nexus-flex-col nexus-overflow-hidden',
      'nexus-animate-slide-up',
    ].join(' '),
  });

  // ── Header row ───────────────────────────────────────────────────────────
  const title = mode === 'insight' ? '⚡ Zenith Insight' : '🏁 Session Recap';
  const subtitle = mode === 'insight' ? 'Document / Data Analysis' : 'Milestone Report';

  const headerRow = createLayoutBox({
    className: 'nexus-flex nexus-items-center nexus-justify-between nexus-px-5 nexus-py-3 nexus-border-b nexus-border-white-5 nexus-shrink-0',
    children: [
      (() => {
        const h = createLayoutBox({ tag: 'div', className: 'nexus-flex nexus-flex-col nexus-gap-0.5' });
        const t = document.createElement('span');
        t.className = 'nexus-text-sm nexus-font-bold nexus-text-slate-900';
        t.textContent = title;
        const s = document.createElement('span');
        s.className = 'nexus-text-tiny nexus-text-slate-400 nexus-uppercase nexus-tracking-widest';
        s.textContent = subtitle;
        h.appendChild(t);
        h.appendChild(s);
        return h;
      })(),
      (() => {
        const btn = document.createElement('button');
        btn.className = 'nexus-w-7 nexus-h-7 nexus-rounded-full nexus-flex nexus-items-center nexus-justify-center nexus-text-slate-400 hover:nexus-bg-slate-100 nexus-transition-colors';
        btn.textContent = '✕';
        btn.addEventListener('click', onClose);
        return btn;
      })(),
    ],
  });

  // ── Content area ─────────────────────────────────────────────────────────
  const content = createLayoutBox({
    className: 'nexus-flex-1 nexus-overflow-y-auto nexus-px-5 nexus-py-4 nexus-text-sm nexus-text-slate-700 nexus-leading-relaxed',
  });

  // Loading spinner
  const spinner = document.createElement('div');
  spinner.className = 'nexus-flex nexus-items-center nexus-gap-3 nexus-text-slate-400 nexus-text-tiny nexus-uppercase nexus-tracking-widest nexus-animate-pulse';
  spinner.innerHTML = `<div class="nexus-w-3 nexus-h-3 nexus-rounded-full nexus-bg-blue-500 nexus-animate-ping"></div> Analysing…`;
  content.appendChild(spinner);

  card.appendChild(headerRow);
  card.appendChild(content);
  backdrop.appendChild(card);

  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) onClose();
  });

  // ── Async: fire the AI request ────────────────────────────────────────────
  void fetchInsight(mode, content, spinner);

  return backdrop;
}

// ---------------------------------------------------------------------------
// Async AI fetch
// ---------------------------------------------------------------------------

async function fetchInsight(mode: InsightMode, container: HTMLElement, spinner: HTMLElement): Promise<void> {
  try {
    const state = NexusStateStore.getState();
    const auth = (window as unknown as { __nexusAuth?: { getAccessToken: () => Promise<string>; getAuthProvider: () => string; getGeminiToken: () => Promise<string | undefined> } }).__nexusAuth;

    const actionHistory = mode === 'recap' ? ActionHistory.toPayload() : undefined;

    const queryText = mode === 'insight'
      ? 'Analyse the current document and provide a Zenith Insight summary.'
      : 'Summarise the session actions as a Milestone Report.';

    const accessToken = await auth?.getAccessToken();
    const geminiToken = await auth?.getGeminiToken();
    const authProvider = auth?.getAuthProvider() ?? 'copilot_cli';

    const response = await sendToCopilot(
      queryText,
      accessToken ?? '',
      { selectedText: '', host: state.isExcelActive ? 'Excel' : 'Word' },
      state.selectedModel ?? 'gpt-4o',
      mode === 'insight' ? 'insight' : 'recap',
      authProvider,
      (geminiToken as string | null),
      /* systemPrompt */ undefined,
      /* onChunk */ undefined,
    );

    // Replace spinner with formatted result
    spinner.remove();
    const pre = document.createElement('div');
    pre.className = 'nexus-prose nexus-prose-sm nexus-max-w-none';
    pre.innerHTML = formatMarkdown(String(typeof response === 'string' ? response : (response as { text?: string }).text ?? '(no response)'));
    container.appendChild(pre);

    // Record the insight/recap itself as an action
    ActionHistory.push({ action: mode, prompt: queryText });

    // Optionally include action history in the request body through a custom header
    // (if actionHistory is available — future enhancement via direct fetch to /api/recap)
    void actionHistory; // consumed by future direct endpoint

  } catch (err) {
    spinner.remove();
    const errEl = document.createElement('p');
    errEl.className = 'nexus-text-red-500 nexus-text-sm';
    errEl.textContent = `Failed to generate ${mode}: ${(err as Error).message}`;
    container.appendChild(errEl);
  }
}

function formatMarkdown(md: string): string {
  // Minimal safe Markdown → HTML (headings, bold, lists)
  return md
    .replace(/^## (.+)$/gm, '<h3 class="nexus-font-bold nexus-text-slate-900 nexus-mt-3 nexus-mb-1">$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 class="nexus-font-semibold nexus-text-slate-800 nexus-mt-2 nexus-mb-1">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^[-*] (.+)$/gm, '<li class="nexus-ml-4">$1</li>')
    .replace(/(<li[\s\S]+?<\/li>)/g, '<ul class="nexus-list-disc nexus-my-1">$1</ul>')
    .replace(/\n\n+/g, '</p><p class="nexus-mb-2">')
    .replace(/^(.+)$/, '<p class="nexus-mb-2">$1</p>');
}
