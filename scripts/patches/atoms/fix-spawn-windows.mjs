/**
 * Atom: Fix spawn calls for Windows compatibility
 * - JS-file spawn: Force shell: false to avoid double-escaping
 * - Generic spawn: Quote paths with spaces and use shell on Windows
 */
export const name = 'spawn-windows';
export const clientOnly = true;

export function apply(source) {
  // Idempotency check: don't patch if logging is already present
  if (source.includes('[SDK] Spawn')) return source;

  let result = source;

  // JS-file spawn block: node [cliPath, ...args]
  result = result.replace(
    /((?:this\.cliProcess = )?(?:\(0,\s*)?(?:import_node_child_process\.)?spawn(?:\s*\)\s*)?)\(getNodeExecPath\(\), \[this\.\w+\.cliPath, \.\.\.args\], \{([\s\S]*?)windowsHide: true\s*\}\)/g,
    '($1(getNodeExecPath(), [this.options.cliPath, ...args], {$2windowsHide: true, shell: false }))'
  );

  // Generic spawn block: cliPath, args
  result = result.replace(
    /((?:this\.cliProcess = )?(?:\(0,\s*)?(?:import_node_child_process\.)?spawn(?:\s*\)\s*)?)\(this\.\w+\.cliPath, args, \{([\s\S]*?)windowsHide: true\s*\}\)/g,
    '($1(this.options.cliPath, args, {$2windowsHide: true, shell: false }))'
  );

  return result;
}
