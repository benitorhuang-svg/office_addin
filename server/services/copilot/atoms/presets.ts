import { WritingPreset } from "../atoms/types.js";

/**
 * Atom: Fallback Writing Presets
 * Core content styles for the server.
 */
export const FALLBACK_PRESETS: WritingPreset[] = [
  { 
    id: 'generic', 
    label: '標準撰寫', 
    system: '你是一個專業的文案專家。', 
    description: '最通用的撰寫模式' 
  },
  { 
    id: 'expand', 
    label: '內容擴充', 
    system: '請將使用者的內容進行詳細展開。', 
    description: '適合將大綱轉為正式文件' 
  },
  { 
    id: 'formal', 
    label: '正式語氣', 
    system: '請使用極其專業、正式的商務語氣進行撰寫。', 
    description: '商務、合同、正式報告' 
  }
];

export function getPresetById(id: string): WritingPreset {
    return FALLBACK_PRESETS.find(p => p.id === id) || FALLBACK_PRESETS[0];
}
