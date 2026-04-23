/**
 * Molecule: Plus Menu
 * Handles file and folder attachment actions.
 */
export function createPlusMenu() {
    const wrapper = document.createElement("div");
    wrapper.className = "nexus-relative";

    const btn = document.createElement("button");
    btn.className = "nexus-w-10 nexus-h-10 nexus-flex nexus-items-center nexus-justify-center nexus-rounded-full nexus-bg-slate-50 nexus-text-slate-400 nexus-hover-bg-blue-50 nexus-hover-text-blue-600 nexus-transition-all nexus-cursor-pointer";
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`;

    const menu = document.createElement("div");
    // NUCLEAR FIX: Injected high-priority inline styles to bypass flex-compression
    menu.className = "nexus-absolute nexus-left-0 nexus-backdrop-blur-3xl nexus-border nexus-border-white/40 nexus-rounded-24px nexus-shadow-2xl nexus-z-100 nexus-p-2-5 nexus-hidden nexus-animate-spring";
    menu.style.background = "linear-gradient(165deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)";
    menu.style.top = "calc(100% + 10px)";
    menu.style.boxShadow = "0 30px 70px -15px rgba(15, 23, 42, 0.15), 0 10px 30px -5px rgba(15, 23, 42, 0.05)";
    
    // Forced Horizontal Integrity
    menu.style.setProperty("width", "max-content", "important");
    menu.style.setProperty("min-width", "256px", "important");
    menu.style.setProperty("white-space", "nowrap", "important");

    const createMenuItem = (icon: string, title: string, onClick?: () => void) => {
        const item = document.createElement("button");
        item.className = "nexus-w-full nexus-flex nexus-items-center nexus-gap-4-5 nexus-px-4-5 nexus-py-3-5-plus nexus-rounded-16px nexus-hover-bg-blue-600/5 nexus-text-slate-600 nexus-hover-text-blue-600 nexus-transition-all nexus-cursor-pointer nexus-border-none nexus-text-left nexus-mb-1-5";
        item.style.padding = "15px 18px";
        item.innerHTML = `<span class="nexus-text-slate-400 nexus-transition-colors">${icon}</span><span class="nexus-text-sm nexus-font-bold nexus-tracking-tight">${title}</span>`;
        if (onClick) item.onclick = (e) => { e.stopPropagation(); onClick(); menu.classList.add("nexus-hidden"); };
        return item;
    };

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";
    fileInput.onchange = () => {
        window.dispatchEvent(new CustomEvent("NEXUS_ATTACH_FILE", { detail: fileInput.files?.[0] }));
        fileInput.value = "";
    };

    const directoryInput = document.createElement("input");
    directoryInput.type = "file";
    directoryInput.setAttribute("webkitdirectory", "");
    directoryInput.style.display = "none";
    directoryInput.onchange = () => {
        const files = Array.from(directoryInput.files || []);
        if (files.length === 0) return;
        window.dispatchEvent(new CustomEvent("NEXUS_ATTACH_BATCH", { detail: files.map(f => f.name) }));
        directoryInput.value = "";
    };

    menu.appendChild(createMenuItem(`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`, "附帶文件內容", () => fileInput.click()));
    menu.appendChild(createMenuItem(`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`, "上傳資料夾", () => directoryInput.click()));

    btn.onclick = (e) => {
        e.stopPropagation();
        menu.classList.toggle("nexus-hidden");
        // Use Global Close Strategy for sibling menus
        document.querySelectorAll(".nexus-absolute:not(.nexus-hidden)").forEach(el => {
            if (el !== menu) el.classList.add("nexus-hidden");
        });
    };

    const closeHandler = () => menu.classList.add("nexus-hidden");
    document.addEventListener("click", closeHandler);

    wrapper.appendChild(btn);
    wrapper.appendChild(menu);
    wrapper.appendChild(fileInput);
    wrapper.appendChild(directoryInput);

    return { 
        element: wrapper, 
        close: closeHandler,
    };
}
