/**
 * Router Agent
 * 
 * P1 Optimized: Removed redundant regex keyword detection. 
 * Now trusts classifyIntent() as the single source of truth.
 */
import { classifyIntent, type IntentLabel } from "@agents/skills/atoms/intent-classifier.js";
import { logger } from "@shared/logger/index.js";

const TAG = "RouterAgent";

export interface RouterResult {
  intent: IntentLabel | 'general';
  domains: string[];
  reasoning: string;
  confidence: number;
}

export const RouterAgent = {
  async analyzeIntent(query: string, context?: { traceId?: string; token?: string }): Promise<RouterResult> {
    const log = context?.traceId ? logger.withTrace(context.traceId) : logger;
    log.info(TAG, `Analyzing user intent: "${query.substring(0, 50)}..."`);

    // Trust the specialized classifier
    const intentResult = await classifyIntent(query, { token: context?.token });
    const intent = intentResult.label;
    const confidence = intentResult.confidence;

    // Map intent label to internal expert domains
    const domains: string[] = [];
    
    // Direct domain mapping
    if (intent === "excel") domains.push("expert-excel");
    if (intent === "word") domains.push("expert-word");
    if (intent === "ppt") domains.push("expert-ppt");
    
    // P0: Parallel Execution Support for cross_app
    if (intent === "cross_app") {
      if (/excel|spreadsheet/i.test(query)) domains.push("expert-excel");
      if (/word|document/i.test(query)) domains.push("expert-word");
      if (/ppt|slide|presentation/i.test(query)) domains.push("expert-ppt");
      
      // Default to all if non-specific
      if (domains.length === 0) {
        domains.push("expert-excel", "expert-word", "expert-ppt");
      }
    }

    if (domains.length === 0) {
      domains.push("vector_search"); // Default fallback
    }

    const reasoning = `Intent classified as [${intent}] with confidence ${confidence} from ${intentResult.source}. Routed to domains: [${domains.join(", ")}].`;
    log.info(TAG, reasoning);

    return {
      intent,
      domains,
      reasoning,
      confidence,
    };
  }
};
