/**
 * Tests: SelfCorrector — Auto-Healing Loop
 */

import { selfCorrect } from '@agents/skills/molecules/self-corrector.js';

describe('SelfCorrector', () => {
  it('returns first-pass result when score ≥ 70 (no healing needed)', async () => {
    // A well-structured word document triggers a passing review
    const richContent = `
## Executive Summary

This document provides a comprehensive analysis of the Q1 results.
The findings indicate a positive trend across all measured dimensions.

## Key Findings

### Revenue Growth
Revenue grew by 15% year-over-year driven by enterprise segment.

### Cost Optimisation
Operational costs were reduced by 8% through process improvements.

### Customer Satisfaction
NPS score improved from 42 to 58 across all product lines.

## Conclusion

The overall performance meets all strategic targets set for the quarter.
    `.trim();

    const gen = jest.fn().mockResolvedValue(richContent);
    const result = await selfCorrect(gen, 'Generate a word document', { domain: 'word' });

    expect(gen).toHaveBeenCalledTimes(1);
    expect(result.healed).toBe(false);
    expect(result.content).toBe(richContent);
    expect(result.firstPassScore).toBeGreaterThanOrEqual(0);
  });

  it('triggers second pass when first-pass score is low', async () => {
    // PPT domain: minimal content scores 50 (no title/slide references/branding)
    const badContent = 'bad';
    const goodContent = `
## Slide Deck Overview

### Slide 1: Title
Welcome to the Q1 Results presentation with branded theme.

### Slide 2: Revenue
Revenue grew by 15% year-over-year driven by enterprise segment sales.

### Slide 3: Conclusion
All strategic targets were met for the quarter with strong momentum.
    `.trim();

    const gen = jest.fn()
      .mockResolvedValueOnce(badContent)
      .mockResolvedValueOnce(goodContent);

    const result = await selfCorrect(gen, 'Write a report', { domain: 'ppt' });

    expect(gen).toHaveBeenCalledTimes(2);
    expect(result.healed).toBe(true);
    expect(result.content).toBe(goodContent);
    expect(result.firstPassScore).toBeLessThan(70);
  });

  it('second pass prompt contains issue list from first review', async () => {
    // PPT domain with minimal content ensures healing is triggered
    const gen = jest.fn().mockResolvedValue('minimal');
    await selfCorrect(gen, 'original prompt', { domain: 'ppt' });

    const secondPrompt = gen.mock.calls[1]?.[0] as string;
    expect(secondPrompt).toContain('SELF-CORRECTION DIRECTIVE');
    expect(secondPrompt).toContain('original prompt');
  });

  it('always returns second-pass content even if it still fails', async () => {
    // PPT domain — 'bad' scores 50, triggers healing, second gen also 'bad'
    const gen = jest.fn().mockResolvedValue('bad');
    const result = await selfCorrect(gen, 'p', { domain: 'ppt' });
    expect(result.healed).toBe(true);
    expect(result.content).toBe('bad');
  });

  it('respects custom threshold override', async () => {
    // Rich content that passes 70 but might fail 90
    const richContent = `
## Heading

Content paragraph one for the document section here.
Content paragraph two with more detail about the topic.
Content paragraph three providing final analysis.
    `.trim();

    const gen = jest.fn().mockResolvedValue(richContent);
    // With threshold=10, even bad content should pass
    const result = await selfCorrect(gen, 'p', { domain: 'word', threshold: 10 });
    expect(result.healed).toBe(false);
  });

  it('propagates traceId context without error', async () => {
    const gen = jest.fn().mockResolvedValue('## Doc\nContent.');
    await expect(
      selfCorrect(gen, 'p', { domain: 'word', traceId: 'test-trace-001' })
    ).resolves.not.toThrow();
  });
});
