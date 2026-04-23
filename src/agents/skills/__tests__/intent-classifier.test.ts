import { classifyIntent } from '../atoms/intent-classifier';

describe('IntentClassifier', () => {
  it('should hit keyword rules and skip LLM', async () => {
    const result = await classifyIntent('Can you sync this for me?');
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.label).toBe('cross_app');
    expect(result.source).toBe('keyword');
  });

  it('should hit Chinese keywords', async () => {
    const result1 = await classifyIntent('幫我總結一下');
    expect(result1.label).toBe('recap');
    expect(result1.source).toBe('keyword');
    
    const result2 = await classifyIntent('分析這份報告');
    expect(result2.label).toBe('insight');
    expect(result2.source).toBe('keyword');
  });

  it('should fallback to general on no match without token', async () => {
    const result = await classifyIntent('Unknown weird sentence', { token: undefined });
    expect(result.label).toBe('general');
    expect(result.source).toBe('no-match');
  });
});
