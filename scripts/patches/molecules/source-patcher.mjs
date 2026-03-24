/**
 * Molecule: SDK Source File Patcher
 * Composes all atom-level patches and applies them to SDK source files.
 * Atoms with `clientOnly = true` are only applied to client.js files.
 */
import fs from 'node:fs';

// Import all atoms
import * as jsonrpcPath from '../atoms/fix-jsonrpc-path.mjs';
import * as importMetaResolve from '../atoms/fix-import-meta-resolve.mjs';
import * as mutualExclusiveCheck from '../atoms/fix-mutual-exclusive-check.mjs';
import * as existsSyncCheck from '../atoms/fix-exists-sync-check.mjs';
import * as spawnWindows from '../atoms/fix-spawn-windows.mjs';
import * as geminiUnsupportedFlags from '../atoms/fix-gemini-unsupported-flags.mjs';

/** All available patch atoms, applied in order */
const ALL_ATOMS = [
  jsonrpcPath,
  importMetaResolve,
  mutualExclusiveCheck,
  existsSyncCheck,
  spawnWindows,
  geminiUnsupportedFlags,
];

/**
 * @param {string} sdkFilePath - Absolute path to an SDK source file
 * @returns {boolean} Whether the file was patched
 */
export function patchSourceFile(sdkFilePath) {
  if (!fs.existsSync(sdkFilePath)) return false;

  const source = fs.readFileSync(sdkFilePath, 'utf8');
  const isClientFile = sdkFilePath.endsWith('client.js');
  let rewritten = source;

  const appliedAtoms = [];

  for (const atom of ALL_ATOMS) {
    // Skip client-only atoms for non-client files
    if (atom.clientOnly && !isClientFile) continue;

    const before = rewritten;
    rewritten = atom.apply(rewritten);

    if (rewritten !== before) {
      appliedAtoms.push(atom.name);
    }
  }

  if (rewritten === source) return false;

  fs.writeFileSync(sdkFilePath, rewritten, 'utf8');
  console.log(`  [source-patcher] Patched: ${sdkFilePath}`);
  console.log(`    Applied atoms: ${appliedAtoms.join(', ')}`);
  return true;
}
