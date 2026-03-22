import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

const candidateFiles = [
  path.join(repoRoot, 'node_modules', '@github', 'copilot-sdk', 'package.json'),
  path.join(repoRoot, 'node_modules', '@github', 'copilot-sdk', 'node_modules', 'vscode-jsonrpc', 'package.json'),
  path.join(repoRoot, 'node_modules', 'vscode-jsonrpc', 'package.json'),
];

const sdkFilesToRewrite = [
  path.join(repoRoot, 'node_modules', '@github', 'copilot-sdk', 'dist', 'session.js'),
  path.join(repoRoot, 'node_modules', '@github', 'copilot-sdk', 'dist', 'session.d.ts'),
  path.join(repoRoot, 'node_modules', '@github', 'copilot-sdk', 'dist', 'client.js'),
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
  } else if (typeof exportsField['.'] === 'object' && !exportsField['.'].require) {
    // Specifically for @github/copilot-sdk main entry under CJS
    exportsField['.'].require = exportsField['.'].import;
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
  let rewritten = source;

  // Fix 1: vscode-jsonrpc path
  rewritten = rewritten.replace(/vscode-jsonrpc\/node"/g, 'vscode-jsonrpc/node.js"');

    // Fix 2: import.meta.resolve (for client.js specifically)
    if (sdkFilePath.endsWith('client.js')) {
      // Replace import.meta.resolve with a much safer version that checks typeof
      // and is more robust against transpilation/mangling
      rewritten = rewritten.replace(
        /const sdkUrl = \(?import\.meta && import\.meta\.resolve \? import\.meta\.resolve\("@github\/copilot\/sdk"\) : "@github\/copilot\/sdk"\)?;/g,
        'const sdkUrl = (typeof import.meta !== "undefined" && typeof import.meta.resolve === "function" ? import.meta.resolve("@github/copilot/sdk") : "@github/copilot/sdk");'
      );
      
      // Also catch the one that doesn't have the ternary
      rewritten = rewritten.replace(
        /import\.meta\.resolve\("@github\/copilot\/sdk"\);/g,
        '(typeof import.meta !== "undefined" && typeof import.meta.resolve === "function" ? import.meta.resolve("@github/copilot/sdk") : "@github/copilot/sdk");'
      );
      
      // Also fix the constructor to NOT call getBundledCliPath if cliUrl or cliPath is present
      // and explicitly remove the mutually exclusive check that blocks providing both
      // We use a broader regex to match the if block even with different indentation or spacing
      rewritten = rewritten.replace(
        /if\s*\(\s*options\.cliUrl\s*&&\s*\(\s*options\.useStdio\s*===\s*true\s*\|\|\s*options\.cliPath\s*\)\s*\)\s*\{[\s\S]*?throw\s*new\s*Error\("cliUrl is mutually exclusive with useStdio and cliPath"\);[\s\S]*?\}/,
        '/* Mutually exclusive check removed by patch */'
      );

      rewritten = rewritten.replace(
        /cliPath:\s*options\.cliPath\s*\|\|\s*(?:getBundledCliPath\(\)|\(\s*options\.cliUrl\s*\?\s*"copilot"\s*:\s*getBundledCliPath\(\)\s*\)),/g,
        'cliPath: options.cliPath || (options.cliUrl ? "copilot" : getBundledCliPath()),'
      );

      // Fix 3: Remove existsSync check for cliPath so we can use global commands like "npx"
      rewritten = rewritten.replace(
        /if\s*\(!existsSync\(this\.options\.cliPath\)\)\s*\{[\s\S]*?throw\s*new\s*Error\([\s\S]*?Copilot CLI not found[\s\S]*?\);[\s\S]*?\}/,
        '/* existsSync check removed by patch */'
      );

      // Fix 4: Handle Windows path spaces and shell requirements.
      // For the JS block: We use shell: false because getNodeExecPath() (node.exe) is an absolute path with spaces.
      // For the else block: We use shell: true and quote the executable.
      rewritten = rewritten.replace(
        /this\.cliProcess = spawn\(getNodeExecPath\(\), \[this\.options\.cliPath, \.\.\.args\], \{([\s\S]*?)windowsHide: true(?:, shell: process\.platform === "win32")?/g,
        'this.cliProcess = spawn(getNodeExecPath(), [this.options.cliPath, ...args], {$1windowsHide: true, shell: false'
      );

      rewritten = rewritten.replace(
        /this\.cliProcess = spawn\(this\.options\.cliPath, args, \{([\s\S]*?)windowsHide: true(?:, shell: process\.platform === "win32")?/g,
        'this.cliProcess = spawn((process.platform === "win32" && this.options.cliPath.includes(" ")) ? `"${this.options.cliPath}"` : this.options.cliPath, args, {$1windowsHide: true, shell: process.platform === "win32"'
      );
    }

  if (rewritten === source) {
    continue;
  }

  fs.writeFileSync(sdkFilePath, rewritten, 'utf8');
  console.log(`Patched SDK file: ${sdkFilePath}`);
}