/**
 * Atom: Fetcher
 * Polyfill-ready fetch wrapper for Node 18+ environment.
 */
type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export async function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch(input, init);
  }

  try {
    const nodeFetch = await import('node-fetch');
    const fn = (nodeFetch as unknown as { default: FetchFunction }).default;
    return fn(input, init);
  } catch {
    throw new Error('No fetch implementation available. Use Node 18+ or install node-fetch.');
  }
}
