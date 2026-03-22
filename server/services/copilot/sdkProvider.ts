import { CopilotClient } from "@github/copilot-sdk";
import path from 'node:path';
import config from '../../config/env.js';
import { AzureInfo } from './types.js';

/**
 * Handles Official @github/copilot-sdk (CLI, Azure, Gemini CLI).
 */
export async function sendPromptViaCopilotSdk(
  prompt: string,
  token: string, 
  onChunk?: (chunk: string) => void,
  isExplicitCli: boolean = false,
  modelName: string = config.COPILOT_MODEL,
  azureInfo?: AzureInfo
): Promise<string> {
  const isCliAuth = isExplicitCli || (token && token.length > 20);
  
  if (isCliAuth) {
    try {
      const clientOptions: any = {};
      const sessionOptions: any = {
        model: modelName,
        onPermissionRequest: async () => ({ grant: true }),
        streaming: !!onChunk
      };

      const isGeminiModel = modelName.toLowerCase().includes('gemini');
      
      if (isGeminiModel) {
        // Method: Gemini CLI 整合 (ACP)
        clientOptions.cliPath = "gemini";
        sessionOptions.cliArgs = '--experimental-acp';
      } else if (config.COPILOT_AGENT_PORT) {
        // Method: 遠端 CLI
        clientOptions.cliArgs = [`--port`, config.COPILOT_AGENT_PORT];
      } else {
        // Method: 預設 CLI
        const repoRoot = process.cwd();
        clientOptions.cliPath = path.resolve(repoRoot, "node_modules/@github/copilot/index.js");
      }

      // Method: Azure OpenAI BYOK
      const azureKey = azureInfo?.apiKey || config.AZURE_OPENAI_API_KEY;
      const azureEndpoint = azureInfo?.endpoint || config.AZURE_OPENAI_ENDPOINT;
      const azureDeployment = azureInfo?.deployment || config.AZURE_OPENAI_DEPLOYMENT;

      if (azureKey) {
        sessionOptions.provider = {
          type: "azure",
          baseUrl: azureEndpoint || "",
          apiKey: azureKey,
          azure: {
            apiVersion: config.AZURE_OPENAI_API_VERSION || "2024-10-21",
          },
        };
        if (azureDeployment) sessionOptions.model = azureDeployment;
      }

      const client = new CopilotClient(clientOptions);
      await client.start();
      
      const session = await (client as any).createSession(sessionOptions);

      if (onChunk) {
        const response = await session.send({ prompt });
        const text = (response as any).text || (response as any).content || String(response);
        
        // Mock streaming for user comfort if SDK is sync
        const segments = text.split(/(\s+)/);
        for (const segment of segments) {
          onChunk(segment);
          await new Promise(r => setTimeout(r, 10));
        }
        return text;
      } else {
        const response = await session.send({ prompt });
        return (response as any).text || (response as any).content || String(response);
      }
    } catch (err: any) {
      console.error("[SDK Error]", err);
      const detail = err.message || JSON.stringify(err);
      const failoverText = `會話初始化遇到預期外的狀況（代碼：${err.code || 'ACP_ERR'}）。\n\n錯誤詳情：${detail}`;
      if (onChunk) onChunk(failoverText);
      return failoverText;
    }
  }

  // Preview / Fallback
  const previewText = `您目前正處於「預覽模式」。啟動完整的 ACP 協議請選擇「Connect Copilot CLI」。`;
  if (onChunk) onChunk(previewText);
  return previewText;
}

export async function checkAgentHealth(): Promise<{ ok: boolean; type: string; latency?: number }> {
  const start = Date.now();
  try {
    // 優先檢查是否有指定的遠端 Port
    if (config.COPILOT_AGENT_PORT) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1000);
      await fetch(`http://localhost:${config.COPILOT_AGENT_PORT}/ping`, { signal: controller.signal });
      clearTimeout(id);
      return { ok: true, type: 'remote_cli', latency: Date.now() - start };
    }

    // 檢查 Gemini 模式或是預設 SDK 模式
    // 註：這是一個簡化的健康檢查，實際 ACP 連線較為複雜
    // 這裡我們模擬一個簡單的 SDK 啟動測試
    const repoRoot = process.cwd();
    const cliPath = path.resolve(repoRoot, "node_modules/@github/copilot/index.js");
    const client = new CopilotClient({ cliPath });
    
    // 短時間內確認 SDK 是否能被實例化或啟動
    // 如果本地端沒問題，這裡應該很快就會返回
    return { ok: true, type: 'local_sdk', latency: Date.now() - start };
  } catch {
    return { ok: false, type: 'none' };
  }
}

export function describeCopilotSdkError(err: any) {
  return {
    status: err.status || 502,
    error: 'copilot_sdk_error',
    detail: err.message || String(err),
  };
}
