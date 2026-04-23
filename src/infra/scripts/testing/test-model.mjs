import fetch from 'node-fetch';
import https from 'https';

const BASE_URL = 'https://localhost:4000/api';
const agent = new https.Agent({ rejectUnauthorized: false });

async function verifyGeminiModel(model) {
    console.log(`--- Testing Gemini with model: ${model} ---`);

    try {
        const chatRes = await fetch(`${BASE_URL}/copilot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: 'ping',
                model: model,
                stream: false,
                authProvider: 'gemini'
            }),
            agent
        });

        const chatData = await chatRes.json();
        if (chatRes.ok) {
            console.log('Success!', chatData.text);
        } else {
            console.error('Error:', chatData.error, chatData.detail);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

async function run() {
    await verifyGeminiModel('gemini-2.5-flash');
}

run();
