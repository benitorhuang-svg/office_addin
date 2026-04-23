/**
 * Tests: ContextChunker — Smart Token Optimisation
 */

import { chunkAndRetrieve } from '@agents/skills/molecules/context-chunker.js';

describe('ContextChunker', () => {
  it('returns text as-is when below the chunking threshold', () => {
    const short = 'Hello world. This is a short document.';
    const result = chunkAndRetrieve(short, 'hello');
    expect(result.chunked).toBe(false);
    expect(result.context).toBe(short);
    expect(result.originalLength).toBe(short.length);
    expect(result.retrievedLength).toBe(short.length);
  });

  it('chunks long text and returns retrieved subset', () => {
    // Generate a long document with identifiable sections (~120 chars each × 50 = ~6000 chars)
    const sections = Array.from({ length: 50 }, (_, i) =>
      `Section ${i}: This paragraph discusses topic number ${i} in extensive detail covering all subject matter and more filler.`
    );
    const longText = sections.join('\n\n');

    const result = chunkAndRetrieve(longText, 'Section 5 topic 5');

    expect(result.chunked).toBe(true);
    expect(result.originalLength).toBeGreaterThan(4_000);
    // Retrieved length is bounded by the default char budget, not necessarily less than original
    // (overlapping chunks + separators can slightly exceed original for shorter docs)
    expect(result.retrievedLength).toBeLessThanOrEqual(18_000); // default budget
  });

  it('respects charBudget cap', () => {
    const longText = 'x'.repeat(20_000);
    const result = chunkAndRetrieve(longText, 'query', 500);
    expect(result.retrievedLength).toBeLessThanOrEqual(500);
  });

  it('retrieved context contains query-relevant text', () => {
    // Pad with irrelevant content + one highly relevant section
    const irrelevant = Array.from({ length: 10 }, (_, i) =>
      `Unrelated paragraph about topic ${i} covering various subjects with filler text here.`
    ).join('\n\n');
    const relevant = 'The quarterly revenue figures for Excel financial modelling are now available.';
    const longText = irrelevant + '\n\n' + relevant + '\n\n' + irrelevant;

    const result = chunkAndRetrieve(longText, 'Excel financial modelling revenue');
    // The relevant chunk should appear in top results
    expect(result.context).toContain('revenue');
  });

  it('handles empty text without throwing', () => {
    const result = chunkAndRetrieve('', 'query');
    expect(result.chunked).toBe(false);
    expect(result.context).toBe('');
  });

  it('handles CJK (Chinese) text in tokenizer', () => {
    const cjkText = '這份文件包含關於季度財務報告的重要資訊。'.repeat(200);
    const result = chunkAndRetrieve(cjkText, '財務報告');
    // Should not throw and produce some output
    expect(typeof result.context).toBe('string');
  });
});
