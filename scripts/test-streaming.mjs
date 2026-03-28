import fetch from 'node-fetch';
import https from 'https';

const BASE_URL = 'https://localhost:4000/api';
const agent = new https.Agent({ rejectUnauthorized: false });

async function verifyGeminiStreaming(model) {
    console.log(`--- Testing Gemini STREAMING with model: ${model} ---`);

    try {
        const response = await fetch(`${BASE_URL}/copilot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: 'Say "STREAMING ON"',
                model: model,
                stream: true,
                authProvider: 'gemini'
            }),
            agent
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error('Error:', response.status, err);
            return;
        }

        console.log('Stream opened. Waiting for chunks...');
        
        const reader = response.body;
        let fullText = "";
        
        return new Promise((resolve) => {
            reader.on('data', (chunk) => {
                const text = chunk.toString();
                const lines = text.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.text === "[DONE]") {
                                console.log('\n--- Stream [DONE] ---');
                            } else if (data.text && data.text !== "Initializing...") {
                                fullText += data.text;
                                process.stdout.write(data.text);
                            }
                        } catch (e) {}
                    }
                }
            });

            reader.on('end', () => {
                console.log('\n--- Stream Ended ---');
                console.log('Full Text:', fullText);
                resolve();
            });

            setTimeout(() => {
                if (!fullText) console.log('\nTIMEOUT (30s): NO CONTENT');
                resolve();
            }, 30000);
        });

    } catch (e) {
        console.error('Fetch Error:', e.message);
    }
}

// User specified gemini-1.5-flash
verifyGeminiStreaming('gemini-1.5-flash');
