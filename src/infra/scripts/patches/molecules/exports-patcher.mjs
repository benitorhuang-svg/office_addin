/**
 * Molecule: Package.json Exports Patcher
 * Ensures CJS-compatible exports fields exist in package.json files
 * for vscode-jsonrpc and the SDK itself.
 */
import fs from 'node:fs';

const EXPORT_DEFAULTS = {
  '.':            './lib/node/main.js',
  './node':       './node.js',
  './node.js':    './node.js',
  './browser':    './browser.js',
  './browser.js': './browser.js',
};

/**
 * @param {string} packageJsonPath - Absolute path to a package.json
 * @returns {boolean} Whether the file was patched
 */
export function patchExports(packageJsonPath) {
  if (!fs.existsSync(packageJsonPath)) return false;

  const raw = fs.readFileSync(packageJsonPath, 'utf8');
  const pkg = JSON.parse(raw);
  const exportsField = pkg.exports || {};
  let changed = false;

  for (const [key, fallback] of Object.entries(EXPORT_DEFAULTS)) {
    if (!exportsField[key]) {
      exportsField[key] = fallback;
      changed = true;
    } else if (key === '.' && typeof exportsField['.'] === 'object' && !exportsField['.'].require) {
      // Specifically for @github/copilot-sdk main entry under CJS
      exportsField['.'].require = exportsField['.'].import;
      changed = true;
    }
  }

  if (!changed) return false;

  pkg.exports = exportsField;
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  console.log(`  [exports-patcher] Patched: ${packageJsonPath}`);
  return true;
}
