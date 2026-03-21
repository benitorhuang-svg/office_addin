// Example: how to call the GitHub Models chat completions endpoint with a PAT.
// This script reads runtime settings from environment variables only.

const model = process.env.COPILOT_MODEL || 'openai/gpt-5-mini';
const token = process.env.COPILOT_GITHUB_TOKEN || process.env.GITHUB_PAT || process.env.COPILOT_PAT;
const endpoint = process.env.COPILOT_ENDPOINT || process.env.COPILOT_API_URL || 'https://models.github.ai/inference/chat/completions';

if (!token) {
  console.error('Missing PAT. Set `COPILOT_GITHUB_TOKEN`, `GITHUB_PAT`, or `COPILOT_PAT` in your environment.');
  process.exit(1);
}

console.log('Using model:', model);
console.log('PAT loaded from environment.');

console.log('\n--- curl example ---');
console.log(
  `curl -X POST \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"${model}", "messages":[{"role":"user","content":"Say hello"}]}' \\
  ${endpoint}`
);

console.log('\n--- Node.js fetch example (run with --run-js to execute) ---');
console.log(`node ${__filename} --run-js`);

if (process.argv.includes('--run-js')) {
  (async () => {
    const { fetch } = require('../fetcher');
    const ENDPOINT = endpoint;
    try {
      const payload = { model, messages: [{ role: 'user', content: 'Say hello' }] };
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', res.status);
      const body = await res.text();
      console.log('Response body:', body);
    } catch (err) {
      console.error('Request failed:', err.message || err);
    }
  })();
}
