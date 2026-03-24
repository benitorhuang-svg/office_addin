import fs from 'node:fs';
const paths = [
    'node_modules/@github/copilot-sdk/dist/client.js',
    'node_modules/@github/copilot-sdk/dist/cjs/client.js'
];
for (const p of paths) {
    if (fs.existsSync(p)) {
        let s = fs.readFileSync(p, 'utf8');
        // Final polish: ensure correctly balanced parentheses for our injections
        // Looking for the pattern we currently have: shell: false })));
        s = s.replace(/shell: false \}\)\)+/g, 'shell: false }))');
        fs.writeFileSync(p, s, 'utf8');
        console.log('Polished: ' + p);
    }
}
