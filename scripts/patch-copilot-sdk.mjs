import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

const candidateFiles = [
  path.join(repoRoot, 'node_modules', '@github', 'copilot-sdk', 'node_modules', 'vscode-jsonrpc', 'package.json'),
  path.join(repoRoot, 'node_modules', 'vscode-jsonrpc', 'package.json'),
];

const sdkFilesToRewrite = [
  path.join(repoRoot, 'node_modules', '@github', 'copilot-sdk', 'dist', 'session.js'),
  path.join(repoRoot, 'node_modules', '@github', 'copilot-sdk', 'dist', 'session.d.ts'),
];

for (const packageJsonPath of candidateFiles) {
  if (!fs.existsSync(packageJsonPath)) {
    continue;
  }

  const raw = fs.readFileSync(packageJsonPath, 'utf8');
  const pkg = JSON.parse(raw);
  const exportsField = pkg.exports || {};
  let changed = false;

  if (!exportsField['.']) {
    exportsField['.'] = './lib/node/main.js';
    changed = true;
  }
  if (!exportsField['./node']) {
    exportsField['./node'] = './node.js';
    changed = true;
  }
  if (!exportsField['./node.js']) {
    exportsField['./node.js'] = './node.js';
    changed = true;
  }
  if (!exportsField['./browser']) {
    exportsField['./browser'] = './browser.js';
    changed = true;
  }
  if (!exportsField['./browser.js']) {
    exportsField['./browser.js'] = './browser.js';
    changed = true;
  }

  if (!changed) {
    continue;
  }

  pkg.exports = exportsField;
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  console.log(`Patched exports in ${packageJsonPath}`);
}

for (const sdkFilePath of sdkFilesToRewrite) {
  if (!fs.existsSync(sdkFilePath)) {
    continue;
  }

  const source = fs.readFileSync(sdkFilePath, 'utf8');
  const rewritten = source.replace(/vscode-jsonrpc\/node"/g, 'vscode-jsonrpc/node.js"');
  if (rewritten === source) {
    continue;
  }

  fs.writeFileSync(sdkFilePath, rewritten, 'utf8');
  console.log(`Patched import path in ${sdkFilePath}`);
}