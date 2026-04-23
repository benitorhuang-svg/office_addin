/**
 * TaskLifecycleManager
 * Standardizes the execution lifecycle of all office agents:
 * 1. Plan -> 2. Execute -> 3. Review -> 4. Self-Correct -> 5. Finalize
 */
import { selfCorrect } from "@agents/skills/molecules/self-corrector.js";
import { jobManager } from "@infra/molecules/job-manager.js";
import { logger } from "@shared/logger/index.js";

export async function executeStandardLifecycle(
  jobId: string,
  domain: 'excel' | 'word' | 'ppt',
  actionFn: (content: string) => Promise<string>,
  initialPrompt: string
) {
  logger.info("TaskLifecycle", `Starting lifecycle for job ${jobId} in domain ${domain}`);
  jobManager.updateJob(jobId, { progress: 20, subStatus: 'Executing core task...' });

  // Execution flow with self-correction integrated
  const correction = await selfCorrect(
    actionFn,
    initialPrompt,
    { domain, maxRetries: 2 }
  );

  jobManager.updateJob(jobId, { 
    progress: 100, 
    subStatus: correction.review.passed ? 'Finalized' : 'Finalized with warnings' 
  });

  return correction;
}
