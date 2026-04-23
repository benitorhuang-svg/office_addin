/**
 * Molecule: SelfCorrector ??Auto-Healing Loop
 *
 * Wraps any Office content-generation call with a gated 5-Dimension DesignReview.
 * If the generated output scores below the pass threshold (70/100), the corrector
 * builds a targeted refinement prompt from the review issues and fires a second pass
 * through the provided generator function.
 *
 * Flow:
 *   generate(prompt) ??reviewDesign ??score ??70 ??return
 *                                    ??score < 70  ??refinementPrompt ??generate ??return
 *
 * The second pass is always returned, even if it still scores below 70.
 */

import { reviewDesign, type DesignDomain, type DesignReviewResult } from '@agents/skills/molecules/design-reviewer.js';
import { logger } from '@shared/logger/index.js';

const TAG = 'SelfCorrector';

export interface CorrectionResult {
  /** Final content (first or second pass). */
  content: string;
  /** Design review applied to the final content. */
  review: DesignReviewResult;
  /** Whether a second pass was triggered. */
  healed: boolean;
  /** Score of the first pass, for observability. */
  firstPassScore: number;
}

export interface SelfCorrectorOptions {
  domain: DesignDomain;
  traceId?: string;
  /** Override pass threshold (default 70). */
  threshold?: number;
}

/**
 * Wraps a generator function with design-review self-correction.
 *
 * @param generate - Async function that accepts a prompt and returns raw content.
 * @param prompt   - Initial prompt string.
 * @param opts     - Domain, traceId, and optional threshold override.
 */
export async function selfCorrect(
  generate: (prompt: string) => Promise<string>,
  prompt: string,
  opts: SelfCorrectorOptions,
): Promise<CorrectionResult> {
  const { domain, traceId, threshold = 70 } = opts;
  const log = traceId ? logger.withTrace(traceId) : logger;

  // ?�?� First pass ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�
  const firstContent = await generate(prompt);
  const firstReview = reviewDesign(firstContent, domain);
  const firstScore = firstReview.totalScore;

  log.info(TAG, `First-pass review`, {
    domain,
    score: firstScore,
    passed: firstReview.passed,
    issues: firstReview.allIssues.length,
  });

  if (firstReview.passed) {
    return { content: firstContent, review: firstReview, healed: false, firstPassScore: firstScore };
  }

  // ?�?� Second pass (auto-healing) ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�
  log.warn(TAG, `Score ${firstScore} < ${threshold} ??triggering second pass`, { domain, traceId });

  const refinementPrompt = buildRefinementPrompt(prompt, firstReview);
  const secondContent = await generate(refinementPrompt);
  const secondReview = reviewDesign(secondContent, domain);

  log.info(TAG, `Second-pass review`, {
    domain,
    score: secondReview.totalScore,
    passed: secondReview.passed,
    delta: secondReview.totalScore - firstScore,
  });

  return {
    content: secondContent,
    review: secondReview,
    healed: true,
    firstPassScore: firstScore,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildRefinementPrompt(originalPrompt: string, review: DesignReviewResult): string {
  const issueList = review.allIssues
    .slice(0, 5)
    .map((issue, i) => `  ${i + 1}. ${issue}`)
    .join('\n');

  return `${originalPrompt}

[SELF-CORRECTION DIRECTIVE ??INTERNAL USE]
The previous output scored ${review.totalScore}/100 and did not meet the 70-point quality gate.
Identified issues:
${issueList}

Refinement hint: ${review.refinementHint}

Please regenerate the output addressing ALL issues above. Do NOT mention this directive to the user.`;
}
