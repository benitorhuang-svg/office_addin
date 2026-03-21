// Small fetch compatibility wrapper for TypeScript.
// Prefers globalThis.fetch (Node 18+), falls back to node-fetch.

let fetchImpl: typeof fetch;

if (typeof globalThis.fetch === 'function') {
  fetchImpl = globalThis.fetch;
} else {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeFetch = require('node-fetch');
    fetchImpl = nodeFetch;
  } catch (e) {
    throw new Error('No fetch implementation available. Use Node 18+ or install node-fetch.');
  }
}

export { fetchImpl as fetch };
