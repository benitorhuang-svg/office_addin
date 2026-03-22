import { sendPromptViaCopilotSdk } from './server/services/copilot/sdkProvider.js';
import config from './server/config/env.js';

async function testGeminiCli() {
    console.log('--- Testing Gemini CLI via Copilot SDK Bridge ---');
    
    // Ensure we are using 'gemini_cli' method
    const prompt = 'Hello, what is your model version?';
    const method = 'gemini_cli';
    
    try {
        console.log(`Sending prompt: "${prompt}" via ${method}...`);
        const response = await sendPromptViaCopilotSdk(
            prompt,
            'dummy-token',
            (chunk) => process.stdout.write(chunk),
            true, // isExplicitCli
            'gemini-1.5-flash',
            undefined,
            method
        );
        
        console.log('\n\nFinal Response:', response);
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        // Since we have a singleton client, it might keep the process alive.
        // For a test, we might want to shut it down or just exit.
        setTimeout(() => process.exit(0), 2000);
    }
}

testGeminiCli();
