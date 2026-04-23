/**
 * Atom: IntentClassifier (PR-011)
 * Uses the Copilot SDK to classify a user query into one of the predefined
 * Nexus skill domains.  Falls back to lightweight keyword matching when the
 * model call fails or is unavailable.
 */

// ---------------------------------------------------------------------------
// Domain label → routing key map
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Keyword fallback rules (same priority order as original orchestrator)
// ---------------------------------------------------------------------------
const KEYWORD_RULES: Array<{ keywords: string[]; label: IntentLabel }> = [
  { keywords: ['related to', 'impact', 'connection', 'dependency', 'what breaks'], label: 'galaxy_graph' },
  { keywords: ['diagram', 'flowchart', 'screenshot', 'architecture diagram'], label: 'vision' },
  { keywords: ['github', 'issue', 'pull request', ' pr ', 'progress report'], label: 'dev_sync' },
  { keywords: ['ppt', 'slide', 'presentation', 'deck', 'powerpoint'], label: 'ppt' },
  { keywords: ['excel', 'sheet', 'spreadsheet', 'formula', 'pivot', 'cell range'], label: 'excel' },
  { keywords: ['data', 'report', 'table', 'chart', 'rows', 'columns'], label: 'excel' },
  { keywords: ['word', 'document', 'write', 'memo', 'report writing', 'paragraph'], label: 'word' },
  { keywords: ['sync', 'export to', 'from excel', 'to ppt', 'to word', 'bridge', 'cross-app', 'transfer'], label: 'cross_app' },
  { keywords: ['recap', 'summarize', 'summary', 'what did we do', '總結', '摘要', '剛才', 'what changed', 'milestone'], label: 'recap' },
  { keywords: ['insight', 'analyse', 'analyze', 'what is the status', 'document status', '洞察', '分析', 'zenith insight', 'current state'], label: 'insight' },
];

function keywordClassify(query: string): IntentLabel {
  const q = query.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => q.includes(kw))) {
      return rule.label;
    }
  }
  return 'vector_search';
}

// ---------------------------------------------------------------------------
// LLM-based classifier
// ---------------------------------------------------------------------------
const CLASSIFIER_SYSTEM_PROMPT = `You are an intent classification engine for the Nexus Office Add-in.
Given a user query, output ONLY one of these JSON labels (no explanation, no markdown, no extra text):
"galaxy_graph" | "vision" | "dev_sync" | "ppt" | "excel" | "word" | "cross_app" | "vector_search" | "recap" | "insight"

Label definitions:
- galaxy_graph: relationship/impact/dependency analysis
- vision: image, diagram, screenshot, or visual interpretation
- dev_sync: GitHub issues, pull requests, or project progress
- ppt: PowerPoint slides, presentations, decks
- excel: Excel spreadsheets, formulas, data tables, charts
- word: Word documents, memos, writing, document editing
- cross_app: syncing or transferring data across Office applications
- recap: summarizing past actions in this session, what changed, milestone review
- insight: analysing current document/spreadsheet state, data insights, document health
- vector_search: general questions, documentation lookup, anything else`;

/**
 * Classify the user query using the Copilot SDK.
 * Returns the label or falls back to keyword matching on any error.
 */
export async function classifyIntent(
  query: string,
  options?: { token?: string; timeoutMs?: number }
): Promise<IntentLabel> {
  const { token, timeoutMs = 5_000 } = options ?? {};

  // If no token provided, skip LLM and use keywords immediately
  if (!token) {
    return keywordClassify(query);
  }

  try {
    // Use GitHub Models REST API directly to avoid CopilotClient constructor type issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchFn: (url: string, init?: RequestInit) => Promise<Response> =
      ((await import('node-fetch')).default as unknown) as typeof fetch;

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetchFn('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: CLASSIFIER_SYSTEM_PROMPT },
          { role: 'user', content: query },
        ],
        max_tokens: 16,
        temperature: 0,
      }),
      signal: controller.signal as AbortSignal,
    });
    clearTimeout(tid);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    type ChatResponse = {
      choices: Array<{ message: { content: string } }>;
    };
    const data = await response.json() as ChatResponse;
    const raw = data.choices?.[0]?.message?.content?.trim().replace(/^"|"$/g, '') ?? '';

    const VALID_LABELS: IntentLabel[] = [
      'galaxy_graph', 'vision', 'dev_sync', 'ppt', 'excel', 'word', 'cross_app', 'vector_search', 'recap', 'insight',
    ];
    const label = raw as IntentLabel;
    if (VALID_LABELS.includes(label)) {
      return label;
    }
  } catch {
    // Classification failure is non-fatal — fall back to keyword matching
  }

  return keywordClassify(query);
}
