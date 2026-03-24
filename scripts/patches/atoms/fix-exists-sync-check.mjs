/**
 * Atom: Remove existsSync check for cliPath
 * The SDK validates that cliPath exists on disk, but we may use
 * global commands (e.g. 'npx') or .bin shims that don't resolve
 * as regular files.
 */
export const name = 'exists-sync-check';
export const clientOnly = true;

export function apply(source) {
  return source.replace(
    /if\s*\(!(?:\(0,\s*)?(?:import_node_fs\.)?existsSync(?:\s*\)\s*)?\(this\.options\.cliPath\)\)\s*\{[\s\S]*?throw\s*new\s*Error\([\s\S]*?Copilot CLI not found[\s\S]*?\);[\s\S]*?\}/,
    '/* existsSync check removed by patch */'
  );
}
