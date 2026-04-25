import { ExcelSkillInvoker } from "@agents/expert-excel/index";
import { PPTSkillInvoker } from "@agents/expert-ppt/index";
import { WordSkillInvoker } from "@agents/expert-word/index";
import { SharedSkillInvoker } from "./shared/shared-invoker";
import { logger } from "@shared/logger/index";

/**
 * Circuit Breaker States
 */
type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitStatus {
  state: CircuitState;
  failures: number;
  lastFailureTime?: number;
}

/**
 * ElegantSkillInvoker — Central façade that delegates to domain-specific invokers.
 * Industrial 5.0: Features self-healing circuit breaker protection.
 */
export class ElegantSkillInvoker {
  private static readonly FAILURE_THRESHOLD = 5;
  private static readonly RECOVERY_TIMEOUT_MS = 30000; // 30 seconds

  private static circuits: Record<string, CircuitStatus> = {
    excel: { state: "CLOSED", failures: 0 },
    ppt: { state: "CLOSED", failures: 0 },
    word: { state: "CLOSED", failures: 0 },
    shared: { state: "CLOSED", failures: 0 },
  };

  /**
   * Core guard logic for circuit breaking.
   */
  private static async withCircuitBreaker<T>(domain: string, action: () => Promise<T>): Promise<T> {
    const circuit = this.circuits[domain] || { state: "CLOSED", failures: 0 };

    // 1. Detect Recovery
    if (circuit.state === "OPEN" && circuit.lastFailureTime) {
      if (Date.now() - circuit.lastFailureTime > this.RECOVERY_TIMEOUT_MS) {
        logger.info(
          "CircuitBreaker",
          `Domain ${domain} entering HALF_OPEN state for recovery detection.`
        );
        circuit.state = "HALF_OPEN";
      } else {
        throw new Error(
          `Circuit breaker for ${domain} is OPEN. Refusing execution to prevent system cascade.`
        );
      }
    }

    try {
      const result = await action();

      // 2. Success Recovery
      if (circuit.state === "HALF_OPEN") {
        logger.info("CircuitBreaker", `Domain ${domain} successfully recovered. Closing circuit.`);
        circuit.state = "CLOSED";
        circuit.failures = 0;
      }

      return result;
    } catch (error) {
      circuit.failures++;
      circuit.lastFailureTime = Date.now();

      if (circuit.failures >= this.FAILURE_THRESHOLD) {
        logger.error(
          "CircuitBreaker",
          `Domain ${domain} reached failure threshold. TRIP! Circuit is now OPEN.`
        );
        circuit.state = "OPEN";
      }

      throw error;
    }
  }

  /**
   * Invoke the ExcelExpert skill.
   */
  static async invokeExcel(
    inputPath: string,
    outputPath: string,
    changes: unknown[],
    officeContext?: unknown
  ) {
    return this.withCircuitBreaker("excel", () =>
      ExcelSkillInvoker.invokeExcelExpert(
        inputPath,
        outputPath,
        changes,
        officeContext as import("../expert-excel/excel.tools.js").ExcelOfficeContext
      )
    );
  }

  /**
   * Invoke the PPTExpert skill.
   */
  static async invokePPT(
    inputPath: string,
    outputPath: string,
    changes: unknown[],
    officeContext?: unknown
  ) {
    return this.withCircuitBreaker("ppt", () =>
      PPTSkillInvoker.invokePPTExpert(
        inputPath,
        outputPath,
        changes,
        officeContext as import("../expert-ppt/ppt.tools.js").PPTOfficeContext
      )
    );
  }

  /**
   * Invoke the WordExpert skill.
   */
  static async invokeWord(
    inputPath: string,
    outputPath: string,
    changes: unknown[],
    officeContext?: unknown
  ) {
    return this.withCircuitBreaker("word", () =>
      WordSkillInvoker.invokeWordExpert(
        inputPath,
        outputPath,
        changes,
        officeContext as import("../expert-word/word.tools.js").WordOfficeContext
      )
    );
  }

  /**
   * Invoke shared utility skills (Vector Search, etc.)
   */
  static async invokeVectorSearch(apiKey: string, query: string, docs: string[]) {
    return this.withCircuitBreaker("shared", () =>
      SharedSkillInvoker.invokeVectorSearch(apiKey, query, docs)
    );
  }

  static async invokeGalaxyGraph(query: string, repo?: string) {
    return this.withCircuitBreaker("shared", () =>
      SharedSkillInvoker.invokeGalaxyGraph(query, repo)
    );
  }
}
