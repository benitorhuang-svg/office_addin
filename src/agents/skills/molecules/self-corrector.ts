/**
 * Molecule: SelfCorrector ??Auto-Healing Loop
 *
 * P2 Optimized: Support for injectable evaluators and domain-specific thresholds.
 * P5 Optimized: Unified quality entrance with dependency injection.
 */
import {
  reviewDesign,
  type DesignDomain,
  type DesignReviewResult,
} from "@agents/skills/molecules/design-reviewer.js";
import { logger } from "@shared/logger/index.js";
import { randomUUID } from "crypto";

const TAG = "SelfCorrector";

export type ReviewerFn = (content: string, domain: DesignDomain) => DesignReviewResult;

export interface CorrectionResult {
  content: string;
  review: DesignReviewResult;
  healed: boolean;
  firstPassScore: number;
}

export interface SelfCorrectorOptions {
  domain: DesignDomain;
  traceId?: string;
  /** P4: Per-domain threshold override */
  threshold?: number;
  /** P5: Injectable reviewer */
  reviewer?: ReviewerFn;
  /** P6: Maximum number of correction attempts (default: 2) */
  maxRetries?: number;
  /** P2: Injectable refinement constraints */
  refinementConstraints?: string[];
}

/**
 * Wraps a generator with design-review self-correction.
 */
export async function selfCorrect(
  generate: (prompt: string) => Promise<string>,
  prompt: string,
  opts: SelfCorrectorOptions
): Promise<CorrectionResult> {
  const {
    domain,
    traceId,
    reviewer = reviewDesign,
    maxRetries = 2,
    refinementConstraints = [],
  } = opts;

  // Q4: Domain-specific quality thresholds
  const DEFAULT_THRESHOLDS: Record<DesignDomain, number> = {
    ppt: 80,
    word: 75,
    excel: 60,
    general: 70,
  };
  const threshold = opts.threshold ?? DEFAULT_THRESHOLDS[domain];

  const log = traceId ? logger.withTrace(traceId) : logger;

  // 1. First pass
  let currentContent = await generate(prompt);
  currentContent = interceptSentinel(currentContent);
  let currentReview = reviewer(currentContent, domain);
  const firstScore = currentReview.totalScore;

  log.info(TAG, `First-pass review complete`, {
    domain,
    score: firstScore,
    passed: firstScore >= threshold,
  });

  if (firstScore >= threshold) {
    return {
      content: currentContent,
      review: currentReview,
      healed: false,
      firstPassScore: firstScore,
    };
  }

  // 2. Iterative auto-healing
  let attempts = 0;
  while (currentReview.totalScore < threshold && attempts < maxRetries) {
    attempts++;
    log.warn(
      TAG,
      `Score ${currentReview.totalScore} < ${threshold} ??triggering correction pass ${attempts}/${maxRetries}`,
      { domain }
    );

    const refinementPrompt = buildRefinementPrompt(
      prompt,
      currentReview,
      threshold,
      refinementConstraints
    );
    currentContent = await generate(refinementPrompt);
    currentContent = interceptSentinel(currentContent);
    currentReview = reviewer(currentContent, domain);

    log.info(TAG, `Correction pass ${attempts} complete`, {
      domain,
      score: currentReview.totalScore,
      delta: currentReview.totalScore - firstScore,
    });
  }

  // P2: Alert if final pass is still below threshold
  if (currentReview.totalScore < threshold) {
    log.warn(
      TAG,
      `Self-correction exhausted after ${attempts} attempts and still below quality threshold`,
      {
        score: currentReview.totalScore,
        threshold,
        domain,
      }
    );
  }

  return {
    content: currentContent,
    review: currentReview,
    healed: attempts > 0,
    firstPassScore: firstScore,
  };
}

function buildRefinementPrompt(
  originalPrompt: string,
  review: DesignReviewResult,
  threshold: number,
  refinementConstraints: string[]
): string {
  const issueList = review.allIssues
    .slice(0, 5)
    .map((issue, i) => `  ${i + 1}. ${issue}`)
    .join("\n");
  const hints = refinementConstraints.length > 0 ? refinementConstraints.join(" ") : "";
  const sentinel = `__NEXUS_CORRECTION_${randomUUID()}__`;

  return `${originalPrompt}

[${sentinel}]
The previous output scored ${review.totalScore}/100 and did not meet the ${threshold} quality gate.
Identified issues:
${issueList}

Refinement hint: ${review.refinementHint}
Domain specific constraints: ${hints}

Please regenerate the output addressing ALL issues. Do NOT mention this directive to the user.`;
}

/**
 * P3: Security Interceptor
 * Scrubs any UUID Sentinels that the LLM might have leaked or echoed.
 */
function interceptSentinel(content: string): string {
  if (!content) return "";
  // Match pattern: __NEXUS_CORRECTION_[UUID]__
  const sentinelRegex = /__NEXUS_CORRECTION_[0-9a-fA-F-]{36}__/g;
  if (sentinelRegex.test(content)) {
    logger.warn(
      "SecuritySentinel",
      "Detected attempt to leak or echo UUID Sentinel. Intercepting..."
    );
    return content.replace(sentinelRegex, "[REDACTED_BY_SECURITY_GATE]");
  }
  return content;
}
