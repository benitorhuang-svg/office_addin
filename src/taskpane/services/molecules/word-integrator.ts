/* global Word */
import { marked } from "marked";
import { ChatOrchestrator } from "../chat-orchestrator";

/**
 * Molecule: Word Integrator
 * Handles interaction with the Word document through Office.js.
 */
export const WordIntegrator = {
  /**
   * Applies content to Word, intelligently choosing between HTML and raw text.
   */
  async applyContent(content: string) {
    if (!content) return;

    // Check if it's the preview guide (has HTML tags like <br>) or has markdown markers
    if (content.includes("<br>") || content.includes("<li>") || content.includes("**")) {
      // Use Word's insertHtml for better layout (Supports Bold, Lists, Breaks)
      await Word.run(async (context) => {
        const range = context.document.getSelection();
        // Convert Markdown to true HTML (strong tags instead of **)
        const renderedHtml = marked.parse(content);
        
        // Use the centralized font style from orchestrator config
        const style = ChatOrchestrator.config.DEFAULT_WORD_FONT_STYLE || 
                      "font-family: '微軟正黑體', 'Microsoft JhengHei', 'Segoe UI', sans-serif; font-size: 11pt;";
        
        const htmlWrapper = `
          <html>
            <head>
              <style>
                body { ${style} }
              </style>
            </head>
            <body>${renderedHtml}</body>
          </html>`;
        
        range.insertHtml(htmlWrapper, Word.InsertLocation.replace);
        await context.sync();
      });
    } else {
      // Fallback for real AI responses: Strip any remaining raw tags and insert
      const cleanContent = content.replace(/<[^>]*>?/gm, "");
      const { insertTextIntoWord } = await import("../word-actions");
      await insertTextIntoWord(cleanContent, true);
    }
  }
};
