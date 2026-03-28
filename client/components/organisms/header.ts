import { createStatusBanner } from "../molecules/status-banner";
import { HeaderProps } from "../../services/atoms/types";

/**
 * Organism: Taskpane Header
 * High-level component containing Branding and Connection Status.
 */
import { NexusComponent } from "@shared/types";

/**
 * Organism: Taskpane Header
 * High-level component containing Branding and Connection Status.
 */
export function createHeader(initialProps: HeaderProps): NexusComponent {
  const header = document.createElement("header");
  header.className = "nexus-shrink-0 nexus-sticky nexus-top-0 nexus-z-40";

  // Create persistence StatusBanner once to avoid re-mounting hidden states
  const banner = createStatusBanner({ 
      onClearChat: initialProps.onClearChat, 
      onLogout: initialProps.onLogout, 
      onGoHome: initialProps.onGoHome 
  });
  header.appendChild(banner);

  return {
    element: header,
    update: () => {
        // StatusBanner handles its own reactive updates via NexusStateStore subscriptions
    }
  };
}
