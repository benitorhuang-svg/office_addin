const { spawn } = require('child_process');

// Filter out unsupported CLI arguments that Github Copilot SDK passes
const args = process.argv.slice(2).filter(a => ![
    '--headless',
    '--auto-update',
    '--autoUpdate',
    '--log-level',
    '--logLevel',
    '--stdio',
    '--no-auto-update'
].includes(a));

// args[0] is the gemini core index path. args.slice(1) are the flags.
const child = spawn(process.execPath, args, { stdio: 'inherit' });

child.on('exit', code => {
    process.exit(code || 0);
});

child.on('error', err => {
    console.error('Gemini Wrapper Error:', err);
    process.exit(1);
});
