// Small fetch compatibility wrapper for TypeScript.
// Prefers globalThis.fetch (Node 18+), falls back to node-fetch.

export async function fetch(input: RequestInfo | URL, init?: RequestInit) {
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch(input as any, init as any);
  }

  try {
    const nodeFetch = await import('node-fetch');
    return (nodeFetch.default as any)(input as any, init as any);
  } catch {
    throw new Error('No fetch implementation available. Use Node 18+ or install node-fetch.');
  }
}
