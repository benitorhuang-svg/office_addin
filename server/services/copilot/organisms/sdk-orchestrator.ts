import { CopilotClient } from "@github/copilot-sdk";
import config from '../../../config/env.js';
import { ACPConnectionMethod, AzureInfo, ACPSessionConfig } from '../atoms/types.js';
import { CORE_SDK_CONFIG } from '../atoms/core-config.js';
import { extractResponseText, emitChunks } from '../atoms/formatters.js';
import { resolveMethodFromContext, resolveACPOptions } from '../molecules/option-resolver.js';
import { getOrCreateClient, dropClient } from '../molecules/client-manager.js';

/**
 * Organism: Sends a prompt through the official @github/copilot-sdk using atomized steps.
 * Handles:
 *  1. Method resolution (Molecule)
 *  2. ACP Option generation (Molecule)
 *  3. Client Lifecycle (Molecule)
 *  4. Native SDK Event orchestration (Organism)
 *  5. Error failover and fallback (Molecule)
 */
export async function sendPromptViaCopilotSdk(
  prompt: string,
  _token: string,
  onChunk?: (chunk: string) => void,
  isExplicitCli: boolean = false,
  modelName: string = config.COPILOT_MODEL,
  azureInfo?: AzureInfo,
  methodOverride?: ACPConnectionMethod
): Promise<string> {
  const method = methodOverride || resolveMethodFromContext(modelName, azureInfo, isExplicitCli);
  console.log(`[ACP Organism] Dispatching via method: ${method}, model: ${modelName}`);

  const acpConfig: ACPSessionConfig = {
    method,
    model: modelName,
    streaming: !!onChunk,
    azure: azureInfo,
    remotePort: config.COPILOT_AGENT_PORT || undefined,
  };

  try {
    const { clientOptions, sessionOptions } = resolveACPOptions(acpConfig);
    const client: CopilotClient = await getOrCreateClient(method, clientOptions);
    const session: any = await client.createSession(sessionOptions);

    if (onChunk && sessionOptions.streaming) {
      let fullText = '';
      session.on('assistant.message_delta', (event: any) => {
        const delta = event.delta?.content || event.data?.deltaContent || '';
        if (delta) {
          fullText += delta;
          onChunk(delta);
        }
      });

      // Use atomized timeout constraint (300s)
      const finalEvent = await session.sendAndWait({ prompt }, CORE_SDK_CONFIG.GEN_TIMEOUT_MS);
      const finalText = extractResponseText(finalEvent);

      if (!fullText && finalText) {
        await emitChunks(finalText, onChunk);
        fullText = finalText;
      }

      try { await session.disconnect(); } catch {}
      return fullText || finalText;
    }

    // Non-streaming path with timeout
    const response = await session.sendAndWait({ prompt }, CORE_SDK_CONFIG.GEN_TIMEOUT_MS);
    const text = extractResponseText(response);

    try { await session.disconnect(); } catch {}
    return text;
  } catch (err: unknown) {
    console.error(`[ACP Organism Error] Method: ${method}`, err);
    const detail = err instanceof Error ? err.message : JSON.stringify(err);
    const code = (err as Record<string, unknown>)?.code || 'ACP_ERR';
    const failoverText =
      `ACP 會話初始化遇到預期外的狀況（方式：${method}，代碼：${code}）。\n\n錯誤詳情：${detail}`;
    if (onChunk) onChunk(failoverText);
    
    // Auto-cleanup for local agents on failure
    if (method === 'gemini_cli' || method === 'copilot_cli') {
        dropClient(method);
    }
    return failoverText;
  }
}
