/**
 * Router Agent: Intent recognition, task breakdown, and assignment.
 * Uses Layer 1 Metadata (Schema) to determine which expert should handle the query.
 * Updated: Supports Parallel Task Breakdown for cross-app queries.
 */

import { classifyIntent, IntentLabel } from "@agents/skills/atoms/intent-classifier.js";
import { extractBrandTokens } from "@agents/skills/atoms/brand-extractor.js";
import { logger } from "@shared/logger/index.js";

const TAG = "RouterAgent";

export interface RoutingContext {
  token?: string;
  query: string;
  traceId?: string;
}

export interface RoutingResult {
  status: string;
  intent: IntentLabel;
  traceId: string;
  domains: string[]; // Updated: array of domains for parallel execution
  payload?: unknown;
}

export class RouterAgent {
  /**
   * Analyzes the query and determines if it needs one or more experts.
   */
  public static async analyzeIntent(
    query: string,
    context: RoutingContext
  ): Promise<RoutingResult> {
    const traceId = context.traceId ?? "unknown";
    const log = logger.withTrace(traceId);

    // 1. Feature flag: Check for brand token shortcuts
    const brandMatch = query.match(/^brand:\s*(https:\/\/\S+)/i);
    if (brandMatch) {
      log.info(TAG, "Brand URL detected, routing to BrandExtractor.");
      const result = await extractBrandTokens(brandMatch[1]);
      return {
        status: "brand_tokens_extracted",
        intent: "vision",
        traceId,
        domains: ["shared"],
        payload: result,
      };
    }

    // 2. Cross-app heuristic (Pillar 2.1 Parallel Optimization)
    const needsExcel = /excel|spreadsheet|sheet|formula|pivot|cell range|table data/i.test(query);
    const needsPPT = /ppt|powerpoint|slide|presentation|deck/i.test(query);
    const needsWord = /word|document|memo|write|paragraph|report/i.test(query);

    const domains: string[] = [];
    if (needsExcel) domains.push("expert-excel");
    if (needsPPT) domains.push("expert-ppt");
    if (needsWord) domains.push("expert-word");

    // 3. Dynamic Intent Classification for more specific routing
    const intent = await classifyIntent(query, { token: context.token });
    log.info(TAG, `Query classified as [${intent}]`);

    // If no specific domains found via keywords, use the classifier's primary mapping
    if (domains.length === 0) {
      switch (intent) {
        case "excel":
          domains.push("expert-excel");
          break;
        case "word":
          domains.push("expert-word");
          break;
        case "ppt":
          domains.push("expert-ppt");
          break;
        default:
          domains.push("shared");
          break;
      }
    }

    // Add shared domain if it's a cross-app sync task
    if (intent === "cross_app" && !domains.includes("shared")) {
      domains.push("shared");
    }

    log.info(TAG, `Assigned domains [${domains.join(", ")}] for intent [${intent}]`);

    return {
      status: "routed",
      intent,
      domains,
      traceId,
    };
  }
}
