import { createWelcomeMessage } from "../molecules/WelcomeMessage";

export interface HistoryContainerProps {
  authProvider: string | null;
}

/**
 * Organism: Chat History Container
 * Manages the message list and initial welcome state.
 */
export function createHistoryContainer({
  authProvider: _authProvider,
}: HistoryContainerProps): HTMLElement {
  const container = document.createElement("div");
  container.id = "chat-history";
  container.className = "flex-1 overflow-y-auto px-5 py-8 space-y-6 scroll-smooth";
  container.setAttribute("aria-live", "polite");

  // Initial Welcome State (Molecule)
  const welcome = createWelcomeMessage();
  container.appendChild(welcome);

  return container;
}
