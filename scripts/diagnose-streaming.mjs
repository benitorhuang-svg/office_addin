/**
 * End-to-end streaming diagnosis for Gemini API
 * Traces the exact same path the UI takes
 */
import fetch from 'node-fetch';
import https from 'https';

const BASE = 'https://localhost:4000';
const agent = new https.Agent({ rejectUnauthorized: false });

async function diagnoseStreaming() {
    console.log('=== GEMINI STREAMING DIAGNOSIS ===\n');

    // Step 1: Check server health
    console.log('[1] Checking server health...');
    try {
        const healthRes = await fetch(`${BASE}/api/health`, { agent });
        const health = await healthRes.json();
        console.log(`    Status: ${health.status}, Uptime: ${Math.round(health.uptime)}s`);
    } catch (e) {
        console.error('    FATAL: Server not reachable!', e.message);
        return;
    }

    // Step 2: Check config (model list)
    console.log('\n[2] Checking model config...');
    try {
        const cfgRes = await fetch(`${BASE}/api/config`, { agent });
        const cfg = await cfgRes.json();
        console.log('    Gemini models:', cfg.AVAILABLE_MODELS_GEMINI || 'NOT SET');
        console.log('    GitHub models:', cfg.AVAILABLE_MODELS_GITHUB || 'NOT SET');
    } catch (e) {
        console.error('    Config fetch failed:', e.message);
    }

    // Step 3: Test SSE streaming (exact same payload as the UI sends)
    console.log('\n[3] Testing SSE streaming (what the UI sends)...');
    try {
        const res = await fetch(`${BASE}/api/copilot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: '請用一句話回答：你好嗎？',
                model: 'gemini-2.5-flash',
                stream: true,
                authProvider: 'gemini_api',
                presetId: 'general',
                officeContext: { selectedText: '' }
            }),
            agent
        });

        console.log(`    HTTP Status: ${res.status}`);
        console.log(`    Content-Type: ${res.headers.get('content-type')}`);

        if (!res.ok) {
            const err = await res.text();
            console.error('    ERROR:', err);
            return;
        }

        const reader = res.body;
        let chunks = [];
        let fullText = '';

        await new Promise((resolve) => {
            reader.on('data', (raw) => {
                const lines = raw.toString().split('\n');
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed === 'data: [DONE]') continue;
                    if (trimmed.startsWith('data: ')) {
                        try {
                            const json = JSON.parse(trimmed.slice(6));
                            if (json.text && json.text !== 'Initializing...') {
                                chunks.push(json.text);
                                fullText += json.text;
                            }
                        } catch {}
                    }
                }
            });

            reader.on('end', resolve);
            setTimeout(resolve, 30000);
        });

        console.log(`    Chunks received: ${chunks.length}`);
        console.log(`    Full response: "${fullText.substring(0, 200)}${fullText.length > 200 ? '...' : ''}"`);
        
        if (chunks.length === 0) {
            console.error('\n    ❌ NO CHUNKS RECEIVED - Backend streaming is broken');
        } else {
            console.log('\n    ✅ Backend streaming works! The fix in chat-bubble.ts should resolve the UI issue.');
        }

    } catch (e) {
        console.error('    Streaming test failed:', e.message);
    }
}

diagnoseStreaming();
