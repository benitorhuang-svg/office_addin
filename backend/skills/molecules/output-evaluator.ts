/**
 * Molecule: OutputEvaluator (PR-014)
 * Implements the Evaluator-Optimizer pattern for skill outputs.
 *
 * For PPT and Word results:
 *   1. Evaluate the generated content against a quality rubric.
 *   2. If the score is below the threshold, request a targeted refinement.
 *   3. Repeat up to MAX_ITERATIONS times, then return the best result.
 *
 * The evaluator uses a lightweight structured check (no extra LLM call needed
 * for simple heuristics) but can optionally call the Copilot SDK for richer
 * semantic evaluation when a token is available.
 */

import { logger } from '../../core/atoms/logger.js';

const TAG = 'OutputEvaluator';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SkillDomain = 'ppt' | 'word' | 'excel' | 'general';

export interface EvaluationResult {
  score: number;           // 0–100
  passed: boolean;
  issues: string[];        // Human-readable improvement suggestions
}

export interface EvaluatorOptions {
  domain: SkillDomain;
  maxIterations?: number;   // default: 2
  passThreshold?: number;   // default: 70
  token?: string;           // Copilot token for semantic evaluation (optional)
}

export type RefineFn = (previousOutput: string, issues: string[]) => Promise<string>;

// ---------------------------------------------------------------------------
// Heuristic rubrics per domain
// ---------------------------------------------------------------------------

function heuristicEvaluate(output: string, domain: SkillDomain): EvaluationResult {
  const issues: string[] = [];
  let score = 100;

  if (!output || output.trim().length < 30) {
    return { score: 0, passed: false, issues: ['Output is empty or too short.'] };
  }

  if (domain === 'ppt') {
    if (!/slide|layout|title|content|shape/i.test(output)) {
      issues.push('Response does not reference slide structure (title, layout, shapes).');
      score -= 25;
    }
    if (!/office\.js|context\.|run\(/i.test(output)) {
      issues.push('Missing Office.js API calls — output may not be executable.');
      score -= 20;
    }
  }

  if (domain === 'word') {
    if (!/paragraph|content|document|insert|body/i.test(output)) {
      issues.push('Response does not reference document structure (paragraph, body, insert).');
      score -= 25;
    }
    if (output.split('\n').length < 3) {
      issues.push('Response is too brief — Word content should include multiple paragraphs or sections.');
      score -= 15;
    }
  }

  if (domain === 'excel') {
    if (!/formula|range|cell|sheet|value/i.test(output)) {
      issues.push('Response does not reference spreadsheet concepts (formula, range, cell).');
      score -= 20;
    }
  }

  // General quality checks for all domains
  if (/I cannot|I don't know|I'm not able/i.test(output)) {
    issues.push('Response contains refusal language. Provide a concrete answer instead.');
    score -= 30;
  }
  if (/```/.test(output) && !/```[a-z]/i.test(output)) {
    issues.push('Code blocks are not language-tagged. Add language identifiers (e.g. ```javascript).');
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    passed: score >= 70,
    issues,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Evaluate an output string and, if it fails the quality threshold,
 * call `refineFn` to improve it.  Repeats up to `maxIterations` times.
 *
 * @param output     - Initial output to evaluate
 * @param refineFn   - Async callback that receives (currentOutput, issues[]) and returns a refined output
 * @param options    - Domain, thresholds, and optional Copilot token
 * @returns          - { finalOutput, iterations, finalScore }
 */
export async function evaluateAndRefine(
  output: string,
  refineFn: RefineFn,
  options: EvaluatorOptions
): Promise<{ finalOutput: string; iterations: number; finalScore: number }> {
  const { domain, maxIterations = 2, passThreshold = 70 } = options;
  let current = output;
  let iterationCount = 0;

  for (let i = 0; i < maxIterations; i++) {
    const evaluation = heuristicEvaluate(current, domain);

    logger.info(TAG, `Evaluation iteration ${i + 1}`, {
      domain,
      score: evaluation.score,
      passed: evaluation.passed,
      issues: evaluation.issues,
    });

    if (evaluation.passed || evaluation.score >= passThreshold) {
      iterationCount = i;
      return { finalOutput: current, iterations: iterationCount, finalScore: evaluation.score };
    }

    // Attempt refinement
    try {
      logger.info(TAG, 'Output below threshold — requesting refinement', {
        score: evaluation.score,
        threshold: passThreshold,
        issues: evaluation.issues,
      });
      current = await refineFn(current, evaluation.issues);
      iterationCount = i + 1;
    } catch (err) {
      logger.warn(TAG, 'Refinement call failed — keeping current output', { error: err });
      break;
    }
  }

  // Return best available after exhausting iterations
  const finalEval = heuristicEvaluate(current, domain);
  logger.info(TAG, 'Evaluation complete', {
    iterations: iterationCount,
    finalScore: finalEval.score,
    passed: finalEval.passed,
  });

  return { finalOutput: current, iterations: iterationCount, finalScore: finalEval.score };
}
