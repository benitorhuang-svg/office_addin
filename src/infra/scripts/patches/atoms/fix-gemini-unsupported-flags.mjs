/**
 * Atom: Filter out Copilot-specific CLI flags for Gemini CLI
 * The SDK's startCLIServer() hardcodes --headless, --no-auto-update,
 * --log-level, --stdio which are Copilot CLI flags that gemini-cli
 * rejects with "Unknown arguments". When --acp is present (indicating
 * gemini-cli), this patch filters them out before the spawn call.
 */
export const name = 'gemini-unsupported-flags';
export const clientOnly = true;

const FILTER_BLOCK = `
      // [PATCH] Filter out Copilot-specific flags for gemini-cli (ACP mode)
      if (args.includes('--acp')) {
        const unsupported = ['--headless', '--auto-update', '--autoUpdate', '--no-auto-update', '--log-level', '--logLevel', '--stdio'];
        const filtered = [];
        for (let i = 0; i < args.length; i++) {
          if (unsupported.includes(args[i])) {
            if ((args[i] === '--log-level' || args[i] === '--logLevel') && i + 1 < args.length) {
              i++;
            }
            continue;
          }
          filtered.push(args[i]);
        }
        args.length = 0;
        args.push(...filtered);
      }`;

export function apply(source) {
  // Idempotency check: don't patch if already patched
  if (source.includes('[PATCH] Filter out Copilot-specific flags')) return source;

  // Insert after the --no-auto-login push
  return source.replace(
    /(if\s*\(!this\.options\.useLoggedInUser\)\s*\{?\s*args\.push\("--no-auto-login"\);?\s*\}?)/i,
    `$1\n${FILTER_BLOCK}`
  );

}
