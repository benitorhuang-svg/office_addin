import fetch from 'node-fetch';
import https from 'https';

const BASE_URL = 'https://localhost:4000/api';
const agent = new https.Agent({ rejectUnauthorized: false });

async function verify(model) {
    console.log(`--- Final Verification: ${model} ---`);
    try {
        const res = await fetch(`${BASE_URL}/copilot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: 'Hello! Please identify yourself.',
                model: model,
                stream: false,
                authProvider: 'gemini'
            }),
            agent
        });

        const data = await res.json();
        if (res.ok) {
            console.log('Success!');
            console.log('Model:', data.model);
            console.log('Response:', data.text);
        } else {
            console.error('Error:', data.detail || data.error);
        }
    } catch (e) {
        console.error('Connection Error:', e.message);
    }
}

// Testing the "Latest" from updated config
verify('gemini-2.0-flash');
