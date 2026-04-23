/**
 * Molecule Service: Word Integrator
 * Coordinates all high-level interactions with the Office/Word Host.
 */
import { getWordContext as getRawContext, applyOfficeActions as applyRawActions } from "../molecules/word-actions";

export class WordIntegrator {
    
    /**
     * Gathers the current context from the Word document (Selection, Metadata).
     */
    public static async gatherContext() {
        console.log("%c[WORD_INTEGRATOR] Gathering Document Context...", "color: #06b6d4;");
        return await getRawContext();
    }

    /**
     * Applies AI-generated content or structural changes to the document.
     * Handles both direct text replacement and complex Office Actions.
     */
    public static async applyChanges(actions: { type: string; value: string }[] = []) {
        try {
            console.log("%c[WORD_INTEGRATOR] Committing Changes to Document...", "color: #06b6d4;");
            
            // 1. Apply primary text content if applicable
            // (Wait! Usually the orchestrator decides if it's a full replacement or incremental)
            
            // 2. Apply structured actions (Hyperlinks, Tables, Styles)
            if (actions && actions.length > 0) {
                await applyRawActions(actions, "");
            }
        } catch (error) {
            console.error("[WORD_INTEGRATOR] Failed to apply changes:", error);
            throw error;
        }
    }

    /**
     * Simple content insertion at selection.
     */
    public static async insertText(text: string) {
        if (typeof Office !== "undefined" && Office.context.host) {
            return Word.run(async (context) => {
                const range = context.document.getSelection();
                range.insertText(text, Word.InsertLocation.replace);
                await context.sync();
            });
        }
    }
}
