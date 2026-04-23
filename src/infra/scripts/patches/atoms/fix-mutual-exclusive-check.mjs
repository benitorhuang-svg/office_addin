/**
 * Atom: Remove mutually exclusive cliUrl/useStdio/cliPath check
 * The SDK throws if you provide both cliUrl and (useStdio || cliPath).
 * We need both for our custom CLI wrapper approach.
 */
export const name = 'mutual-exclusive-check';
export const clientOnly = true;

export function apply(source) {
  let result = source;

  // Remove the throw block
  result = result.replace(
    /if\s*\(\s*options\.cliUrl\s*&&\s*\(\s*options\.useStdio\s*===\s*true\s*\|\|\s*options\.cliPath\s*\)\s*\)\s*\{[\s\S]*?throw\s*new\s*Error\("cliUrl is mutually exclusive with useStdio and cliPath"\);[\s\S]*?\}/,
    '/* Mutually exclusive check removed by patch */'
  );

  // Normalize the cliPath fallback
  result = result.replace(
    /cliPath:\s*options\.cliPath\s*\|\|\s*(?:getBundledCliPath\(\)|\(\s*options\.cliUrl\s*\?\s*"copilot"\s*:\s*getBundledCliPath\(\)\s*\)),/g,
    'cliPath: options.cliPath || (options.cliUrl ? "copilot" : getBundledCliPath()),'
  );

  return result;
}
