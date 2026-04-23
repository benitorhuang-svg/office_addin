import { extractBrandTokens } from '../atoms/brand-extractor';

// Mock fetch
const originalFetch = global.fetch;

describe('BrandExtractor', () => {
  beforeEach(() => {
    // Reset cache by changing a mock URL slightly if needed or let it ride
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should fallback to injected color when fetch fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error'))) as any;
    
    // First time should fail but cache the error
    const result1 = await extractBrandTokens('https://fallback.com');
    expect(result1.ok).toBe(false);

    // Provide a successful mock for a different URL, but return no colors
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve('<html><body><p>No styles here</p></body></html>')
    })) as any;

    const result2 = await extractBrandTokens('https://nocolors.com', '#ff0000');
    expect(result2.ok).toBe(true);
    expect(result2.tokens?.primary).toBe('#ff0000');
  });

  it('should hit cache', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve('<style>body { color: #abcdef; }</style>')
    })) as any;

    const result1 = await extractBrandTokens('https://cache-test.com');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result1.ok).toBe(true);
    expect(result1.tokens?.primary).toBe('#abcdef');

    // Call again, should not trigger fetch
    const result2 = await extractBrandTokens('https://cache-test.com');
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1
    expect(result2.ok).toBe(true);
    expect(result2.tokens?.primary).toBe('#abcdef');
  });

  it('should filter out neutral colors', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve('<style>body { color: #ffffff; background: #000000; border-color: #fca5a5; }</style>')
    })) as any;

    const result = await extractBrandTokens('https://filter-test.com');
    expect(result.ok).toBe(true);
    expect(result.tokens?.primary).toBe('#fca5a5'); // The non-neutral color should be picked as primary
  });
});
