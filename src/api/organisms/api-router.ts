import { Router } from "express";
import config from "@config/env.js";
import { GeminiRestService } from "@adapters/ai-providers/gemini-adapter.js";
import { handleCopilotRequest } from "@api/organisms/copilot-handler.js";
import { resolveACPOptions } from "@shared/molecules/ai-core/option-resolver.js";
import {
  getOrCreateClient,
  removeClientByParams,
} from "@shared/molecules/ai-core/client-manager.js";
import { ModernSDKOrchestrator } from "@orchestrator/workflow-graph.js";
import { NexusSocketRelay } from "@infra/services/molecules/nexus-socket.js";
import { GlobalSystemState } from "@infra/services/molecules/system-state-store.js";
import type { ACPConnectionMethod } from "@shared/atoms/ai-core/types.js";
import { createRateLimiter } from "@api/molecules/rate-limiter.js";
import { validateCopilotRequest } from "@api/atoms/request-validator.js";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { skillRegistry } from "@orchestrator/skill-registry.js";

const limiter = createRateLimiter();
const ACP_VALIDATION_METHODS: Record<string, ACPConnectionMethod> = {
  azure: "azure_byok",
  azure_openai: "azure_byok",
  azure_byok: "azure_byok",
  gemini: "gemini_cli",
  gemini_cli: "gemini_cli",
  copilot: "copilot_cli",
  copilot_cli: "copilot_cli",
};

const apiRouter = Router();

// 🟠 Helper to restrict system controls to local or verified environment
const isLocalRequest = (req: import("express").Request) => {
  const ip = req.ip || req.socket.remoteAddress || "";
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "::ffff:127.0.0.1" ||
    process.env.NODE_ENV !== "production"
  );
};

// Endpoint: Get Server Configuration
apiRouter.get("/config", (_req, res) => {
  res.json({
    COPILOT_MODEL: config.COPILOT_MODEL,
    AVAILABLE_MODELS_GITHUB: config.AVAILABLE_MODELS_GITHUB,
    AVAILABLE_MODELS_GEMINI: config.AVAILABLE_MODELS_GEMINI,
    APP_TITLE: config.APP_TITLE,
    FALLBACK_PRESETS: config.FALLBACK_PRESETS,
    PREVIEW_MODE_GUIDE_MD: config.PREVIEW_MODE_GUIDE_MD,
    DEFAULT_WORD_FONT_STYLE: config.DEFAULT_WORD_FONT_STYLE,
    AUTO_CONNECT_CLI: config.AUTO_CONNECT_CLI,
  });
});

// Endpoint: Get Skill Registry Snapshot for client-side discovery
apiRouter.get("/skills", (_req, res) => {
  try {
    const snapshot = skillRegistry.getRegistrySnapshot();
    res.json({
      version: "Omni-Zenith-Dynamic",
      timestamp: new Date().toISOString(),
      skills: snapshot,
    });
  } catch (err: unknown) {
    res.status(500).json({ status: 500, detail: "Registry snapshot failure: " + String(err) });
  }
});

// Endpoint: Validate Gemini Direct API Key
apiRouter.post("/gemini/validate", async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (typeof apiKey !== "string" || !apiKey.trim()) {
      res.status(400).json({ status: 400, detail: "apiKey missing" });
      return;
    }
    await GeminiRestService.validate(apiKey);
    res.json({ status: 200, detail: "Gemini Key is valid" });
  } catch (err: unknown) {
    const error = err as { status?: number; detail?: string };
    const status = error.status || 401;
    res.status(status).json({ status, detail: error.detail || "Gemini Key is invalid" });
  }
});

// Unified Endpoint: Validate ANY login method via Native ACP Spec
apiRouter.post("/acp/validate", async (req, res) => {
  let client: import("@github/copilot-sdk").CopilotClient | undefined = undefined;
  let validationTimer: ReturnType<typeof setTimeout> | undefined;
  let acpMethod: ACPConnectionMethod | undefined;
  let clientOptions: import("@github/copilot-sdk").CopilotClientOptions | undefined;

  try {
    const { method, token, endpoint, deployment } = req.body;
    acpMethod = ACP_VALIDATION_METHODS[method];
    if (!acpMethod) {
      res.status(400).json({ detail: `Unsupported method: ${method}` });
      return;
    }

    const resolved = resolveACPOptions({
      method: acpMethod,
      model: acpMethod === "gemini_cli" ? "gemini-1.5-flash" : "github-models",
      streaming: false,
      githubToken: acpMethod === "copilot_cli" ? token || undefined : undefined,
      geminiKey: acpMethod === "gemini_cli" ? token : undefined,
      azure: acpMethod === "azure_byok" ? { apiKey: token, endpoint, deployment } : undefined,
    });

    clientOptions = resolved.clientOptions;
    client = await getOrCreateClient(acpMethod, clientOptions);

    const validationTimeoutMs = 15_000;
    const pingPromise = client.ping("health-check");
    const timeoutPromise = new Promise<never>((_, reject) => {
      validationTimer = setTimeout(
        () => reject(new Error("ACP Handshake Timeout")),
        validationTimeoutMs
      );
    });

    await Promise.race([pingPromise, timeoutPromise]);
    res.json({ status: 200, detail: `${method} valid` });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : `ACP failure`;
    res.status(401).json({ status: 401, detail });
  } finally {
    if (validationTimer) clearTimeout(validationTimer);
    if (client && acpMethod && clientOptions) {
      removeClientByParams(acpMethod, clientOptions).catch(() => {});
    }
  }
});

// Endpoint: Detailed Health Checks (D2)
apiRouter.get("/health", async (_req, res) => {
  try {
    const health = await ModernSDKOrchestrator.healthCheck();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      node_version: process.version,
      providers: health,
      memory: process.memoryUsage().rss,
    });
  } catch (err: unknown) {
    res.status(500).json({ status: "error", detail: String(err) });
  }
});

// Endpoint: Main Copilot Generation
apiRouter.post("/copilot", limiter, validateCopilotRequest, handleCopilotRequest);

// --- AUTH PROTECTED SYSTEM CONTROLS ---

apiRouter.post("/system/patch", async (req, res) => {
  if (!isLocalRequest(req)) {
    res.status(403).json({ detail: "Restricted" });
    return;
  }
  try {
    const patcherPath = path.resolve(
      process.cwd(),
      "src",
      "infra",
      "scripts",
      "core",
      "patch-copilot-sdk.mjs"
    );
    await import(pathToFileURL(patcherPath).href);
    res.json({ status: 200, detail: "SDK Patched" });
  } catch (err: unknown) {
    res.status(500).json({ status: 500, detail: String(err) });
  }
});

apiRouter.get("/system/state", (_req, res) => {
  res.json(GlobalSystemState.getState());
});

apiRouter.post("/system/state", (req, res) => {
  if (!isLocalRequest(req)) {
    res.status(403).json({ detail: "Restricted" });
    return;
  }
  const { power, provider, isWarming, isStreaming } = req.body;

  if (provider && !ACP_VALIDATION_METHODS[provider]) {
    res.status(400).json({ detail: "Invalid provider" });
    return;
  }

  GlobalSystemState.update({ power, provider, isWarming, isStreaming });
  const newState = GlobalSystemState.getState();
  NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", newState);
  res.json({ status: 200, ...newState });
});

apiRouter.get("/system/warmup", async (req, res) => {
  if (!isLocalRequest(req)) {
    res.status(403).json({ detail: "Restricted" });
    return;
  }
  GlobalSystemState.update({ isWarming: true });
  try {
    const { warmUpClient } = await import("@shared/molecules/ai-core/client-manager.js");
    await warmUpClient(GlobalSystemState.getState().provider);
    GlobalSystemState.update({ isWarming: false });
    res.json({ status: 200, detail: "Warming complete" });
  } catch (e) {
    GlobalSystemState.update({ isWarming: false });
    res.status(500).json({ status: 500, detail: String(e) });
  }
});

export default apiRouter;
