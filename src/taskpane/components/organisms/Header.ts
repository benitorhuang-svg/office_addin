import { createStatusBanner } from "../molecules/StatusBanner";
import { HeaderProps } from "../../services/atoms/types";

/**
 * Organism: Taskpane Header
 * High-level component containing Branding and Connection Status.
 */
export function createHeader({
  authProvider = null,
  online = true,
  onClearChat
}: HeaderProps): HTMLElement {
  const header = document.createElement("header");
  header.className = "shrink-0 sticky top-0 z-40";

  // 1. Connection Status Molecule (Includes clear/new chat btn)
  const statusBanner = createStatusBanner({ online, provider: authProvider, onClearChat });
  header.appendChild(statusBanner);

  return header;
}
