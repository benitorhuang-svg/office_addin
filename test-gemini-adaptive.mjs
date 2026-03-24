
import { getOrCreateClient } from './server/services/copilot/molecules/client-manager.js';
import { resolveACPOptions } from './server/services/copilot/molecules/option-resolver.js';
import dotenv from 'dotenv';
dotenv.config();

async function testGemini() {
  console.log("=== Testing Gemini ACP Integration (Standard Shim Mode) ===");
  
  const options = resolveACPOptions({ method: 'gemini_cli' });
  console.log(`Using CLI Path (Shim): ${options.clientOptions.cliPath}`);

  try {
    const client = await getOrCreateClient('gemini_cli', options.clientOptions);
    
    console.log("Client started successfully via Shim!");

    console.log("Listing models...");
    const models = await client.listModels();
    console.log("Models found:", models.length);
    models.forEach(m => console.log(` - ${m.id} (${m.name})`));

    console.log("Sending a test prompt...");
    const session = await client.createSession(options.sessionOptions);
    let fullResponse = "";
    
    const turn = await session.prompt("你好，目前環境已更新至最新版 SDK 配合自適應 Shim。請簡短回覆確認收悉。", {
      onChunk: (chunk) => {
        if (chunk.content) {
          fullResponse += chunk.content;
          process.stdout.write(chunk.content);
        }
      }
    });

    console.log("\n\nFinal Response received!");
    await client.stop();
    console.log("Test completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Test FAILED:", error);
    process.exit(1);
  }
}

testGemini();
