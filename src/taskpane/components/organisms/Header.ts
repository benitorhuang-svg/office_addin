import { createStatusBanner } from "../molecules/StatusBanner";

export interface HeaderProps {
  title?: string;
  authProvider?: string | null;
  online?: boolean;
}

/**
 * Organism: Taskpane Header
 * High-level component containing Branding and Connection Status.
 */
export function createHeader({ 
  title = "office_Agent", 
  authProvider = null, 
  online = true 
}: HeaderProps): HTMLElement {
  const header = document.createElement("header");
  header.className = "mol-header";
  header.setAttribute("aria-label", title);

  // 1. Connection Status Molecule
  const statusBanner = createStatusBanner({ online, provider: authProvider });
  header.appendChild(statusBanner);

  // 2. Branding (Top Row)
  const top = document.createElement("div");
  top.className = "header-top";

  const brand = document.createElement("div");
  brand.className = "header-brand";

  const logo = document.createElement("img");
  logo.src = "../../assets/logo-premium.png";
  logo.className = "header-logo-img";

  const h1 = document.createElement("h1");
  h1.className = "header-brand-name";
  h1.innerHTML = `<span style="color: var(--primary-color); font-weight: 800;">${title.split('_')[0]}_</span><span>${title.split('_')[1] || ''}</span>`;

  brand.appendChild(logo);
  brand.appendChild(h1);
  top.appendChild(brand);

  header.appendChild(top);

  return header;
}
