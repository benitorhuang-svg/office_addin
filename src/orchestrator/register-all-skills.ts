import { skillRegistry } from "./skill-registry.js";

/**
 * Register all domain-specific skills into the global SkillRegistry.
 * Industrial 5.0: Uses automatic discovery instead of manual hardcoding.
 */
export async function registerAllSkills(): Promise<void> {
  await skillRegistry.discoverAndRegister();
}
