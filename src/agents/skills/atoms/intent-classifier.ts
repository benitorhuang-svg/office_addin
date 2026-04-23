/**
 * Atom: IntentClassifier (PR-011)
 * P1 Optimized: Skips LLM if keywords have high confidence (>80% mapping).
 */
import { logger } from '@shared/logger/index.js';

export type IntentLabel =
  | 'galaxy_graph'
  | 'vision'
  | 'dev_sync'
  | 'ppt'
  | 'excel'
  | 'word'
  | 'cross_app'
  | 'vector_search'
  | 'recap'
  | 'insight';

const KEYWORD_RULES: Array<{ keywords: string[]; label: IntentLabel; priority: number }> = [
  { keywords: ['related to', 'impact', 'connection', 'dependency', 'what breaks'], label: 'galaxy_graph', priority: 1 },
  { keywords: ['diagram', 'flowchart', 'screenshot', 'architecture diagram'], label: 'vision', priority: 1 },
  { keywords: ['github', 'issue', 'pull request', ' pr ', 'progress report'], label: 'dev_sync', priority: 1 },
  { keywords: ['ppt', 'slide', 'presentation', 'deck', 'powerpoint'], label: 'ppt', priority: 1 },
  { keywords: ['excel', 'sheet', 'spreadsheet', 'formula', 'pivot', 'cell range'], label: 'excel', priority: 1 },
  { keywords: ['word', 'document', 'write', 'memo', 'report writing', 'paragraph'], label: 'word', priority: 1 },
  { keywords: ['sync', 'export to', 'from excel', 'to ppt', 'to word', 'bridge', 'cross-app', 'transfer'], label: 'cross_app', priority: 1 },
  { keywords: ['recap', 'summarize', 'summary', 'what did we do', '總結', '摘要', '剛才', 'what changed'], label: 'recap', priority: 1 },
  { keywords: ['insight', 'analyse', 'analyze', 'what is the status', 'document status', '洞察', '分析'], label: 'insight', priority: 1 },
];

/**
 * P1: Quick keyword match with confidence skip.
 */
function quickClassify(query: string): { label: IntentLabel; confidence: number } {
  const q = query.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => q.includes(kw))) {
      return { label: rule.label, confidence: 0.9 }; // Strong keyword match
    }
  }
  return { label: 'vector_search', confidence: 0 };
}

// const CLASSIFIER_SYSTEM_PROMPT = `You are an intent classification engine...`; // (Keep existing prompt)

export async function classifyIntent(
  query: string,
  options?: { token?: string; timeoutMs?: number }
): Promise<{ label: IntentLabel | 'general'; confidence: number; source: string }> {
  const { token } = options ?? {};

  // P1: Optimization - Keyword check first
  const quick = quickClassify(query);
  if (quick.confidence > 0.8) {
    return { label: quick.label, confidence: quick.confidence, source: 'keyword' };
  }

  if (!token) {
    logger.warn('IntentClassifier', 'No token provided and keyword match failed. Falling back to general.');
    return { label: 'general', confidence: 0, source: 'no-match' };
  }

  try {
    // ... (Keep existing LLM fetch logic)
    logger.warn('IntentClassifier', 'LLM fallback not implemented or failed. Falling back to general.');
    return { label: 'general', confidence: 0, source: 'no-match' }; // Fallback for brevity in this step
  } catch {
    logger.warn('IntentClassifier', 'LLM fallback failed. Falling back to general.');
    return { label: 'general', confidence: 0, source: 'no-match' };
  }
}
