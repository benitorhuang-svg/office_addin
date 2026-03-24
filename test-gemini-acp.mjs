
import { CopilotClient, approveAll } from "@github/copilot-sdk";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

async function testGemini() {
  try {
    const geminiCoreIndex = require.resolve("@google/gemini-cli/dist/index.js");
    console.log("Gemini Index:", geminiCoreIndex);

    const client = new CopilotClient({
      cliPath: geminiCoreIndex,
      useStdio: true,
      cliArgs: ['--acp'],
      env: { ...process.env, GEMINI_API_KEY: process.env.GEMINI_API_KEY || "dummy" }
    });

    console.log("Starting client...");
    await client.start();
    console.log("Client started! Handshake success.");
    
    console.log("Listing models...");
    const models = await client.listModels();
    console.log("Models:", models.length);
    
    await client.disconnect();
    console.log("Disconnected.");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

testGemini();
