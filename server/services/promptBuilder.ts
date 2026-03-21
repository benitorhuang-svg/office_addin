import config from '../config/env.js';

export interface WritingPreset {
  id: string;
  label: string;
  system: string;
  description: string;
}

const FALLBACK_PRESETS: WritingPreset[] = [
  { id: 'generic', label: '標準撰寫', system: '你是一個專業的文案專家。', description: '最通用的撰寫模式' },
  { id: 'expand', label: '內容擴充', system: '請將使用者的內容進行詳細展開。', description: '適合將大綱轉為正式文件' },
  { id: 'formal', label: '正式語氣', system: '請使用極其專業、正式的商務語氣進行撰寫。', description: '商務、合同、正式報告' }
];

export function getWritingPresets(): WritingPreset[] {
  return FALLBACK_PRESETS; // In a real app, you might load from a DB
}

export function buildWordPrompt(prompt: string, officeContext: any, _model: string, presetId: string) {
  const preset = FALLBACK_PRESETS.find(p => p.id === presetId) || FALLBACK_PRESETS[0];

  return {
    system: `${preset.system}\n\n指令語系：${config.DEFAULT_RESPONSE_LANGUAGE}\n人格：${config.DEFAULT_PERSONA}`,
    user: `### Word Context ###\n${JSON.stringify(officeContext, null, 2)}\n\n### User Task ###\n${prompt}`
  };
}

export function parseAssistantResponse(text: string, _context: any) {
  // Simple extraction for now - could be smarter
  const officeActions: any[] = [];
  
  // Future: Extract markdown-fence based actions
  return {
    text,
    officeActions
  };
}
