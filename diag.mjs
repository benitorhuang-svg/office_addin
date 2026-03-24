import fs from 'node:fs';
const paths = [
    'node_modules/@github/copilot-sdk/dist/client.js',
    'node_modules/@github/copilot-sdk/dist/cjs/client.js'
];
for (const p of paths) {
    if (fs.existsSync(p)) {
        let s = fs.readFileSync(p, 'utf8');
        const log = 'console.log("[SDK SYSTEM CHECK] File loaded: " + (typeof __filename !== "undefined" ? __filename : "esm-module"));\n';
        if (!s.includes('SDK SYSTEM CHECK')) {
            s = log + s;
            fs.writeFileSync(p, s, 'utf8');
            console.log('Injected diag log: ' + p);
        }
    }
}
