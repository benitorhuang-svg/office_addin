/**
 * Molecule: BatchFileDetails
 * A disclosure-style list for project manifest files in a chat bubble.
 */
export function createBatchFileDetails(batchFiles: string[]): HTMLElement {
    const details = document.createElement("details");
    details.className = "nexus-mt-2 nexus-bg-emerald-50 nexus-rounded-16px nexus-border nexus-border-emerald-100 nexus-overflow-hidden nexus-transition-all nexus-group";
    
    const summary = document.createElement("summary");
    summary.className = "nexus-flex nexus-items-center nexus-justify-between nexus-px-4 nexus-py-3 nexus-cursor-pointer nexus-list-none nexus-text-emerald-700 nexus-font-bold nexus-text-11px nexus-uppercase nexus-tracking-wider";
    summary.innerHTML = `
        <div class="nexus-flex nexus-items-center nexus-gap-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <span>Project Manifest (${batchFiles.length})</span>
        </div>
        <svg class="nexus-group-open-rotate-180 nexus-transition-transform" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
    `;

    const list = document.createElement("div");
    list.className = "nexus-px-4 nexus-pb-3 nexus-pt-1 nexus-space-y-1-5";
    batchFiles.forEach(name => {
        const item = document.createElement("div");
        item.className = "nexus-flex nexus-items-center nexus-gap-2-5 nexus-text-11px nexus-font-bold nexus-text-emerald-600/70";
        item.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> <span>${name}</span>`;
        list.appendChild(item);
    });

    details.appendChild(summary);
    details.appendChild(list);
    return details;
}
