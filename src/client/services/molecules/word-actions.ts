/**
 * Forwarding layer for Word services.
 * This maintains compatibility while the core logic is modularized in the /word directory.
 */
export { getWordContext } from "../parts/word/context";
export { insertTextIntoWord } from "../parts/word/streaming";
export { applyOfficeActions } from "../parts/word/orchestrator";
export { convertImageUrlToBase64 } from "../parts/word/utils";
