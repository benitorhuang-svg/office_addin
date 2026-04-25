/**
 * Molecule: SkillRegistry
 * Project-level registration center for all AgentSkills.
 */
import { logger } from "@shared/logger/index.js";
import type { AgentSkill } from "@agents/agent-skill.js";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs/promises";

/**
 * Zod Schema for Skill Validation
 * Ensures Industrial Grade 5.0 compliance.
 */
const SkillSchema = z.object({
  name: z.string().regex(/^[a-z0-9_]+$/, "Skill name must be snake_case"),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must follow SemVer (x.y.z)"),
  description: z.string().min(10),
  parameters: z.object({
    type: z.literal("object"),
    properties: z.record(z.string(), z.any()),
    required: z.array(z.string()).optional(),
  }),
  examples: z
    .array(
      z.object({
        input: z.any(),
        output: z.any(),
        reasoning: z.string().min(5, "Reasoning must be substantial"),
      })
    )
    .min(1, "At least one example with reasoning is required"),
  workflow: z.object({
    overview: z.string().min(10),
    whenToUse: z.array(z.string().min(5)).min(1),
    process: z.array(z.string().min(5)).min(1),
    rationalizations: z
      .array(
        z.object({
          excuse: z.string().min(5),
          reality: z.string().min(5),
        })
      )
      .min(1),
    redFlags: z.array(z.string().min(5)).min(1),
    verification: z.array(z.string().min(5)).min(1),
    references: z.array(z.string().min(3)).optional(),
  }),
});

/**
 * SkillRegistry — Centralized singleton for skill discovery and management.
 */
export class SkillRegistry {
  private static instance: SkillRegistry;
  private skills = new Map<string, AgentSkill>();

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): SkillRegistry {
    if (!SkillRegistry.instance) {
      SkillRegistry.instance = new SkillRegistry();
    }
    return SkillRegistry.instance;
  }

  /**
   * Register a single skill with version conflict check and Zod validation.
   */
  public registerSkill(skill: AgentSkill): void {
    // 1. Validate with Zod
    const validation = SkillSchema.safeParse(skill);
    if (!validation.success) {
      logger.error(
        "SkillRegistry",
        `Validation failed for skill: ${skill.name}`,
        validation.error.format()
      );
      throw new Error(`Skill validation failed: ${skill.name}`);
    }

    const existing = this.skills.get(skill.name);
    if (existing) {
      if (existing.version === skill.version) {
        logger.warn(
          "SkillRegistry",
          `Skill ${skill.name} v${skill.version} already registered. Skipping.`
        );
        return;
      }

      // Semantic Versioning logic (simplified: higher version wins)
      const existingVer = existing.version.split(".").map(Number);
      const newVer = skill.version.split(".").map(Number);

      let isNewer = false;
      for (let i = 0; i < 3; i++) {
        const v1 = existingVer[i] ?? 0;
        const v2 = newVer[i] ?? 0;
        if (v2 > v1) {
          isNewer = true;
          break;
        }
        if (v1 > v2) break;
      }

      if (isNewer) {
        logger.info(
          "SkillRegistry",
          `Upgrading skill: ${skill.name} from v${existing.version} to v${skill.version}`
        );
      } else {
        logger.warn(
          "SkillRegistry",
          `Version conflict: ${skill.name} v${existing.version} is already registered and newer or same as v${skill.version}. Skipping.`
        );
        return;
      }
    }

    this.skills.set(skill.name, skill);
    logger.info("SkillRegistry", `Registered skill: ${skill.name} (v${skill.version})`);
  }

  /**
   * Full Automatic Discovery Mechanism.
   * Scans src/agents/expert-* folders for index.ts/js and auto-imports skills.
   */
  public async discoverAndRegister(): Promise<void> {
    logger.info("SkillRegistry", "Starting automatic skill discovery...");
    const agentsDir = path.resolve(process.cwd(), "src", "agents");

    try {
      const entries = await fs.readdir(agentsDir, { withFileTypes: true });
      const expertFolders = entries
        .filter((e) => e.isDirectory() && e.name.startsWith("expert-"))
        .map((e) => e.name);

      for (const folder of expertFolders) {
        const indexPath = path.join(agentsDir, folder, "index.ts");
        try {
          await fs.stat(indexPath);
          const modulePath = `file://${indexPath.replace(/\\/g, "/")}`;
          const module = await import(modulePath);
          const domain = folder.replace("expert-", "");
          const skillKey = `${domain}Skill`;
          const skill =
            module[skillKey] ||
            module.defaultSkill ||
            Object.values(module).find((v) => {
              const val = v as { name?: string; execute?: unknown };
              return val?.name && val?.execute;
            });

          if (skill) {
            this.registerSkill(skill as AgentSkill);
          }
        } catch (err) {
          logger.warn("SkillRegistry", `Skipped ${folder}: ${err}`);
        }
      }

      // Industrial Upgrade: Automatic SDK Sync
      await this.syncToSDKRegistry();
    } catch (error) {
      logger.error("SkillRegistry", "Critical failure during skill discovery", error);
    }

    logger.info("SkillRegistry", `Discovery completed. Total skills: ${this.skills.size}`);
  }

  /**
   * Industrial P5: Synchronize registry state to the integrated SDK registry location.
   * Ensures 'latest.json' is always the single source of truth for all components.
   */
  private async syncToSDKRegistry(): Promise<void> {
    try {
      const snapshot = {
        version: "Omni-Arsenal-AutoSync",
        timestamp: new Date().toISOString(),
        skills: this.getRegistrySnapshot(),
      };
      const sdkRegistryPath = path.resolve(
        process.cwd(),
        "src",
        "sdk",
        "registry",
        "manifests",
        "latest.json"
      );

      // Ensure directory exists
      await fs.mkdir(path.dirname(sdkRegistryPath), { recursive: true });
      await fs.writeFile(sdkRegistryPath, JSON.stringify(snapshot, null, 2), "utf-8");
      logger.info(
        "SkillRegistry",
        `Successfully synchronized ${this.skills.size} skills to SDK Registry.`
      );
    } catch (err) {
      logger.error("SkillRegistry", "Failed to sync to SDK Registry", err);
    }
  }

  /**
   * Dynamic loading mechanism: load skills from a provided array (e.g., from a discovery service).
   */
  public async dynamicLoad(skills: AgentSkill[]): Promise<void> {
    logger.info("SkillRegistry", "Starting dynamic skill loading...");
    for (const skill of skills) {
      try {
        this.registerSkill(skill);
      } catch (error) {
        logger.error("SkillRegistry", `Failed to load skill: ${skill.name}`, error);
      }
    }
    logger.info("SkillRegistry", `Dynamic loading completed. Total skills: ${this.skills.size}`);
  }

  /**
   * Register multiple skills at once.
   */
  public registerSkills(skills: AgentSkill[]): void {
    skills.forEach((skill) => this.registerSkill(skill));
  }

  /**
   * Find a specific skill by name.
   */
  public findSkill(name: string): AgentSkill | undefined {
    return this.skills.get(name);
  }

  /**
   * Return all registered tools in OpenAI-compatible format.
   * Aligned with Industrial Grade Spec.
   */
  public toOpenAITools() {
    return Array.from(this.skills.values()).map((skill) => ({
      type: "function" as const,
      function: {
        name: skill.name,
        description: `${skill.description} Workflow: ${skill.workflow.process.slice(0, 3).join(" -> ")}`,
        parameters: skill.parameters,
        strict: true, // Industrial safety
      },
    }));
  }

  /**
   * Export a complete snapshot of the registry with all metadata.
   * Useful for high-fidelity context injection or debugging.
   */
  public getRegistrySnapshot() {
    return Array.from(this.skills.values()).map((skill) => ({
      name: skill.name,
      version: skill.version,
      description: skill.description,
      trigger: skill.trigger,
      logic: skill.logic,
      intent_labels: skill.intent_labels,
      examples: skill.examples,
      edge_cases: skill.edge_cases,
      parallel_safe: skill.parallel_safe,
      workflow: skill.workflow,
      parameters: skill.parameters,
    }));
  }

  /**
   * Return all registered tools in OpenAI-compatible format (legacy).
   */
  public getAllTools() {
    return this.toOpenAITools();
  }

  /**
   * Get all registered skill instances.
   */
  public getSkills(): AgentSkill[] {
    return Array.from(this.skills.values());
  }

  /**
   * (Optional) Runtime discovery based on capability search.
   */
  public async discover(capability: string): Promise<AgentSkill | undefined> {
    return Array.from(this.skills.values()).find(
      (s) =>
        s.description.toLowerCase().includes(capability.toLowerCase()) ||
        s.name.includes(capability.toLowerCase())
    );
  }
}

// Export the singleton instance
export const skillRegistry = SkillRegistry.getInstance();
