/**
 * QA Reviewer Agent: Output checking and self-correction.
 * Wraps generation logic with a 5-Dimension DesignReview and auto-healing loops.
 */

import { reviewDesign, type DesignDomain, type DesignReviewResult } from "@agents/skills/molecules/design-reviewer.js";
import { selfCorrect as internalSelfCorrect, type CorrectionResult, type SelfCorrectorOptions } from "@agents/skills/molecules/self-corrector.js";
import { logger } from "@shared/logger/index.js";

const TAG = "QAReviewerAgent";

export class QAReviewerAgent {
  /**
   * Main entry point for the QA Reviewer Agent.
   * Uses self-correction logic to ensure the generated output passes the threshold.
   *
   * @param generate - Async function that accepts a prompt and returns raw content.
   * @param prompt   - Initial prompt string.
   * @param opts     - Domain, traceId, and optional threshold override.
   */
  public static async enforceQuality(
    generate: (prompt: string) => Promise<string>,
    prompt: string,
    opts: SelfCorrectorOptions,
  ): Promise<CorrectionResult> {
    const { domain, traceId } = opts;
    const log = traceId ? logger.withTrace(traceId) : logger;

    log.info(TAG, `QA Reviewer activated for domain [${domain}]`);

    // We delegate the actual loop to the existing selfCorrect molecule,
    // which embodies the 5-Dimension DesignReview mechanism.
    const result = await internalSelfCorrect(generate, prompt, opts);

    if (result.healed) {
      log.warn(TAG, `QA Reviewer intervened and successfully healed output for domain [${domain}]`);
    } else {
      log.info(TAG, `QA Reviewer approved first-pass output for domain [${domain}]`);
    }

    return result;
  }

  /**
   * Standalone review for external auditing.
   */
  public static evaluateOutput(content: string, domain: DesignDomain): DesignReviewResult {
    return reviewDesign(content, domain);
  }
}
