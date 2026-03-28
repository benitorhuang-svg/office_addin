import fetch from 'node-fetch';
import https from 'https';

const BASE_URL = 'https://localhost:4000/api';
const agent = new https.Agent({ rejectUnauthorized: false });

async function verify(model) {
    console.log(`\n--- TEST START: ${model} ---`);
    try {
        const response = await fetch(`${BASE_URL}/copilot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: 'Say "Working"',
                model: model,
                stream: true,
                authProvider: 'gemini'
            }),
            agent
        });

        if (!response.ok) {
            console.error(`Error ${response.status}`);
            return;
        }

        return new Promise((resolve) => {
            const reader = response.body;
            let gotData = false;
            reader.on('data', (d) => {
                gotData = true;
                process.stdout.write('.');
            });
            reader.on('end', () => {
                console.log(gotData ? '\nDONE: Found data' : '\nDONE: NO DATA');
                resolve();
            });
            setTimeout(() => {
                if (!gotData) console.log('\nTIMEOUT (15s): NO DATA');
                resolve();
            }, 15000);
        });
    } catch (e) {
        console.error(e.message);
    }
}

async function run() {
    await verify('gemini-1.5-flash');
    await verify('gemini-2.5-flash');
    await verify('gemini-2.0-flash');
}
run();
