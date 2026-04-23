/**
 * Molecule: SkillRegistry
 * Dynamically tracks available expert tools and allows runtime loading of utilities.
 */
import { logger } from "@shared/logger/index.js";

interface SkillMetadata {
    name: string;
    description: string;
    path: string;
}

export class SkillRegistry {
    private static registry = new Map<string, SkillMetadata>();

    static register(skill: SkillMetadata) {
        this.registry.set(skill.name, skill);
    }

    static async discover(capability: string) {
        logger.info("SkillRegistry", `Discovering tools for capability: ${capability}`);
        // Return matching tool or undefined if not found
        return Array.from(this.registry.values()).find(s => s.description.includes(capability));
    }
}
