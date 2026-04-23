/**
 * Unit tests: OutputEvaluator ??Evaluator-Optimizer pattern
 */

jest.mock('@shared/logger/index.js', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { evaluateAndRefine, type RefineFn } from '@agents/skills/molecules/output-evaluator.js';

describe('OutputEvaluator', () => {
  describe('evaluateAndRefine', () => {
    it('returns output immediately when quality passes on first try', async () => {
      const goodOutput = `
        # Executive Summary: Q1 Performance Report

        ## Key Findings
        Our data demonstrates strong growth trajectory with 23% YoY improvement.
        The main driver was the new product line launched in February.
        Customer satisfaction reached an all-time high of 94%.

        ## Recommendations
        1. Continue investment in product innovation
        2. Expand market presence in Southeast Asia
        3. Strengthen customer success programs
      `.trim();

      const refineFn = jest.fn();
      const result = await evaluateAndRefine(goodOutput, refineFn as unknown as RefineFn, { domain: 'word' });

      expect(result.finalOutput).toBe(goodOutput);
      expect(result.iterations).toBe(0);
      expect(refineFn).not.toHaveBeenCalled();
    });

    it('calls refineFn when output is too short', async () => {
      const shortOutput = 'Short.';
      const improvedOutput = `
        # Detailed Report

        This comprehensive analysis covers all major aspects of the project.
        We examined three key dimensions: performance, quality, and customer impact.
        The results demonstrate consistent improvement across all metrics.
        ## Key Findings: Revenue up 18%, NPS improved by 12 points.
        ## Next Steps: Continue current trajectory, expand regional coverage.
      `.trim();

      const refineFn = jest.fn().mockResolvedValue(improvedOutput) as unknown as Parameters<typeof evaluateAndRefine>[1];
      const result = await evaluateAndRefine(shortOutput, refineFn, { domain: 'word' });

      expect(refineFn).toHaveBeenCalledTimes(1);
      expect(result.finalOutput).toBe(improvedOutput);
      expect(result.iterations).toBeGreaterThan(0);
    });

    it('stops after maxIterations even if quality never passes', async () => {
      const alwaysShort = 'Bad.';
      const refineFn = jest.fn().mockResolvedValue(alwaysShort) as unknown as Parameters<typeof evaluateAndRefine>[1];

      const result = await evaluateAndRefine(alwaysShort, refineFn, {
        domain: 'ppt',
        maxIterations: 2,
      });

      expect(result).toBeDefined();
      expect(typeof result.finalOutput).toBe('string');
      expect(refineFn).toHaveBeenCalledTimes(2);
    });

    it('applies excel domain rubric', async () => {
      const excelOutput = `
        FORMULA_RESULT: =SUM(A1:A10)
        VALUE: 1250
        CHART_TYPE: bar
        COLUMNS: ["Month", "Revenue", "Cost"]
        The data shows clear seasonal patterns.
      `.trim();

      const refineFn = jest.fn();
      const result = await evaluateAndRefine(excelOutput, refineFn as unknown as RefineFn, { domain: 'excel' });

      expect(result).toBeDefined();
      expect(typeof result.finalScore).toBe('number');
    });
  });
});
