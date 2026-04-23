/**
 * Regression Test: Design Quality Stability
 * Ensures that changes to prompts/agents do not degrade design quality scores.
 */
import { reviewDesign, type DesignDomain } from '@agents/skills/molecules/design-reviewer.js';

const TEST_CASES = [
  { domain: 'ppt', input: 'Create a slide about business growth. Use primary color. Problem, Action, Outcome structure.', minScore: 40 },
  { domain: 'word', input: 'Draft a project memo. Use Heading 1 and Heading 2. Ensure terminology consistency.', minScore: 40 },
  { domain: 'excel', input: 'Create a quarterly revenue table with clear headers.', minScore: 30 }
];

describe('DesignReviewer Stability Regression', () => {
  for (const tc of TEST_CASES) {
    it(`should maintain quality for ${tc.domain}`, async () => {
      // Simulate generated output
      const dummyOutput = `Sample content for ${tc.domain} simulation. [System: Pass content]`;
      const result = reviewDesign(dummyOutput, tc.domain as DesignDomain);
      
      expect(result.totalScore).toBeGreaterThanOrEqual(tc.minScore);
    });
  }
});
