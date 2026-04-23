/**
 * Molecule Service: ActionHistory
 *
 * Records user prompts and system actions in the current session.
 * Provides the action log needed by the Recap (Session Checkpoint) feature.
 * Maximum capacity: 50 entries (ring-buffer via slice).
 */

export interface ActionEntry {
  /** Short description of the system action taken (e.g. "ppt_design", "word_creative"). */
  action: string;
  /** Original user prompt (trimmed). */
  prompt: string;
  /** Unix epoch ms. */
  timestamp: number;
}

const MAX_HISTORY = 50;
let history: ActionEntry[] = [];

export const ActionHistory = {
  /** Push a new entry. Call this after every successful AI turn. */
  push(entry: Omit<ActionEntry, 'timestamp'>): void {
    history.push({ ...entry, timestamp: Date.now() });
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }
  },

  /** Return the last `n` entries (default: all). */
  getLast(n?: number): ActionEntry[] {
    return n !== undefined ? history.slice(-n) : [...history];
  },

  /** Clear all recorded history (e.g., on chat clear). */
  clear(): void {
    history = [];
  },

  /** Serialised form for sending to the backend recap endpoint. */
  toPayload(): ActionEntry[] {
    return [...history];
  },
};
