/**
 * Forwarding layer for Word services.
 * This maintains compatibility while the core logic is modularized in the /word directory.
 */
export { getWordContext } from "../word/context";
export { insertTextIntoWord } from "../word/streaming";
export { applyOfficeActions } from "../word/orchestrator";
export { convertImageUrlToBase64 } from "../word/utils";
