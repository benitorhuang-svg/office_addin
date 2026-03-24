/**
 * Orchestrator script to patch the GitHub Copilot SDK for Windows and Gemini compatibility.
 * Re-applies all patches in scripts/patches to ensure the environment is ready.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { patchSourceFile } from './patches/molecules/source-patcher.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../');

console.log('[SDK Patcher] Initializing SDK patching sequence...');

const sdkDistPath = path.join(projectRoot, 'node_modules/@github/copilot-sdk/dist');
const targetFiles = [
  path.join(sdkDistPath, 'client.js'),
  path.join(sdkDistPath, 'session.js'),
];

let totalPatched = 0;
for (const file of targetFiles) {
  try {
    if (patchSourceFile(file)) {
      totalPatched++;
    }
  } catch (error) {
    console.error(`  [SDK Patcher] Error patching ${path.basename(file)}:`, error.message);
  }
}

if (totalPatched > 0) {
  console.log(`[SDK Patcher] Successfully optimized ${totalPatched} SDK files for Windows & Gemini.`);
} else {
  console.log('[SDK Patcher] SDK is already fully optimized or target files not found.');
}
