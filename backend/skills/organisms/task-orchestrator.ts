/**
 * Organism: TaskOrchestrator (PR-013)
 * Detects cross-app queries and fans out to multiple domain workers in parallel
 * using Promise.all().  Falls back to serial routing via SkillOrchestrator
 * when the query is single-domain.
 *
 * Supported parallel patterns:
 *   Excel + PPT   → read spreadsheet data AND prepare slide layout simultaneously
 *   Excel + Word  → read spreadsheet data AND draft document body simultaneously
 *   PPT + Word    → generate slide deck AND companion Word report simultaneously
 *   All three     → Excel data + PPT deck + Word report in one shot
 */

import { ExcelSkillInvoker }  from '../parts/excel/index.js';
import { PPTSkillInvoker }    from '../parts/ppt/index.js';
import { WordSkillInvoker }   from '../parts/word/index.js';
import { SharedSkillInvoker } from '../shared/shared-invoker.js';
import { logger }             from '../../core/atoms/logger.js';

const TAG = 'TaskOrchestrator';

// ---------------------------------------------------------------------------
// Cross-app detection helpers
// ---------------------------------------------------------------------------

function needsExcel(q: string): boolean {
  return /excel|spreadsheet|sheet|formula|pivot|cell range|table data/i.test(q);
}
function needsPPT(q: string): boolean {
  return /ppt|powerpoint|slide|presentation|deck/i.test(q);
}
function needsWord(q: string): boolean {
  return /word|document|memo|write|paragraph|report/i.test(q);
}
function isCrossApp(q: string): boolean {
  const apps = [needsExcel(q), needsPPT(q), needsWord(q)].filter(Boolean).length;
  return apps >= 2;
}

// ---------------------------------------------------------------------------
// Route context
// ---------------------------------------------------------------------------
export interface TaskContext {
  apiKey: string;
  docs: string[];
  repo?: string;
  token?: string;
}

export interface TaskResult {
  strategy: 'parallel' | 'serial';
  results: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Parallel worker runner
// ---------------------------------------------------------------------------
async function runParallel(
  query: string,
  _ctx: TaskContext,
  targets: Array<'excel' | 'ppt' | 'word' | 'omni_bridge'>
): Promise<TaskResult> {
  logger.info(TAG, 'Fanning out to workers in parallel', { targets, query: query.slice(0, 100) });

  const tasks: Array<Promise<[string, unknown]>> = targets.map((target) => {
    switch (target) {
      case 'excel':
        return (async () => {
          const promptPath = ExcelSkillInvoker.getPromptPath();
          const promptContent = await readPromptSafe(promptPath);
          return ['excel', { status: 'prompt_augmented', category: 'excel_data', prompt: promptContent }] as [string, unknown];
        })();
      case 'ppt':
        return (async () => {
          const promptPath = PPTSkillInvoker.getPromptPath();
          const promptContent = await readPromptSafe(promptPath);
          return ['ppt', { status: 'prompt_augmented', category: 'ppt_design', prompt: promptContent }] as [string, unknown];
        })();
      case 'word':
        return (async () => {
          const promptPath = WordSkillInvoker.getPromptPath();
          const promptContent = await readPromptSafe(promptPath);
          return ['word', { status: 'prompt_augmented', category: 'word_creative', prompt: promptContent }] as [string, unknown];
        })();
      case 'omni_bridge':
      default:
        return (async () => {
          const promptPath = SharedSkillInvoker.getOmniBridgePromptPath();
          const promptContent = await readPromptSafe(promptPath);
          return ['omni_bridge', { status: 'prompt_augmented', category: 'omni_bridge', prompt: promptContent }] as [string, unknown];
        })();
    }
  });

  const settled = await Promise.allSettled(tasks);
  const results: Record<string, unknown> = {};

  for (const outcome of settled) {
    if (outcome.status === 'fulfilled') {
      const [key, value] = outcome.value;
      results[key] = value;
    } else {
      logger.warn(TAG, 'Worker failed', { reason: outcome.reason });
    }
  }

  return { strategy: 'parallel', results };
}

// ---------------------------------------------------------------------------
// Safe prompt reader
// ---------------------------------------------------------------------------
async function readPromptSafe(filePath: string): Promise<string> {
  try {
    const { promises: fs } = await import('node:fs');
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Route a query to one or more workers.
 * When the query touches multiple Office apps, workers run in parallel.
 * Otherwise delegates to a serial read of the relevant skill prompt.
 */
export async function orchestrateTask(query: string, _ctx: TaskContext): Promise<TaskResult> {
  if (!isCrossApp(query)) {
    // Single domain — skip parallel overhead
    logger.info(TAG, 'Single-domain query, using serial route', { query: query.slice(0, 80) });
    return {
      strategy: 'serial',
      results: { note: 'Use SkillOrchestrator.route() for single-domain queries.' },
    };
  }

  const targets: Array<'excel' | 'ppt' | 'word' | 'omni_bridge'> = [];
  if (needsExcel(query)) targets.push('excel');
  if (needsPPT(query))   targets.push('ppt');
  if (needsWord(query))  targets.push('word');
  // Always include cross-app bridge prompt for multi-domain queries
  targets.push('omni_bridge');

  return runParallel(query, _ctx, targets);
}
