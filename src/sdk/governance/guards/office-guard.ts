import { AppError } from "@infra/atoms/app-error.js";
import { logger } from "@shared/logger/index.js";

/**
 * SDK Governance: OfficeGuard
 * Integrated guardrails for all Office domain actions.
 * Enforces brand consistency, document integrity, and structural rules.
 */
export class OfficeGuard {
  /**
   * Terminology: Applies glossary corrections across any text field.
   */
  static applyGlossary(change: Record<string, unknown>, glossary: Record<string, string>): void {
    const textKeys = ["text", "content", "value"];
    for (const key of textKeys) {
      if (typeof change[key] === "string") {
        let text = change[key] as string;
        const corrections: string[] = [];
        for (const [oldTerm, newTerm] of Object.entries(glossary)) {
          if (text.includes(oldTerm)) {
            corrections.push(`'${oldTerm}' -> '${newTerm}'`);
            text = text.replaceAll(oldTerm, newTerm);
          }
        }
        change[key] = text;
        if (corrections.length > 0) {
          const metadata = (change["metadata"] || {}) as Record<string, unknown>;
          change["metadata"] = { ...metadata, glossaryCorrections: corrections };
        }
      }
    }
  }

  /**
   * Safety: Prevents modifications to protected document ranges.
   */
  static enforceProtections(
    change: Record<string, unknown>,
    protectedRanges: Array<{ start: number; end: number; label?: string }>
  ): void {
    const range = change["range"] as { start: number; end: number } | undefined;
    if (range && typeof range.start === "number") {
      for (const pr of protectedRanges) {
        if (range.start < pr.end && range.end > pr.start) {
          throw new AppError(
            `Operation Denied: Target range overlaps protected section "${pr.label || "Locked"}".`,
            403
          );
        }
      }
    }
    // Universal P0: Broad search-replace is forbidden when any protection exists
    if (change["op"] === "find_replace" && !change["range"] && !change["sectionId"]) {
      throw new AppError(
        "Operation Denied: Global find_replace is disabled when protections are present.",
        403
      );
    }
  }

  /**
   * Structure: Validates heading hierarchy to prevent illegal jumps.
   */
  static validateHierarchy(
    change: Record<string, unknown>,
    outline: Array<{ level: number }>
  ): void {
    const maxLevel = outline.length > 0 ? Math.max(...outline.map((o) => o.level)) : 0;
    if (change["op"] === "insert_heading" && typeof change["level"] === "number") {
      if (change["level"] > maxLevel + 1) {
        const corrected = maxLevel + 1;
        logger.warn("OfficeGuard", `Hierarchy Jump: H${change["level"]} -> H${corrected}`);
        change["level"] = corrected;
      }
    }
  }
}
