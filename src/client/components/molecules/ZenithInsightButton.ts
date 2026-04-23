import { createLayoutBox } from "@atoms/LayoutBox";
import { createZenithInsightCard } from "./ZenithInsightCard";

/**
 * Molecule: ZenithInsightButton
 *
 * Floating action button (FAB) fixed in the bottom-right of the taskpane.
 * Provides two actions:
 *   ⚡ Insight — content-aware analysis of the current document/sheet.
 *   🏁 Recap  — session milestone summary of the last 5 actions.
 *
 * The card opens in a backdrop overlay and does NOT pollute the main chat.
 */
export function createZenithInsightButton(): HTMLElement {
  let activeCard: HTMLElement | null = null;

  const dismissCard = () => {
    if (activeCard) {
      activeCard.remove();
      activeCard = null;
    }
  };

  const openCard = (mode: 'insight' | 'recap') => {
    dismissCard();
    activeCard = createZenithInsightCard({ mode, onClose: dismissCard });
    document.body.appendChild(activeCard);
  };

  // ── Mini-menu (shown on hover/click of the FAB) ──────────────────────────
  const menu = createLayoutBox({
    className: [
      'nexus-absolute nexus-bottom-full nexus-right-0 nexus-mb-2',
      'nexus-flex nexus-flex-col nexus-gap-1',
      'nexus-opacity-0 nexus-pointer-events-none',
      'nexus-transition-all nexus-duration-200',
    ].join(' '),
  });

  const makeMenuItem = (label: string, onClick: () => void) => {
    const btn = document.createElement('button');
    btn.className = [
      'nexus-flex nexus-items-center nexus-gap-2 nexus-px-3 nexus-py-2',
      'nexus-bg-white nexus-border nexus-border-white-5 nexus-rounded-xl',
      'nexus-text-tiny nexus-font-semibold nexus-text-slate-700 nexus-whitespace-nowrap',
      'nexus-shadow-lg hover:nexus-bg-slate-50 nexus-transition-colors',
    ].join(' ');
    btn.textContent = label;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      hideMenu();
      onClick();
    });
    return btn;
  };

  menu.appendChild(makeMenuItem('⚡ Zenith Insight', () => openCard('insight')));
  menu.appendChild(makeMenuItem('🏁 Session Recap', () => openCard('recap')));

  // ── FAB button ───────────────────────────────────────────────────────────
  const fab = document.createElement('button');
  fab.className = [
    'nexus-w-11 nexus-h-11 nexus-rounded-full',
    'nexus-bg-blue-600 hover:nexus-bg-blue-700',
    'nexus-shadow-lg nexus-shadow-blue-500/30',
    'nexus-flex nexus-items-center nexus-justify-center',
    'nexus-text-white nexus-text-base nexus-transition-all nexus-duration-200',
    'hover:nexus-scale-110 active:nexus-scale-95',
    'nexus-border-2 nexus-border-blue-400/30',
  ].join(' ');
  fab.setAttribute('aria-label', 'Zenith Insight');
  fab.title = 'Zenith Insight / Session Recap';
  fab.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;

  let menuVisible = false;

  const showMenu = () => {
    menuVisible = true;
    menu.classList.remove('nexus-opacity-0', 'nexus-pointer-events-none');
    menu.classList.add('nexus-opacity-100');
  };
  const hideMenu = () => {
    menuVisible = false;
    menu.classList.add('nexus-opacity-0', 'nexus-pointer-events-none');
    menu.classList.remove('nexus-opacity-100');
  };

  fab.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menuVisible) hideMenu(); else showMenu();
  });

  document.addEventListener('click', hideMenu);

  // ── Wrapper ──────────────────────────────────────────────────────────────
  const wrapper = createLayoutBox({
    className: 'nexus-fixed nexus-bottom-6 nexus-right-4 nexus-z-40 nexus-relative',
    children: [menu, fab],
  });

  return wrapper;
}
