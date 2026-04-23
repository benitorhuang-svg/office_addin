/**
 * Atom: Fetcher
 * Native fetch implementation for Node 18+ environment.
 */
export async function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (typeof globalThis.fetch !== 'function') {
    throw new Error('No fetch implementation available. Ensure you are using Node 18+');
  }
  return globalThis.fetch(input, init);
}
