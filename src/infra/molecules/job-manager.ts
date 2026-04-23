/**
 * Molecule: JobManager
 * Manages long-running async tasks (PPT rendering, complex Excel modeling)
 * and provides progress updates via the StateManager.
 */

import { randomUUID } from "node:crypto";
import { globalStateManager } from "@orchestrator/state-manager.js";
import { logger } from "@shared/logger/index.js";

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  sessionId: string;
  task: string;
  status: JobStatus;
  progress: number;
  subStatus: string;
}

class JobManager {
  private jobs = new Map<string, Job>();

  createJob(sessionId: string, task: string): string {
    const id = randomUUID();
    const job: Job = { id, sessionId, task, status: 'queued', progress: 0, subStatus: 'Initializing...' };
    this.jobs.set(id, job);
    return id;
  }

  updateJob(id: string, updates: Partial<Job>) {
    const job = this.jobs.get(id);
    if (job) {
      Object.assign(job, updates);
      // Sync to StateManager for UI consumption
      globalStateManager.updateState(job.sessionId, { 
        progress: job.progress, 
        subStatus: job.subStatus 
      });
      logger.info("JobManager", `Job ${id} updated: ${job.status} - ${job.progress}%`);
    }
  }
}

export const jobManager = new JobManager();
