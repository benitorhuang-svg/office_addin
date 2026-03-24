/**
 * Atom: Fix vscode-jsonrpc import path
 * Appends '.js' extension to bare 'vscode-jsonrpc/node' imports
 * so CJS resolution works correctly.
 */
export const name = 'jsonrpc-path';

export function apply(source) {
  return source.replace(/vscode-jsonrpc\/node"/g, 'vscode-jsonrpc/node.js"');
}
