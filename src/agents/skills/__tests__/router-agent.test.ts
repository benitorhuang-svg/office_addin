import { RouterAgent } from '../../router-agent/index';
import * as intentClassifier from '../../skills/atoms/intent-classifier';

jest.mock('../../skills/atoms/intent-classifier', () => ({
  classifyIntent: jest.fn(),
}));

describe('RouterAgent', () => {
  it('should route basic intent to correct domain', async () => {
    (intentClassifier.classifyIntent as jest.Mock).mockResolvedValue({ label: 'excel', confidence: 0.9, source: 'keyword' });
    const result = await RouterAgent.analyzeIntent('some query');
    expect(result.intent).toBe('excel');
    expect(result.domains).toEqual(['expert-excel']);
  });

  it('should route cross_app intent to specific domains based on query regex', async () => {
    (intentClassifier.classifyIntent as jest.Mock).mockResolvedValue({ label: 'cross_app', confidence: 0.9, source: 'keyword' });
    
    const result1 = await RouterAgent.analyzeIntent('export this spreadsheet to word document');
    expect(result1.domains).toContain('expert-excel');
    expect(result1.domains).toContain('expert-word');
    expect(result1.domains).not.toContain('expert-ppt');
  });

  it('should route cross_app intent to all domains if no specific apps in query', async () => {
    (intentClassifier.classifyIntent as jest.Mock).mockResolvedValue({ label: 'cross_app', confidence: 0.9, source: 'keyword' });
    
    const result = await RouterAgent.analyzeIntent('sync data between apps');
    expect(result.domains).toEqual(['expert-excel', 'expert-word', 'expert-ppt']);
  });

  it('should default to vector_search if domains is empty', async () => {
    (intentClassifier.classifyIntent as jest.Mock).mockResolvedValue({ label: 'unknown_label', confidence: 0, source: 'no-match' });
    const result = await RouterAgent.analyzeIntent('hello');
    expect(result.domains).toEqual(['vector_search']);
  });
});
