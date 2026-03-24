import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

(async () => {
    try {
        console.log("Sending POST to Webpack Proxy (Port 3000)...");
        const res = await fetch("https://localhost:3000/api/copilot", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "X-Gemini-Key": "mock_key"
            },
            body: JSON.stringify({
                prompt: "Tell me a joke",
                officeContext: { selectionText: "", documentText: "" },
                model: "gemini-3.1-pro",
                presetId: "general",
                stream: true,
                authProvider: "gemini_cli"
            }),
            agent
        });

        console.log("Status: " + res.status);
        if (res.body) {
            res.body.on('data', (chunk) => {
                console.log("CHUNK: " + chunk.toString());
            });
            res.body.on('end', () => console.log("DONE"));
        }
    } catch(e) {
        console.error("Fetch failed: ", e);
    }
})();
