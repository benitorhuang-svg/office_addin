/**
 * Atom: Word-Specific Prompting Logic
 * Instructions for the AI to provide structural content (Actions).
 */
export const WORD_ACTION_GUIDE = `
[Office Agent 增強提示]
1. 若用戶希望「替換」現有內容或針對當前選取文字進行修改，請在回覆末尾包含：
   <office-action type="replace">優化後的內容</office-action>
2. 若用戶希望「在其後插入」內容，請包含：
   <office-action type="insert">插入的內容</office-action>
請確保內容可以直接被插入 Word 且格式正確。
`;
