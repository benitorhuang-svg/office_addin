import { createStatusBanner } from "../molecules/StatusBanner";
import { HeaderProps } from "../../types";

/**
 * Organism: Taskpane Header
 * High-level component containing Branding and Connection Status.
 */
export function createHeader({
  title = "office_Agent",
  authProvider = null,
  online = true,
  onClearChat
}: HeaderProps): HTMLElement {
  const header = document.createElement("header");
  header.className = "mol-header";
  header.setAttribute("aria-label", title);

  // 1. Connection Status Molecule (Includes clear/new chat btn)
  const statusBanner = createStatusBanner({ online, provider: authProvider, onClearChat });
  header.appendChild(statusBanner);

  return header;
}
