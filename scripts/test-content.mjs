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
                prompt: 'Reply only with "YES"',
                model: model,
                stream: true,
                authProvider: 'gemini'
            }),
            agent
        });

        return new Promise((resolve) => {
            const reader = response.body;
            let content = "";
            reader.on('data', (d) => {
                const text = d.toString();
                const lines = text.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.text && data.text !== "Initializing..." && data.text !== "[DONE]") {
                                content += data.text;
                                process.stdout.write(data.text);
                            }
                        } catch (e) {}
                    }
                }
            });
            reader.on('end', () => {
                console.log(content ? '\nYES: Got content content' : '\nNO: No actual content received');
                resolve();
            });
            setTimeout(() => {
                if (!content) console.log('\nTIMEOUT (30s): No content received');
                resolve();
            }, 30000);
        });
    } catch (e) {
        console.error(e.message);
    }
}

async function run() {
    await verify('gemini-2.5-flash');
}
run();
