var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
};

// src/config/atoms/base-env.ts
import path from "path";
import dotenv from "dotenv";
function firstDefinedValue(...values) {
  for (let value of values) {
    let normalized = String(value ?? "").trim();
    if (normalized) return normalized;
  }
  return "";
}
var projectRoot, BASE_ENV, init_base_env = __esm({
  "src/config/atoms/base-env.ts"() {
    "use strict";
    projectRoot = path.resolve(process.cwd());
    dotenv.config({ path: path.join(projectRoot, ".env") });
    BASE_ENV = {
      PORT: process.env.PORT || 4e3,
      COPILOT_AGENT_PORT: process.env.COPILOT_AGENT_PORT || "",
      GEMINI_CLI_PATH: process.env.GEMINI_CLI_PATH || "gemini",
      GEMINI_CLI_ARGS: process.env.GEMINI_CLI_ARGS || "--acp",
      GEMINI_CLI_PORT: process.env.GEMINI_CLI_PORT || "8080",
      COPILOT_API_URL: process.env.COPILOT_API_URL || "",
      GITHUB_MODELS_API_VERSION: process.env.GITHUB_MODELS_API_VERSION || "2022-11-28",
      COPILOT_MODEL: firstDefinedValue(process.env.COPILOT_MODEL, "gpt-5-mini"),
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
      AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY || "",
      AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT || "",
      AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION || "2024-10-21",
      AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT || "",
      get GITHUB_CLIENT_ID() {
        return process.env.GITHUB_CLIENT_ID || "";
      },
      get GITHUB_CLIENT_SECRET() {
        return process.env.GITHUB_CLIENT_SECRET || "";
      },
      GITHUB_MODELS_URL: process.env.GITHUB_MODELS_URL || "https://models.github.ai/inference/chat/completions",
      GEMINI_REST_URL: process.env.GEMINI_REST_URL || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      DEFAULT_TEMPERATURE: process.env.DEFAULT_TEMPERATURE || "0.7",
      MAX_TOKENS: process.env.MAX_TOKENS || "2048",
      DEFAULT_RESPONSE_LANGUAGE: firstDefinedValue(process.env.DEFAULT_RESPONSE_LANGUAGE, "\u7E41\u9AD4\u4E2D\u6587"),
      DEFAULT_PERSONA: firstDefinedValue(process.env.DEFAULT_PERSONA, "\u6587\u6848\u9AD8\u624B\uFF0C\u64C5\u9577\u6839\u64DA\u4E3B\u984C\u5EF6\u4F38\u767C\u60F3\u3001\u63D0\u7149\u8CE3\u9EDE\u3001\u88DC\u5145\u89D2\u5EA6\u8207\u7522\u51FA\u53EF\u76F4\u63A5\u4F7F\u7528\u7684\u5167\u5BB9"),
      APP_TITLE: firstDefinedValue(process.env.APP_TITLE, "office_Agent"),
      FALLBACK_PRESETS_JSON: firstDefinedValue(process.env.FALLBACK_PRESETS_JSON, JSON.stringify([
        { id: "general", label: "General Writing", description: "Balanced drafting for normal editing." },
        { id: "summary", label: "Summary", description: "Concise summary of selection." }
      ])),
      PREVIEW_MODE_GUIDE_MD: firstDefinedValue(process.env.PREVIEW_MODE_GUIDE_MD, "\u60A8\u76EE\u524D\u8655\u65BC **\u9810\u89BD\u6A21\u5F0F**\u3002<br>**\u672C\u5DE5\u5177\u652F\u63F4\u4EE5\u4E0B\u767B\u5165\u65B9\u5F0F\uFF1A**<br>1. **Google Gemini**\uFF1A\u4F7F\u7528 CLI \u6216 API Key \u3002<br>2. **GitHub Copilot**\uFF1A\u4F7F\u7528 CLI \u3001 \u900F\u904EOAuth \u6216 PAT \u9023\u7DDA\u3002<br>3. **Azure OpenAI**\uFF1A\u4F7F\u7528\u81EA\u6709\u6191\u8B49\u3002<br>**\u5982\u4F55\u958B\u59CB\u4F7F\u7528\uFF1F**<br>\u9EDE\u64CA\u53F3\u4E0B\u89D2 **\u767B\u51FA\u6309\u9215** \u5373\u53EF\u8A2D\u5B9A\u9023\u7DDA\u3002"),
      DEFAULT_WORD_FONT_STYLE: firstDefinedValue(process.env.DEFAULT_WORD_FONT_STYLE, "font-family: '\u5FAE\u8EDF\u6B63\u9ED1\u9AD4', 'Microsoft JhengHei', 'Segoe UI', sans-serif; font-size: 11pt;"),
      // Optimization & Resilience
      RATE_LIMIT_RPM: process.env.RATE_LIMIT_RPM || "30",
      RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED !== "false",
      IDLE_CLEANUP_MINUTES: process.env.IDLE_CLEANUP_MINUTES || "30",
      FALLBACK_MODELS: process.env.FALLBACK_MODELS || "",
      LOG_FORMAT: process.env.LOG_FORMAT || "json"
    };
  }
});

// src/config/molecules/server-config.ts
import { z } from "zod";
var _cachedFallbackPresets, config, configSchema, server_config_default, init_server_config = __esm({
  "src/config/molecules/server-config.ts"() {
    "use strict";
    init_base_env();
    _cachedFallbackPresets = null, config = {
      get PORT() {
        return BASE_ENV.PORT;
      },
      get COPILOT_AGENT_PORT() {
        return BASE_ENV.COPILOT_AGENT_PORT;
      },
      get GEMINI_CLI_PATH() {
        return BASE_ENV.GEMINI_CLI_PATH;
      },
      get GEMINI_CLI_ARGS() {
        return BASE_ENV.GEMINI_CLI_ARGS;
      },
      get GEMINI_CLI_PORT() {
        return BASE_ENV.GEMINI_CLI_PORT;
      },
      get COPILOT_API_URL() {
        return BASE_ENV.COPILOT_API_URL;
      },
      get GITHUB_MODELS_API_VERSION() {
        return BASE_ENV.GITHUB_MODELS_API_VERSION;
      },
      get COPILOT_MODEL() {
        return BASE_ENV.COPILOT_MODEL;
      },
      get AVAILABLE_MODELS_GITHUB() {
        return (process.env.AVAILABLE_MODELS_GITHUB || "gpt-5-mini,gpt-5.4-mini,gpt-5.4,claude sonnet 4.6").split(",").map((m) => m.trim());
      },
      get AVAILABLE_MODELS_GEMINI() {
        return (process.env.AVAILABLE_MODELS_GEMINI || "Gemini 3.1 Pro,Gemini 2.5 Pro,Gemini 3 Flash,Gemini 2.5 Flash,Gemini 2 Flash,Gemini 2.5 Flash Lite").split(",").map((m) => m.trim());
      },
      get AVAILABLE_MODELS() {
        return [...this.AVAILABLE_MODELS_GITHUB, ...this.AVAILABLE_MODELS_GEMINI];
      },
      get GEMINI_API_KEY() {
        return BASE_ENV.GEMINI_API_KEY;
      },
      get AZURE_OPENAI_API_KEY() {
        return BASE_ENV.AZURE_OPENAI_API_KEY;
      },
      get AZURE_OPENAI_ENDPOINT() {
        return BASE_ENV.AZURE_OPENAI_ENDPOINT;
      },
      get AZURE_OPENAI_API_VERSION() {
        return BASE_ENV.AZURE_OPENAI_API_VERSION;
      },
      get AZURE_OPENAI_DEPLOYMENT() {
        return BASE_ENV.AZURE_OPENAI_DEPLOYMENT;
      },
      get DEFAULT_RESPONSE_LANGUAGE() {
        return BASE_ENV.DEFAULT_RESPONSE_LANGUAGE;
      },
      get DEFAULT_PERSONA() {
        return BASE_ENV.DEFAULT_PERSONA;
      },
      get GITHUB_CLIENT_ID() {
        return BASE_ENV.GITHUB_CLIENT_ID;
      },
      get GITHUB_CLIENT_SECRET() {
        return BASE_ENV.GITHUB_CLIENT_SECRET;
      },
      get GITHUB_MODELS_URL() {
        return BASE_ENV.GITHUB_MODELS_URL;
      },
      get GEMINI_REST_URL() {
        return BASE_ENV.GEMINI_REST_URL;
      },
      get DEFAULT_TEMPERATURE() {
        return Number(BASE_ENV.DEFAULT_TEMPERATURE);
      },
      get MAX_TOKENS() {
        return Number(BASE_ENV.MAX_TOKENS);
      },
      get APP_TITLE() {
        return BASE_ENV.APP_TITLE;
      },
      get FALLBACK_PRESETS() {
        if (!_cachedFallbackPresets)
          try {
            _cachedFallbackPresets = JSON.parse(BASE_ENV.FALLBACK_PRESETS_JSON);
          } catch {
            _cachedFallbackPresets = [];
          }
        return _cachedFallbackPresets;
      },
      get PREVIEW_MODE_GUIDE_MD() {
        return BASE_ENV.PREVIEW_MODE_GUIDE_MD;
      },
      get DEFAULT_WORD_FONT_STYLE() {
        return BASE_ENV.DEFAULT_WORD_FONT_STYLE;
      },
      getServerPatToken: () => firstDefinedValue(
        process.env.COPILOT_GITHUB_TOKEN,
        process.env.GH_TOKEN,
        process.env.GITHUB_TOKEN,
        process.env.GITHUB_PAT,
        process.env.COPILOT_PAT
      ),
      getModelsToken: () => firstDefinedValue(
        process.env.GITHUB_MODELS_TOKEN,
        process.env.COPILOT_GITHUB_TOKEN,
        process.env.GH_TOKEN,
        process.env.GITHUB_TOKEN,
        process.env.GITHUB_PAT,
        process.env.COPILOT_PAT
      ),
      isAzureConfigured: () => !!(config.AZURE_OPENAI_API_KEY && config.AZURE_OPENAI_ENDPOINT),
      isRemoteCliConfigured: () => !!config.COPILOT_AGENT_PORT,
      isGeminiApiConfigured: () => !!config.GEMINI_API_KEY,
      get AUTO_CONNECT_CLI() {
        return process.env.AUTO_CONNECT_CLI === "true" || process.env.NODE_ENV === "development";
      },
      get RATE_LIMIT_RPM() {
        return Number(BASE_ENV.RATE_LIMIT_RPM);
      },
      get RATE_LIMIT_ENABLED() {
        return BASE_ENV.RATE_LIMIT_ENABLED;
      },
      get IDLE_CLEANUP_MINUTES() {
        return Number(BASE_ENV.IDLE_CLEANUP_MINUTES);
      },
      get FALLBACK_MODELS() {
        return BASE_ENV.FALLBACK_MODELS;
      },
      get LOG_FORMAT() {
        return BASE_ENV.LOG_FORMAT;
      }
    }, configSchema = z.object({
      GITHUB_MODELS_URL: z.string().url(),
      GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required for agent skills")
    });
    try {
      configSchema.parse({
        GITHUB_MODELS_URL: config.GITHUB_MODELS_URL,
        GEMINI_API_KEY: config.GEMINI_API_KEY
      });
    } catch (err) {
      err instanceof z.ZodError ? console.error("?? Configuration Validation Failed:", err.errors) : console.error("?? Configuration Validation Failed:", err);
    }
    server_config_default = config;
  }
});

// src/config/env.ts
var env_default, init_env = __esm({
  "src/config/env.ts"() {
    "use strict";
    init_server_config();
    env_default = server_config_default;
  }
});

// src/shared/atoms/ai-core/core-config.ts
var CORE_SDK_CONFIG, init_core_config = __esm({
  "src/shared/atoms/ai-core/core-config.ts"() {
    "use strict";
    init_env();
    CORE_SDK_CONFIG = {
      // Global internal SDK timeout for session.sendAndWait
      GEN_TIMEOUT_MS: 3e5,
      // 5 minutes (300 seconds)
      // CLI startup timeout. Gemini on Windows may need longer to bootstrap.
      CLIENT_START_TIMEOUT_MS: Number(process.env.CLIENT_START_TIMEOUT_MS || 3e4),
      GEMINI_CLIENT_START_TIMEOUT_MS: Number(process.env.GEMINI_CLIENT_START_TIMEOUT_MS || 45e3),
      // Default CLI method if nothing else matches
      DEFAULT_METHOD: "copilot_cli",
      // Default Remote Agent Port
      DEFAULT_REMOTE_PORT: env_default.COPILOT_AGENT_PORT || "17817",
      // Azure default API version
      AZURE_API_VERSION: env_default.AZURE_OPENAI_API_VERSION || "2024-10-21",
      // Watchdog & Timeout behaviors (Configurable via ENV)
      WATCHDOG_INACTIVITY_MS: Number(process.env.WATCHDOG_INACTIVITY_MS || 45e3),
      USER_INPUT_TIMEOUT_MS: Number(process.env.USER_INPUT_TIMEOUT_MS || 18e4),
      // Localized Strategy & Tool messages
      MOCK_ACP_SEARCH_RESULT: process.env.MOCK_ACP_SEARCH_RESULT || "[\u641C\u7D22\u7D50\u679C] \u5728 GitHub Copilot SDK \u8108\u7D61\u4E0B\uFF0CACP \u4EE3\u8868\u300EAgent Connection Protocol\u300F\u3002\u9019\u662F\u4E00\u5957\u5141\u8A31 SDK \u8ABF\u7528\u4E0D\u540C Agent (CLI) \u7684\u81EA\u5B9A\u7FA9\u5354\u8B70\u3002\u5E38\u898B\u7684\u9023\u63A5\u65B9\u5F0F\u5305\u62EC\uFF1Acopilot_cli, gemini_cli, azure_byok\u3002",
      PROGRESS_FEEDBACK_PREFIX: process.env.PROGRESS_FEEDBACK_PREFIX || `
> \u{1F916} *AI \u6B63\u5728\u601D\u8003...`,
      PROGRESS_FEEDBACK_SUFFIX: process.env.PROGRESS_FEEDBACK_SUFFIX || `\u6B63\u5728\u5206\u6790\u4E26\u601D\u8003...*

`,
      ERROR_SDK_CONNECTION_FAIL: process.env.ERROR_SDK_CONNECTION_FAIL || "SDK V2 \u9023\u63A5\u5931\u6557",
      MOCK_SEARCH_NO_RESULT: process.env.MOCK_SEARCH_NO_RESULT || "\u641C\u7D22\u7D50\u679C ({query})\uFF1A\u672A\u627E\u5230\u8207\u8A72\u67E5\u8A62\u76F4\u63A5\u76F8\u95DC\u7684\u5B9A\u7FA9\uFF0C\u5EFA\u8B70\u8A62\u554F\u4F7F\u7528\u8005\u662F\u5426\u9700\u8981\u66F4\u8A73\u7D30\u7684\u8AAA\u660E\u3002",
      MAX_SDK_RETRIES: Number(process.env.MAX_SDK_RETRIES || 1)
    };
  }
});

// src/shared/logger/index.ts
function sanitizeValue(value, seen = /* @__PURE__ */ new WeakSet()) {
  if (value == null)
    return value;
  if (value instanceof Date)
    return value.toISOString();
  if (typeof value == "bigint")
    return value.toString();
  if (value instanceof Error) {
    let errorShape = {
      name: value.name,
      message: value.message,
      stack: value.stack
    };
    return "cause" in value && value.cause !== void 0 && (errorShape.cause = sanitizeValue(value.cause, seen)), errorShape;
  }
  if (typeof value != "object")
    return value;
  if (seen.has(value))
    return "[Circular]";
  if (seen.add(value), Array.isArray(value))
    return value.map((item) => sanitizeValue(item, seen));
  let output = {};
  for (let [key, entry] of Object.entries(value))
    output[key] = REDACTED_KEYS.test(key) ? "[REDACTED]" : sanitizeValue(entry, seen);
  return output;
}
function writeLog(level, tag, message, data, requestId, traceId) {
  let entry = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level,
    tag,
    message
  };
  requestId && (entry.requestId = requestId), traceId && (entry.traceId = traceId), data !== void 0 && (entry.data = sanitizeValue(data));
  let line = JSON.stringify(entry);
  if (logHook)
    try {
      logHook(entry);
    } catch {
    }
  switch (level) {
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
    default:
      console.log(line);
      break;
  }
}
var REDACTED_KEYS, logHook, logger, init_logger = __esm({
  "src/shared/logger/index.ts"() {
    "use strict";
    REDACTED_KEYS = /token|api[_-]?key|authorization|bearer|password|secret/i;
    logHook = null;
    logger = {
      info: (tag, message, data) => writeLog("info", tag, message, data),
      warn: (tag, message, data) => writeLog("warn", tag, message, data),
      error: (tag, message, data) => writeLog("error", tag, message, data),
      /**
       * Registers a global hook that receives every log entry.
       */
      setHook: (hook) => {
        logHook = hook;
      },
      /**
       * Returns a request-scoped logger that automatically includes requestId in every entry.
       * Usage: const log = logger.withReqId(req.requestId);
       */
      withReqId: (requestId) => ({
        info: (tag, message, data) => writeLog("info", tag, message, data, requestId),
        warn: (tag, message, data) => writeLog("warn", tag, message, data, requestId),
        error: (tag, message, data) => writeLog("error", tag, message, data, requestId),
        /** Attach a traceId to this request-scoped logger for cross-service chain tracing. */
        withTrace: (traceId) => ({
          info: (tag, message, data) => writeLog("info", tag, message, data, requestId, traceId),
          warn: (tag, message, data) => writeLog("warn", tag, message, data, requestId, traceId),
          error: (tag, message, data) => writeLog("error", tag, message, data, requestId, traceId)
        })
      }),
      /**
       * Returns a trace-scoped logger (cross-service chain; no specific HTTP request).
       * Usage: const log = logger.withTrace(traceId);
       */
      withTrace: (traceId) => ({
        info: (tag, message, data) => writeLog("info", tag, message, data, void 0, traceId),
        warn: (tag, message, data) => writeLog("warn", tag, message, data, void 0, traceId),
        error: (tag, message, data) => writeLog("error", tag, message, data, void 0, traceId)
      })
    };
  }
});

// src/shared/molecules/ai-core/idle-cleaner.ts
var DEFAULT_IDLE_MINUTES, SCAN_INTERVAL_MS, activityLog, scanTimer, IdleCleaner, init_idle_cleaner = __esm({
  "src/shared/molecules/ai-core/idle-cleaner.ts"() {
    "use strict";
    init_logger();
    DEFAULT_IDLE_MINUTES = 30, SCAN_INTERVAL_MS = 5 * 6e4, activityLog = /* @__PURE__ */ new Map(), scanTimer = null, IdleCleaner = {
      /** Record activity for a client key */
      touch(key) {
        activityLog.set(key, Date.now());
      },
      /** Check if a client key is idle beyond the threshold */
      isIdle(key) {
        let last = activityLog.get(key);
        if (!last) return !0;
        let idleMs = this.getIdleThresholdMs();
        return Date.now() - last > idleMs;
      },
      /** Get all idle entries */
      getIdleEntries() {
        let threshold = this.getIdleThresholdMs(), now = Date.now(), idle = [];
        for (let [key, lastActivity] of activityLog)
          now - lastActivity > threshold && idle.push({ key, lastActivity });
        return idle;
      },
      /** Remove tracking for a client key */
      remove(key) {
        activityLog.delete(key);
      },
      /** Start periodic idle scanning */
      startScanning(cleanupFn) {
        scanTimer || (scanTimer = setInterval(async () => {
          let idleEntries = this.getIdleEntries();
          for (let entry of idleEntries) {
            let idleMins = Math.round((Date.now() - entry.lastActivity) / 6e4);
            logger.info("IdleCleaner", "Cleaning idle client", { key: entry.key, idleMinutes: idleMins });
            try {
              await cleanupFn(entry.key), this.remove(entry.key);
            } catch (err) {
              logger.error("IdleCleaner", "Failed to cleanup idle client", { key: entry.key, error: err });
            }
          }
        }, SCAN_INTERVAL_MS), scanTimer.unref());
      },
      /** Stop periodic scanning */
      stopScanning() {
        scanTimer && (clearInterval(scanTimer), scanTimer = null);
      },
      getIdleThresholdMs() {
        return (Number(process.env.IDLE_CLEANUP_MINUTES) || DEFAULT_IDLE_MINUTES) * 6e4;
      },
      /** Reset all tracking (for tests) */
      reset() {
        activityLog.clear(), this.stopScanning();
      }
    };
  }
});

// src/shared/atoms/ai-core/permission-policy.ts
function approved() {
  return { kind: "approved" };
}
function denied() {
  return { kind: "denied-no-approval-rule-and-could-not-request-from-user" };
}
var SAFE_CUSTOM_TOOLS, AUTO_APPROVE_ALL_PERMISSIONS, AUTO_APPROVE_PYTHON_TOOL, handleCopilotPermissionRequest, init_permission_policy = __esm({
  "src/shared/atoms/ai-core/permission-policy.ts"() {
    "use strict";
    init_logger();
    SAFE_CUSTOM_TOOLS = /* @__PURE__ */ new Set([
      "google_search",
      "create_excel_chart",
      "word_skill",
      "excel_skill",
      "powerpoint_skill"
    ]), AUTO_APPROVE_ALL_PERMISSIONS = process.env.COPILOT_AUTO_APPROVE_ALL_PERMISSIONS === "true", AUTO_APPROVE_PYTHON_TOOL = process.env.COPILOT_AUTO_APPROVE_PYTHON_TOOL === "true";
    handleCopilotPermissionRequest = (request, invocation) => {
      let toolName = typeof request.toolName == "string" ? request.toolName : void 0;
      if (AUTO_APPROVE_ALL_PERMISSIONS)
        return logger.warn("SDKPermission", "Auto-approving permission request due to env override", {
          sessionId: invocation.sessionId,
          kind: request.kind,
          toolName
        }), approved();
      if (request.kind === "custom-tool") {
        if (toolName && SAFE_CUSTOM_TOOLS.has(toolName))
          return approved();
        if (toolName === "python_executor" && AUTO_APPROVE_PYTHON_TOOL)
          return logger.warn("SDKPermission", "Auto-approving python executor due to env override", {
            sessionId: invocation.sessionId,
            toolName
          }), approved();
      }
      return logger.warn("SDKPermission", "Denied permission request by default", {
        sessionId: invocation.sessionId,
        kind: request.kind,
        toolName
      }), denied();
    };
  }
});

// src/shared/atoms/ai-core/tool-surface-policy.ts
function applyLeastPrivilegeToolSurface(sessionOptions) {
  return ENABLE_BUILTIN_TOOLS ? (logger.warn("SDKToolSurface", "Built-in SDK tools are enabled by environment override"), {
    availableTools: sessionOptions.availableTools,
    excludedTools: sessionOptions.excludedTools
  }) : {
    availableTools: [],
    excludedTools: void 0
  };
}
var ENABLE_BUILTIN_TOOLS, init_tool_surface_policy = __esm({
  "src/shared/atoms/ai-core/tool-surface-policy.ts"() {
    "use strict";
    init_logger();
    ENABLE_BUILTIN_TOOLS = process.env.COPILOT_ENABLE_BUILTIN_TOOLS === "true";
  }
});

// src/tools/office-atoms/core/google-search-tool.ts
import { defineTool } from "@github/copilot-sdk";
function createGoogleSearchTool() {
  return defineTool("google_search", {
    description: "\u641C\u7D22\u7DB2\u8DEF\u4EE5\u7372\u53D6\u6700\u65B0\u8A0A\u606F\u6216\u7CBE\u78BA\u5B9A\u7FA9\uFF08\u4F8B\u5982\u7E2E\u5BEB\u3001\u5C08\u696D\u540D\u8A5E\u7B49\uFF09",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "\u641C\u7D22\u95DC\u9375\u5B57" }
      },
      required: ["query"]
    },
    skipPermission: !0,
    handler: async ({ query }) => (logger.info("ToolRegistry", "Executing google_search tool", { query }), query.toUpperCase().includes("ACP") && query.toUpperCase().includes("COPILOT") ? CORE_SDK_CONFIG.MOCK_ACP_SEARCH_RESULT : CORE_SDK_CONFIG.MOCK_SEARCH_NO_RESULT.replace("{query}", query))
  });
}
var init_google_search_tool = __esm({
  "src/tools/office-atoms/core/google-search-tool.ts"() {
    "use strict";
    init_core_config();
    init_logger();
  }
});

// src/infra/services/molecules/system-state-store.ts
var SystemStateStore, GlobalSystemState, init_system_state_store = __esm({
  "src/infra/services/molecules/system-state-store.ts"() {
    "use strict";
    init_logger();
    SystemStateStore = class {
      state = {
        power: "OFF",
        provider: "copilot_cli",
        isWarming: !1,
        isStreaming: !1,
        tokensPerSec: 0,
        ttft: -1,
        activePersona: "General"
      };
      getState() {
        return { ...this.state };
      }
      update(patch) {
        patch.power !== void 0 && (this.state.power = patch.power), patch.provider !== void 0 && (this.state.provider = patch.provider), patch.isWarming !== void 0 && (this.state.isWarming = patch.isWarming), patch.isStreaming !== void 0 && (this.state.isStreaming = patch.isStreaming), patch.tokensPerSec !== void 0 && (this.state.tokensPerSec = patch.tokensPerSec), patch.ttft !== void 0 && (this.state.ttft = patch.ttft), patch.activePersona !== void 0 && (this.state.activePersona = patch.activePersona), logger.info("SystemStateStore", "System state updated", this.state);
      }
    }, GlobalSystemState = new SystemStateStore();
  }
});

// src/infra/services/molecules/nexus-socket.ts
var nexus_socket_exports = {};
__export(nexus_socket_exports, {
  NexusSocketRelay: () => NexusSocketRelay
});
import { WebSocket, WebSocketServer } from "ws";
var NexusSocketRelay, init_nexus_socket = __esm({
  "src/infra/services/molecules/nexus-socket.ts"() {
    "use strict";
    init_system_state_store();
    init_logger();
    NexusSocketRelay = class {
      static wss = null;
      static clients = /* @__PURE__ */ new Set();
      static attach(server) {
        this.wss = new WebSocketServer({ server }), logger.info("NexusSocket", "Nexus relay attached"), this.wss.on("connection", (ws) => {
          this.clients.add(ws), logger.info("NexusSocket", "Client connected", { totalClients: this.clients.size }), ws.on("message", (data) => {
            try {
              let { type, payload } = JSON.parse(data.toString());
              if (type === "PING") {
                ws.send(JSON.stringify({ type: "PONG", payload: {} }));
                return;
              }
              logger.info("NexusSocket", "Received socket message", { type }), (type === "SET_POWER" || type === "SET_PROVIDER") && (GlobalSystemState.update({
                power: type === "SET_POWER" ? payload.on ? "ON" : "OFF" : void 0,
                provider: type === "SET_PROVIDER" ? payload.provider : void 0
              }), this.broadcast("SYSTEM_STATE_UPDATED", GlobalSystemState.getState()));
            } catch (e) {
              logger.error("NexusSocket", "Failed to parse incoming socket message", { error: e });
            }
          }), ws.on("close", () => {
            this.clients.delete(ws), logger.info("NexusSocket", "Client disconnected", { remainingClients: this.clients.size });
          }), ws.on("error", (err) => {
            logger.error("NexusSocket", "WebSocket connection error", { error: err }), this.clients.delete(ws);
          }), ws.send(JSON.stringify({ type: "HANDSHAKE", payload: { status: "READY" } }));
        });
      }
      static broadcast(type, payload) {
        if (!this.wss) return;
        let message = JSON.stringify({ type, payload });
        this.clients.forEach((client) => {
          client.readyState === WebSocket.OPEN && client.send(message);
        }), logger.info("NexusSocket", "Broadcast socket event", { type, clientCount: this.clients.size });
      }
    };
  }
});

// src/tools/office-atoms/core/python-executor-tool.ts
import { defineTool as defineTool2 } from "@github/copilot-sdk";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
function createPythonExecutorTool() {
  return defineTool2("python_executor", {
    description: "Executes industrial Python code for CAGR calculation, trend analysis, and data restructuring. Essential for logic verification.",
    parameters: {
      type: "object",
      properties: {
        code: { type: "string", description: "Python source code to execute" }
      },
      required: ["code"]
    },
    handler: async ({ code }) => {
      let tmpFile = join(tmpdir(), `nexus_script_${randomUUID()}.py`);
      try {
        logger.info("ToolRegistry", "Staging python_executor script", {
          tmpFile,
          timeoutMs: PYTHON_TOOL_TIMEOUT_MS
        }), await writeFile(tmpFile, code, "utf-8");
        let { stdout, stderr } = await execFileAsync("python", [tmpFile], {
          timeout: PYTHON_TOOL_TIMEOUT_MS,
          maxBuffer: PYTHON_TOOL_MAX_BUFFER_BYTES,
          windowsHide: !0
        }), output = (stdout + (stderr || "")).trim();
        if (output.includes("[BRIDGE_DISPATCH]: EXCEL_CHART")) {
          let commandLines = output.split(`
`).filter((line) => line.includes("[BRIDGE_DISPATCH]: EXCEL_CHART")), { NexusSocketRelay: NexusSocketRelay2 } = await Promise.resolve().then(() => (init_nexus_socket(), nexus_socket_exports));
          commandLines.forEach((line, index) => {
            let parts = line.split("|").map((part) => part.trim());
            if (parts.length >= 3) {
              let title = parts[1], type = parts[2], range = parts[3] || "AUTO";
              logger.info("ToolRegistry", "Dispatching chart from python bridge", {
                index,
                total: commandLines.length,
                title,
                chartType: type
              }), NexusSocketRelay2.broadcast("EXCEL_CHART_EXTERNAL", { title, chartType: type, range, index });
            }
          });
        }
        return output || "Execution successful (no standard output).";
      } catch (err) {
        let error = err instanceof Error ? err : new Error(String(err));
        return logger.error("ToolRegistry", "python_executor failed", {
          tmpFile,
          error
        }), `Runtime Error: ${error.message}`;
      } finally {
        try {
          await unlink(tmpFile);
        } catch (cleanupError) {
          logger.warn("ToolRegistry", "Failed to cleanup python temp file", {
            tmpFile,
            error: cleanupError
          });
        }
      }
    }
  });
}
var execFileAsync, PYTHON_TOOL_TIMEOUT_MS, PYTHON_TOOL_MAX_BUFFER_BYTES, init_python_executor_tool = __esm({
  "src/tools/office-atoms/core/python-executor-tool.ts"() {
    "use strict";
    init_logger();
    execFileAsync = promisify(execFile), PYTHON_TOOL_TIMEOUT_MS = Number(process.env.PYTHON_TOOL_TIMEOUT_MS || 15e3), PYTHON_TOOL_MAX_BUFFER_BYTES = Number(process.env.PYTHON_TOOL_MAX_BUFFER_BYTES || 1024 * 1024);
  }
});

// src/tools/office-atoms/office/create-excel-chart-tool.ts
import { defineTool as defineTool3 } from "@github/copilot-sdk";
function createExcelChartTool() {
  return defineTool3("create_excel_chart", {
    description: "Generate a professional industrial chart in the active Excel worksheet. Mandatory for all data visualization tasks.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Chart title" },
        chartType: {
          type: "string",
          enum: ["ColumnClustered", "Line", "Pie", "BarClustered"],
          description: "Type of chart"
        },
        range: {
          type: "string",
          description: "Excel range address (e.g. 'A1:B10') or empty for selection."
        }
      },
      required: ["title", "chartType"]
    },
    skipPermission: !0,
    handler: async ({ title, chartType, range }) => `[DISPATCH]: EXCEL_CHART_INIT | ${title} | ${chartType} | ${range || "AUTO"}`
  });
}
var init_create_excel_chart_tool = __esm({
  "src/tools/office-atoms/office/create-excel-chart-tool.ts"() {
    "use strict";
  }
});

// src/infra/services/bridge-client.ts
async function post(path14, body) {
  let controller = new AbortController(), timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    let response = await fetch(`${BRIDGE_URL}${path14}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    if (!response.ok) {
      let text = await response.text().catch(() => "(no body)");
      throw new Error(`Skill bridge HTTP ${response.status}: ${text}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
async function invokeExcelSkill(payload) {
  return logger.info(TAG, "Invoking Excel skill via bridge", { output: payload.output_path }), post("/skills/excel", payload);
}
async function invokePPTSkill(payload) {
  return logger.info(TAG, "Invoking PPT skill via bridge", { output: payload.output_path }), post("/skills/ppt", payload);
}
async function invokeWordSkill(payload) {
  return logger.info(TAG, "Invoking Word skill via bridge", { output: payload.output_path }), post("/skills/word", payload);
}
var TAG, BRIDGE_URL, REQUEST_TIMEOUT_MS, init_bridge_client = __esm({
  "src/infra/services/bridge-client.ts"() {
    "use strict";
    init_logger();
    TAG = "SkillBridgeClient", BRIDGE_URL = process.env.SKILL_BRIDGE_URL ?? "http://127.0.0.1:8765", REQUEST_TIMEOUT_MS = 12e4;
  }
});

// src/agents/expert-excel/domain/excel-invoker.ts
import path2 from "path";
import { fileURLToPath } from "url";
var __dirname, ExcelSkillInvoker, init_excel_invoker = __esm({
  "src/agents/expert-excel/domain/excel-invoker.ts"() {
    "use strict";
    init_bridge_client();
    __dirname = path2.dirname(fileURLToPath(import.meta.url)), ExcelSkillInvoker = class {
      /**
       * Invoke the ExcelExpert skill via the skill bridge HTTP API.
       */
      static async invokeExcelExpert(inputPath, outputPath, changes) {
        return invokeExcelSkill({
          input_path: inputPath,
          output_path: outputPath,
          changes
        });
      }
      /**
       * Load the expert prompt for Excel operations.
       */
      static getPromptPath() {
        return path2.join(__dirname, "..", "prompts", "excel-expert.md");
      }
    };
  }
});

// src/agents/expert-excel/excel.tools.ts
var init_excel_tools = __esm({
  "src/agents/expert-excel/excel.tools.ts"() {
    "use strict";
    init_excel_invoker();
  }
});

// src/agents/expert-excel/index.ts
import fs from "node:fs/promises";
import path3 from "node:path";
async function getCoreInstructions() {
  let promptPath = path3.join(__currentDir, "prompts", "excel-expert.md");
  try {
    return await fs.readFile(promptPath, "utf-8");
  } catch {
    return "";
  }
}
var __currentDir, init_expert_excel = __esm({
  "src/agents/expert-excel/index.ts"() {
    "use strict";
    init_excel_tools();
    init_excel_invoker();
    __currentDir = path3.resolve(process.cwd(), "src", "agents", "expert-excel");
  }
});

// src/tools/office-atoms/shared/prompt-loader.ts
import { readFile } from "node:fs/promises";
async function loadPrompt(promptPath) {
  try {
    return await readFile(promptPath, "utf-8");
  } catch {
    return "";
  }
}
var init_prompt_loader = __esm({
  "src/tools/office-atoms/shared/prompt-loader.ts"() {
    "use strict";
  }
});

// src/tools/office-atoms/shared/tool-result.ts
function createSuccessToolResult(payload) {
  return {
    resultType: "success",
    textResultForLlm: JSON.stringify(payload, null, 2)
  };
}
var init_tool_result = __esm({
  "src/tools/office-atoms/shared/tool-result.ts"() {
    "use strict";
  }
});

// src/tools/office-atoms/shared/office-context.ts
function pickString(...values) {
  for (let value of values)
    if (typeof value == "string" && value.trim().length > 0)
      return value.trim();
  return "";
}
function normalizeHost(host) {
  return /powerpoint|ppt/i.test(host) ? "PowerPoint" : /excel|spreadsheet/i.test(host) ? "Excel" : /word|document/i.test(host) ? "Word" : host || "Word";
}
function truncate(value, maxLength) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`;
}
function mergeOfficeContext(baseContext, overrideContext) {
  let merged = {
    ...baseContext ?? {},
    ...overrideContext ?? {}
  }, host = normalizeHost(pickString(merged.host) || "Word"), selectedText = pickString(
    merged.selectedText,
    merged.selectionText,
    merged.selection
  ), documentText = pickString(
    merged.documentText,
    merged.fullBody,
    merged.surroundingContent
  );
  return {
    host,
    selectedText,
    documentText,
    selectionPreview: truncate(selectedText, 400),
    documentPreview: truncate(documentText, 1200),
    hasSelection: selectedText.length > 0,
    hasDocument: documentText.length > 0
  };
}
function isHostCompatible(expectedHost, actualHost) {
  let normalizedExpected = normalizeHost(expectedHost).toLowerCase(), normalizedActual = normalizeHost(actualHost).toLowerCase();
  return normalizedExpected === normalizedActual;
}
var init_office_context = __esm({
  "src/tools/office-atoms/shared/office-context.ts"() {
    "use strict";
  }
});

// src/tools/office-atoms/shared/office-skill-tool.ts
import { defineTool as defineTool4 } from "@github/copilot-sdk";
function createOfficeSkillTool(definition, sessionOfficeContext) {
  return defineTool4(definition.name, {
    description: definition.description,
    skipPermission: !0,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The user intent or task to solve in the Office host."
        },
        host: {
          type: "string",
          description: "Optional host override such as Word, Excel, or PowerPoint."
        },
        selectionText: {
          type: "string",
          description: "Optional selection text override when the active selection changed."
        },
        documentText: {
          type: "string",
          description: "Optional document body or surrounding content override."
        },
        includePrompt: {
          type: "boolean",
          description: "When false, omit the full expert prompt from the tool response.",
          default: !0
        }
      },
      required: ["query"]
    },
    handler: async ({ query, host, selectionText, documentText, includePrompt = !0 }) => {
      let officeContext = mergeOfficeContext(sessionOfficeContext, {
        host,
        selectionText,
        documentText
      }), prompt = includePrompt ? await loadPrompt(definition.promptPath) : "";
      return createSuccessToolResult({
        status: "office_skill_ready",
        domain: definition.domain,
        skill: definition.skillName,
        category: definition.category,
        query,
        officeContext: {
          host: officeContext.host,
          hostCompatible: isHostCompatible(definition.recommendedHost, officeContext.host),
          hasSelection: officeContext.hasSelection,
          hasDocument: officeContext.hasDocument,
          selectionPreview: officeContext.selectionPreview,
          documentPreview: officeContext.documentPreview
        },
        recommendedHost: definition.recommendedHost,
        promptAvailable: includePrompt,
        prompt: includePrompt ? prompt : void 0,
        usageHints: definition.usageHints
      });
    }
  });
}
var init_office_skill_tool = __esm({
  "src/tools/office-atoms/shared/office-skill-tool.ts"() {
    "use strict";
    init_prompt_loader();
    init_tool_result();
    init_office_context();
  }
});

// src/tools/office-atoms/office/excel-skill-tool.ts
function createExcelSkillTool(sessionOfficeContext) {
  return createOfficeSkillTool(
    {
      name: "excel_skill",
      description: "Provide the project Excel expert skill so the agent can reason about tables, formulas, pivots, and chart-ready analysis.",
      domain: "excel",
      skillName: "ExcelExpert",
      category: "excel_data",
      recommendedHost: "Excel",
      promptPath: ExcelSkillInvoker.getPromptPath(),
      usageHints: [
        "Use for spreadsheet transformations, formula planning, pivot logic, and analytical summaries.",
        "Pass selectionText with the active range values when you need cell-aware reasoning.",
        "Pair with create_excel_chart when the answer should also materialize as a chart."
      ]
    },
    sessionOfficeContext
  );
}
var init_excel_skill_tool = __esm({
  "src/tools/office-atoms/office/excel-skill-tool.ts"() {
    "use strict";
    init_expert_excel();
    init_office_skill_tool();
  }
});

// src/agents/expert-ppt/domain/ppt-invoker.ts
import path4 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __dirname2, PPTSkillInvoker, init_ppt_invoker = __esm({
  "src/agents/expert-ppt/domain/ppt-invoker.ts"() {
    "use strict";
    init_bridge_client();
    __dirname2 = path4.dirname(fileURLToPath2(import.meta.url)), PPTSkillInvoker = class {
      /**
       * Invoke the PPTExpert skill via the skill bridge HTTP API.
       */
      static async invokePPTExpert(inputPath, outputPath, changes) {
        return invokePPTSkill({
          input_path: inputPath,
          output_path: outputPath,
          slides: changes
        });
      }
      /**
       * Load the expert prompt for PPT design operations.
       */
      static getPromptPath() {
        return path4.join(__dirname2, "..", "prompts", "ppt-master.md");
      }
    };
  }
});

// src/agents/expert-ppt/ppt.tools.ts
var init_ppt_tools = __esm({
  "src/agents/expert-ppt/ppt.tools.ts"() {
    "use strict";
    init_ppt_invoker();
  }
});

// src/agents/expert-ppt/index.ts
import fs2 from "node:fs/promises";
import path5 from "node:path";
async function getCoreInstructions2() {
  let promptPath = path5.join(__currentDir2, "prompts", "ppt-master.md");
  try {
    return await fs2.readFile(promptPath, "utf-8");
  } catch {
    return "";
  }
}
var __currentDir2, init_expert_ppt = __esm({
  "src/agents/expert-ppt/index.ts"() {
    "use strict";
    init_ppt_tools();
    init_ppt_invoker();
    __currentDir2 = path5.resolve(process.cwd(), "src", "agents", "expert-ppt");
  }
});

// src/tools/office-atoms/office/powerpoint-skill-tool.ts
function createPowerPointSkillTool(sessionOfficeContext) {
  return createOfficeSkillTool(
    {
      name: "powerpoint_skill",
      description: "Provide the project PowerPoint expert skill so the agent can generate slide structures, layouts, and presentation-ready content.",
      domain: "powerpoint",
      skillName: "PPT-Master",
      category: "ppt_design",
      recommendedHost: "PowerPoint",
      promptPath: PPTSkillInvoker.getPromptPath(),
      usageHints: [
        "Use for slide outlines, deck narratives, title-body layouts, and presentation design moves.",
        "Pass selectionText when the current slide already contains source text or speaker notes.",
        "Use the returned prompt and context to stay aligned with the project's slide design persona."
      ]
    },
    sessionOfficeContext
  );
}
var init_powerpoint_skill_tool = __esm({
  "src/tools/office-atoms/office/powerpoint-skill-tool.ts"() {
    "use strict";
    init_expert_ppt();
    init_office_skill_tool();
  }
});

// src/agents/expert-word/domain/word-invoker.ts
import path6 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
var __dirname3, WordSkillInvoker, init_word_invoker = __esm({
  "src/agents/expert-word/domain/word-invoker.ts"() {
    "use strict";
    init_bridge_client();
    __dirname3 = path6.dirname(fileURLToPath3(import.meta.url)), WordSkillInvoker = class {
      /**
       * Invoke the WordExpert skill via the skill bridge HTTP API.
       */
      static async invokeWordExpert(inputPath, outputPath, changes) {
        return invokeWordSkill({
          input_path: inputPath,
          output_path: outputPath,
          edits: changes
        });
      }
      /**
       * Load the expert prompt for Word document operations.
       */
      static getPromptPath() {
        return path6.join(__dirname3, "..", "prompts", "word-expert.md");
      }
    };
  }
});

// src/agents/expert-word/word.tools.ts
var init_word_tools = __esm({
  "src/agents/expert-word/word.tools.ts"() {
    "use strict";
    init_word_invoker();
  }
});

// src/agents/expert-word/index.ts
import fs3 from "node:fs/promises";
import path7 from "node:path";
async function getCoreInstructions3() {
  let promptPath = path7.join(__currentDir3, "prompts", "word-expert.md");
  try {
    return await fs3.readFile(promptPath, "utf-8");
  } catch {
    return "";
  }
}
var __currentDir3, init_expert_word = __esm({
  "src/agents/expert-word/index.ts"() {
    "use strict";
    init_word_tools();
    init_word_invoker();
    __currentDir3 = path7.resolve(process.cwd(), "src", "agents", "expert-word");
  }
});

// src/tools/office-atoms/office/word-skill-tool.ts
function createWordSkillTool(sessionOfficeContext) {
  return createOfficeSkillTool(
    {
      name: "word_skill",
      description: "Provide the project Word expert skill so the agent can draft, rewrite, and structure document output for Word.",
      domain: "word",
      skillName: "WordExpert",
      category: "word_creative",
      recommendedHost: "Word",
      promptPath: WordSkillInvoker.getPromptPath(),
      usageHints: [
        "Use for reports, memos, executive summaries, rewriting, and document formatting.",
        "Pass updated selectionText when the active paragraph changed after the request started.",
        "Combine with officeContext to keep tone and structure aligned with the current document."
      ]
    },
    sessionOfficeContext
  );
}
var init_word_skill_tool = __esm({
  "src/tools/office-atoms/office/word-skill-tool.ts"() {
    "use strict";
    init_expert_word();
    init_office_skill_tool();
  }
});

// src/tools/office-atoms/index.ts
function getSessionTools(sessionOfficeContext) {
  return [
    createGoogleSearchTool(),
    createPythonExecutorTool(),
    createExcelChartTool(),
    createWordSkillTool(sessionOfficeContext),
    createExcelSkillTool(sessionOfficeContext),
    createPowerPointSkillTool(sessionOfficeContext)
  ];
}
var init_office_atoms = __esm({
  "src/tools/office-atoms/index.ts"() {
    "use strict";
    init_google_search_tool();
    init_python_executor_tool();
    init_create_excel_chart_tool();
    init_excel_skill_tool();
    init_powerpoint_skill_tool();
    init_word_skill_tool();
  }
});

// src/shared/molecules/ai-core/tool-registry.ts
var init_tool_registry = __esm({
  "src/shared/molecules/ai-core/tool-registry.ts"() {
    "use strict";
    init_office_atoms();
  }
});

// src/shared/molecules/ai-core/pending-input-queue.ts
function settlePendingInput(sessionId, response) {
  let entry = pendingInputs.get(sessionId);
  return entry ? (pendingInputs.delete(sessionId), clearTimeout(entry.timeout), entry.abortCleanup?.(), entry.resolve(response), !0) : !1;
}
function resolveInput(sessionId, answer) {
  return settlePendingInput(sessionId, { answer, wasFreeform: !0 });
}
function waitForUserInput(sessionId, question, onChunk, signal) {
  return logger.info("PendingInput", "Awaiting user input", { sessionId, question }), onChunk && onChunk(`[ASK_USER]:${sessionId}:${question}`), signal?.aborted ? Promise.resolve(USER_INPUT_CANCELLED_RESPONSE) : new Promise((resolve) => {
    if (pendingInputs.size >= MAX_PENDING) {
      let oldest = pendingInputs.keys().next().value;
      typeof oldest == "string" && settlePendingInput(oldest, USER_INPUT_EVICTED_RESPONSE) && logger.warn("PendingInput", "Evicted oldest pending user input", { sessionId: oldest, maxPending: MAX_PENDING });
    }
    let timeout = setTimeout(() => {
      settlePendingInput(sessionId, USER_INPUT_TIMEOUT_RESPONSE) && logger.warn("PendingInput", "Timed out waiting for user input", { sessionId });
    }, CORE_SDK_CONFIG.USER_INPUT_TIMEOUT_MS);
    timeout.unref?.();
    let entry = {
      resolve,
      timeout
    };
    if (signal) {
      let handleAbort = () => {
        settlePendingInput(sessionId, USER_INPUT_CANCELLED_RESPONSE) && logger.info("PendingInput", "Cancelled pending user input on abort", { sessionId });
      };
      signal.addEventListener("abort", handleAbort, { once: !0 }), entry.abortCleanup = () => signal.removeEventListener("abort", handleAbort);
    }
    pendingInputs.set(sessionId, entry);
  });
}
function clearAllPendingInputs() {
  for (let sessionId of Array.from(pendingInputs.keys()))
    settlePendingInput(sessionId, USER_INPUT_CANCELLED_RESPONSE) && logger.info("PendingInput", "Cleared pending user input during global cleanup", { sessionId });
}
function deletePendingInput(sessionId) {
  settlePendingInput(sessionId, USER_INPUT_CANCELLED_RESPONSE) && logger.info("PendingInput", "Cleared pending user input during session cleanup", { sessionId });
}
var MAX_PENDING, pendingInputs, USER_INPUT_TIMEOUT_RESPONSE, USER_INPUT_CANCELLED_RESPONSE, USER_INPUT_EVICTED_RESPONSE, init_pending_input_queue = __esm({
  "src/shared/molecules/ai-core/pending-input-queue.ts"() {
    "use strict";
    init_core_config();
    init_logger();
    MAX_PENDING = 100, pendingInputs = /* @__PURE__ */ new Map(), USER_INPUT_TIMEOUT_RESPONSE = {
      answer: "User did not respond in time.",
      wasFreeform: !0
    }, USER_INPUT_CANCELLED_RESPONSE = {
      answer: "User input request cancelled because the current request ended.",
      wasFreeform: !0
    }, USER_INPUT_EVICTED_RESPONSE = {
      answer: "User input queue full; request evicted.",
      wasFreeform: !0
    };
  }
});

// src/shared/molecules/ai-core/session-lifecycle.ts
import crypto from "crypto";
function mergeSessionTools(sessionOfficeContext, sessionTools) {
  let merged = /* @__PURE__ */ new Map();
  for (let tool of getSessionTools(sessionOfficeContext))
    merged.set(tool.name, tool);
  for (let tool of sessionTools ?? [])
    merged.set(tool.name, tool);
  return Array.from(merged.values());
}
function generateSessionId() {
  return crypto.randomUUID();
}
async function createSession(client, sessionOptions, method, sessionId, onChunk, signal, officeContext) {
  let sessionTimeout, originalPreToolUse = sessionOptions.hooks?.onPreToolUse, originalUserInputRequest = sessionOptions.onUserInputRequest, toolSurface = applyLeastPrivilegeToolSurface(sessionOptions), augmentedOptions = {
    ...sessionOptions,
    clientName: sessionOptions.clientName || "nexus-center-office-addin",
    workingDirectory: sessionOptions.workingDirectory || process.cwd(),
    sessionId,
    ...toolSurface,
    onPermissionRequest: sessionOptions.onPermissionRequest || handleCopilotPermissionRequest,
    tools: mergeSessionTools(officeContext, sessionOptions.tools),
    hooks: {
      ...sessionOptions.hooks,
      onPreToolUse: async (input, invocation) => (onChunk && onChunk(`${CORE_SDK_CONFIG.PROGRESS_FEEDBACK_PREFIX}${input.toolName}${CORE_SDK_CONFIG.PROGRESS_FEEDBACK_SUFFIX}`), originalPreToolUse?.(input, invocation))
    },
    onUserInputRequest: async (request, invocation) => originalUserInputRequest ? originalUserInputRequest(request, invocation) : waitForUserInput(sessionId, request.question, onChunk, signal)
  };
  logger.info("SDKSession", "Creating Copilot SDK session", {
    sessionId,
    method,
    clientName: augmentedOptions.clientName,
    workingDirectory: augmentedOptions.workingDirectory,
    availableTools: augmentedOptions.availableTools,
    model: sessionOptions.model,
    streaming: sessionOptions.streaming
  });
  let sessionTimeoutMs = method === "gemini_cli" ? CORE_SDK_CONFIG.GEMINI_CLIENT_START_TIMEOUT_MS : CORE_SDK_CONFIG.CLIENT_START_TIMEOUT_MS;
  try {
    let session = await Promise.race([
      client.createSession(augmentedOptions),
      new Promise((_, reject) => {
        sessionTimeout = setTimeout(
          () => reject(new Error(`Timeout waiting for Copilot SDK to initialize (JSON-RPC handshake failed after ${Math.round(sessionTimeoutMs / 1e3)}s)`)),
          sessionTimeoutMs
        );
      })
    ]);
    return activeSessions.set(sessionId, {
      session,
      cleanup: () => {
        deletePendingInput(sessionId);
      }
    }), { session, sessionId };
  } finally {
    sessionTimeout && clearTimeout(sessionTimeout);
  }
}
function cleanupSession(sessionId) {
  let sessionData = activeSessions.get(sessionId);
  sessionData && (sessionData.cleanup(), activeSessions.delete(sessionId));
}
async function cleanupAllSessions() {
  logger.info("SDKSession", "Cleaning up all active sessions", { count: activeSessions.size });
  for (let [sessionId, sessionData] of activeSessions.entries()) {
    try {
      sessionData.cleanup(), await sessionData.session.disconnect();
    } catch (e) {
      logger.warn("SDKSession", "Failed during session cleanup", { sessionId, error: e });
    }
    activeSessions.delete(sessionId);
  }
  activeSessions.clear();
}
var activeSessions, init_session_lifecycle = __esm({
  "src/shared/molecules/ai-core/session-lifecycle.ts"() {
    "use strict";
    init_core_config();
    init_permission_policy();
    init_tool_surface_policy();
    init_tool_registry();
    init_pending_input_queue();
    init_logger();
    activeSessions = /* @__PURE__ */ new Map();
  }
});

// src/shared/molecules/ai-core/client-manager.ts
var client_manager_exports = {};
__export(client_manager_exports, {
  ClientManager: () => ClientManager,
  cleanupAllSessions: () => cleanupAllSessions2,
  getOrCreateClient: () => getOrCreateClient,
  removeClient: () => removeClient,
  removeClientByParams: () => removeClientByParams,
  stopAllClients: () => stopAllClients,
  warmUpClient: () => warmUpClient
});
import { CopilotClient } from "@github/copilot-sdk";
var FAILURE_THRESHOLD, RECOVERY_TIMEOUT_MS, ClientManager, getOrCreateClient, stopAllClients, removeClientByParams, removeClient, warmUpClient, cleanupAllSessions2, init_client_manager = __esm({
  "src/shared/molecules/ai-core/client-manager.ts"() {
    "use strict";
    init_core_config();
    init_idle_cleaner();
    init_logger();
    init_session_lifecycle();
    FAILURE_THRESHOLD = 5, RECOVERY_TIMEOUT_MS = 6e4, ClientManager = class _ClientManager {
      static clients = /* @__PURE__ */ new Map();
      static pendingClients = /* @__PURE__ */ new Map();
      // PR-004: Per-key circuit breakers
      static circuitBreakers = /* @__PURE__ */ new Map();
      // PR-004: Global concurrency semaphore — max 10 concurrent Copilot calls
      static MAX_CONCURRENT = 10;
      static activeRequests = 0;
      static semaphoreQueue = [];
      static CLIENT_TTL = 1800 * 1e3;
      // 30 minutes
      static HEALTH_CHECK_INTERVAL = 300 * 1e3;
      // 5 minutes
      static healthCheckTimer;
      // ---------------------------------------------------------------------------
      // PR-004: Semaphore helpers
      // ---------------------------------------------------------------------------
      static async acquireSemaphore() {
        if (_ClientManager.activeRequests < _ClientManager.MAX_CONCURRENT) {
          _ClientManager.activeRequests++;
          return;
        }
        return new Promise((resolve) => {
          _ClientManager.semaphoreQueue.push(resolve);
        });
      }
      static releaseSemaphore() {
        let next = _ClientManager.semaphoreQueue.shift();
        next ? next() : _ClientManager.activeRequests = Math.max(0, _ClientManager.activeRequests - 1);
      }
      // ---------------------------------------------------------------------------
      // PR-004: Circuit breaker helpers
      // ---------------------------------------------------------------------------
      static getBreaker(key) {
        return _ClientManager.circuitBreakers.has(key) || _ClientManager.circuitBreakers.set(key, { state: "CLOSED", failureCount: 0, lastFailureTime: 0 }), _ClientManager.circuitBreakers.get(key);
      }
      static checkBreaker(key) {
        let breaker2 = _ClientManager.getBreaker(key);
        if (breaker2.state === "OPEN") {
          let elapsed = Date.now() - breaker2.lastFailureTime;
          if (elapsed >= RECOVERY_TIMEOUT_MS)
            breaker2.state = "HALF_OPEN", logger.info("ClientManager", "Circuit HALF_OPEN \u2014 attempting recovery probe", { key });
          else
            throw new Error(`Circuit breaker OPEN for ${key}. Retry after ${Math.ceil((RECOVERY_TIMEOUT_MS - elapsed) / 1e3)}s.`);
        }
      }
      static recordSuccess(key) {
        let breaker2 = _ClientManager.getBreaker(key);
        breaker2.failureCount = 0, breaker2.state = "CLOSED";
      }
      static recordFailure(key) {
        let breaker2 = _ClientManager.getBreaker(key);
        breaker2.failureCount++, breaker2.lastFailureTime = Date.now(), (breaker2.state === "HALF_OPEN" || breaker2.failureCount >= FAILURE_THRESHOLD) && (breaker2.state = "OPEN", logger.warn("ClientManager", "Circuit OPEN \u2014 further requests blocked", {
          key,
          failureCount: breaker2.failureCount
        }));
      }
      // ---------------------------------------------------------------------------
      // Existing helpers
      // ---------------------------------------------------------------------------
      static normalizeCacheKeyPart(value) {
        return Array.isArray(value) ? value.map((item) => this.normalizeCacheKeyPart(item)) : !value || typeof value != "object" ? typeof value == "function" ? "[function]" : value : Object.keys(value).sort().reduce((normalized, key) => (normalized[key] = this.normalizeCacheKeyPart(value[key]), normalized), {});
      }
      static buildClientKey(method, options) {
        return `${method}-${JSON.stringify(this.normalizeCacheKeyPart(options))}`;
      }
      /**
       * Get or create a client with connection pooling, circuit breaker, and semaphore.
       */
      static async getClient(method, options) {
        let clientKey = this.buildClientKey(method, options), now = Date.now();
        this.checkBreaker(clientKey);
        let existing = this.clients.get(clientKey);
        if (existing && existing.healthy && now - existing.created < this.CLIENT_TTL)
          return existing.lastUsed = now, IdleCleaner.touch(clientKey), this.recordSuccess(clientKey), existing.client;
        let pendingPromise = this.pendingClients.get(clientKey);
        if (pendingPromise)
          return logger.info("ClientManager", "Waiting for pending client creation", { method }), pendingPromise;
        existing && await this.cleanupClient(clientKey);
        let createClientPromise = (async () => {
          let client, startTimer;
          await _ClientManager.acquireSemaphore();
          try {
            logger.info("ClientManager", "Starting new Copilot client", { method, clientKey });
            let startTimeoutMs = method === "gemini_cli" ? CORE_SDK_CONFIG.GEMINI_CLIENT_START_TIMEOUT_MS : CORE_SDK_CONFIG.CLIENT_START_TIMEOUT_MS;
            client = new CopilotClient(options);
            let startPromise = client.start(), timeoutPromise = new Promise((_, reject) => {
              startTimer = setTimeout(
                () => reject(new Error(`ACP Client Timeout (${method}): Agent failed to start/handshake within ${Math.round(startTimeoutMs / 1e3)}s`)),
                startTimeoutMs
              );
            });
            return await Promise.race([startPromise, timeoutPromise]), this.clients.set(clientKey, {
              client,
              method,
              created: Date.now(),
              lastUsed: Date.now(),
              healthy: !0
            }), IdleCleaner.touch(clientKey), this.healthCheckTimer || (this.startHealthMonitoring(), IdleCleaner.startScanning((key) => this.cleanupClient(key))), _ClientManager.recordSuccess(clientKey), client;
          } catch (error) {
            throw client && await client.stop().catch(() => {
            }), _ClientManager.recordFailure(clientKey), logger.error("ClientManager", "Failed to start Copilot client", { method, clientKey, error }), error;
          } finally {
            startTimer && clearTimeout(startTimer), this.pendingClients.delete(clientKey), _ClientManager.releaseSemaphore();
          }
        })();
        return this.pendingClients.set(clientKey, createClientPromise), createClientPromise;
      }
      static startHealthMonitoring() {
        this.healthCheckTimer = setInterval(async () => {
          await this.performHealthCheck();
        }, this.HEALTH_CHECK_INTERVAL), this.healthCheckTimer.unref();
      }
      static async performHealthCheck() {
        let now = Date.now(), clientsToRemove = [];
        for (let [key, clientInfo] of this.clients.entries()) {
          if (now - clientInfo.created > this.CLIENT_TTL) {
            clientsToRemove.push(key);
            continue;
          }
          try {
            await clientInfo.client.ping(), clientInfo.healthy = !0, this.recordSuccess(key);
          } catch (error) {
            logger.warn("ClientManager", "Client health check failed", { key, method: clientInfo.method, error }), clientInfo.healthy = !1, this.recordFailure(key), now - clientInfo.lastUsed > 6e4 && clientsToRemove.push(key);
          }
        }
        for (let key of clientsToRemove)
          await this.cleanupClient(key);
      }
      static async cleanupClient(key) {
        let clientInfo = this.clients.get(key);
        if (clientInfo) {
          try {
            await clientInfo.client.stop();
          } catch (error) {
            logger.warn("ClientManager", "Failed to stop Copilot client cleanly", {
              key,
              method: clientInfo.method,
              error
            });
          }
          this.clients.delete(key), IdleCleaner.remove(key);
        }
      }
      static async cleanupByParams(method, options) {
        let key = this.buildClientKey(method, options);
        await this.cleanupClient(key);
      }
      static async cleanupAll() {
        this.healthCheckTimer && (clearInterval(this.healthCheckTimer), this.healthCheckTimer = void 0), IdleCleaner.stopScanning();
        let promises = Array.from(this.clients.keys()).map((k) => this.cleanupClient(k));
        await Promise.allSettled(promises);
      }
      /**
       * Warm up a client by creating it without an immediate session.
       * Useful for background connection initialization.
       */
      static async warmUp(method) {
        try {
          logger.info("ClientManager", "Warming up client", { method }), await this.getClient(method, {});
        } catch (error) {
          logger.warn("ClientManager", "Client warm-up failed (non-critical)", { method, error });
        }
      }
    }, getOrCreateClient = ClientManager.getClient.bind(ClientManager), stopAllClients = ClientManager.cleanupAll.bind(ClientManager), removeClientByParams = ClientManager.cleanupByParams.bind(ClientManager), removeClient = ClientManager.cleanupClient.bind(ClientManager), warmUpClient = ClientManager.warmUp.bind(ClientManager), cleanupAllSessions2 = cleanupAllSessions;
  }
});

// src/shared/atoms/ai-core/formatters.ts
function extractResponseText(event) {
  if (!event) return "";
  let e = event, content = e.result?.content || e.data?.content || e.data?.text || e.content;
  return content || (typeof event == "string" ? event : "");
}
async function emitChunks(text, onChunk) {
  let segments = text.split(/([\s,.!?;]+)/);
  for (let segment of segments)
    segment && onChunk(segment), await new Promise((r) => setTimeout(r, 10));
}
var init_formatters = __esm({
  "src/shared/atoms/ai-core/formatters.ts"() {
    "use strict";
  }
});

// src/shared/molecules/ai-core/options/copilot-cli-options.ts
import * as path8 from "node:path";
var projectRoot2, buildCopilotCliOptions, init_copilot_cli_options = __esm({
  "src/shared/molecules/ai-core/options/copilot-cli-options.ts"() {
    "use strict";
    init_env();
    init_permission_policy();
    projectRoot2 = process.cwd(), buildCopilotCliOptions = (cfg) => {
      let modelsToken = cfg.githubToken || env_default.getModelsToken(), apiBase = env_default.COPILOT_API_URL;
      return {
        clientOptions: {
          // Windows: JS files are not executables! Use node.exe explicitly.
          cliPath: process.execPath,
          useStdio: !0,
          cliArgs: [
            "--no-warnings",
            path8.join(projectRoot2, "node_modules/@github/copilot/index.js")
          ],
          env: {
            ...process.env,
            NODE_NO_WARNINGS: "1",
            ...apiBase ? {
              COPILOT_API_URL: apiBase,
              GITHUB_API_URL: apiBase
            } : {},
            GITHUB_MODELS_API_VERSION: env_default.GITHUB_MODELS_API_VERSION,
            GITHUB_TOKEN: modelsToken || process.env.GITHUB_TOKEN,
            GH_TOKEN: modelsToken || process.env.GH_TOKEN
          }
        },
        sessionOptions: {
          model: cfg.model,
          streaming: cfg.streaming,
          onPermissionRequest: handleCopilotPermissionRequest,
          provider: apiBase ? {
            type: "openai",
            baseUrl: apiBase,
            bearerToken: modelsToken || void 0
          } : void 0
        }
      };
    };
  }
});

// src/shared/molecules/ai-core/options/gemini-cli-options.ts
import * as path9 from "node:path";
import * as fs4 from "node:fs";
import * as os from "node:os";
var projectRoot3, buildGeminiCliOptions, init_gemini_cli_options = __esm({
  "src/shared/molecules/ai-core/options/gemini-cli-options.ts"() {
    "use strict";
    init_env();
    init_permission_policy();
    init_logger();
    projectRoot3 = process.cwd(), buildGeminiCliOptions = (cfg) => {
      let wrapperEntry = path9.join(projectRoot3, "src/infra/scripts/gemini-wrapper-v2.js"), availableModels = env_default.AVAILABLE_MODELS_GEMINI.map((modelId) => ({
        id: modelId,
        name: modelId,
        capabilities: {
          supports: {
            vision: !1,
            reasoningEffort: !1
          },
          limits: {
            max_context_window_tokens: 1048576
          }
        }
      }));
      return {
        clientOptions: {
          cliPath: process.execPath,
          useStdio: !0,
          cliArgs: [
            "--no-warnings",
            wrapperEntry
          ],
          env: (() => {
            let { GEMINI_API_KEY: _inherited, ...cleanEnv } = process.env, explicitKey = cfg.geminiKey || env_default.GEMINI_API_KEY || "", cloudAuthEnv = {}, authJson = process.env.GEMINI_CLI_AUTH_JSON;
            if (authJson && !explicitKey)
              try {
                let tempAuthPath = path9.join(os.tmpdir(), "gemini-auth-token.json");
                fs4.writeFileSync(tempAuthPath, authJson), logger.info("GeminiCliOptions", "Injected temporary cloud auth credentials for Gemini CLI", {
                  tempAuthPath
                }), cloudAuthEnv = {
                  GOOGLE_APPLICATION_CREDENTIALS: tempAuthPath,
                  // Force the CLI to use this path instead of ~/.gemini/auth
                  GEMINI_AUTH_PATH: tempAuthPath
                };
              } catch (e) {
                logger.error("GeminiCliOptions", "Failed to write temporary cloud auth credentials", {
                  error: e
                });
              }
            return {
              ...cleanEnv,
              ...cloudAuthEnv,
              NODE_NO_WARNINGS: process.env.NODE_NO_WARNINGS || "1",
              ...explicitKey ? { GEMINI_API_KEY: explicitKey } : {}
            };
          })(),
          onListModels: async () => availableModels
        },
        sessionOptions: {
          streaming: !!cfg.streaming,
          // Default to gemini-2.5-flash as defined in our ModelManager
          model: cfg.model || "gemini-2.5-flash",
          onPermissionRequest: handleCopilotPermissionRequest
        }
      };
    };
  }
});

// src/shared/molecules/ai-core/options/azure-byok-options.ts
import * as path10 from "node:path";
var projectRoot4, buildAzureByokOptions, init_azure_byok_options = __esm({
  "src/shared/molecules/ai-core/options/azure-byok-options.ts"() {
    "use strict";
    init_env();
    init_permission_policy();
    init_core_config();
    projectRoot4 = process.cwd(), buildAzureByokOptions = (cfg) => {
      let azureKey = cfg.azure?.apiKey || env_default.AZURE_OPENAI_API_KEY, azureEndpoint = cfg.azure?.endpoint || env_default.AZURE_OPENAI_ENDPOINT, azureDeployment = cfg.azure?.deployment || env_default.AZURE_OPENAI_DEPLOYMENT, provider = {
        type: "azure",
        baseUrl: azureEndpoint || "",
        apiKey: azureKey || void 0,
        azure: { apiVersion: CORE_SDK_CONFIG.AZURE_API_VERSION }
      };
      return {
        clientOptions: {
          // Windows: JS files are not executables! Use node.exe explicitly.
          cliPath: process.execPath,
          useStdio: !0,
          cliArgs: [
            path10.join(projectRoot4, "src/infra/scripts/core/acp-adaptive-shim.cjs"),
            path10.join(projectRoot4, "node_modules/@github/copilot/index.js")
          ]
        },
        sessionOptions: {
          model: azureDeployment || cfg.model,
          streaming: cfg.streaming,
          provider,
          onPermissionRequest: handleCopilotPermissionRequest
        }
      };
    };
  }
});

// src/shared/molecules/ai-core/options/remote-cli-options.ts
var buildRemoteCliOptions, init_remote_cli_options = __esm({
  "src/shared/molecules/ai-core/options/remote-cli-options.ts"() {
    "use strict";
    init_core_config();
    init_permission_policy();
    buildRemoteCliOptions = (cfg) => ({
      clientOptions: {
        cliUrl: `localhost:${cfg.remotePort || CORE_SDK_CONFIG.DEFAULT_REMOTE_PORT}`,
        cliPath: "copilot"
      },
      sessionOptions: {
        model: cfg.model,
        streaming: cfg.streaming,
        onPermissionRequest: handleCopilotPermissionRequest
      }
    });
  }
});

// src/shared/molecules/ai-core/option-resolver.ts
function resolveMethodFromContext(modelName, azureInfo, _isExplicitCli = !1) {
  if (modelName.toLowerCase().includes("gemini")) return "gemini_cli";
  let hasAzureKey = !!(azureInfo?.apiKey || env_default.AZURE_OPENAI_API_KEY), hasRemotePort = !!env_default.COPILOT_AGENT_PORT;
  return hasAzureKey ? "azure_byok" : hasRemotePort ? "remote_cli" : "copilot_cli";
}
function resolveACPOptions(cfg) {
  switch (cfg.method) {
    case "gemini_cli":
      return buildGeminiCliOptions(cfg);
    case "copilot_cli":
      return buildCopilotCliOptions(cfg);
    case "azure_byok":
      return buildAzureByokOptions(cfg);
    case "remote_cli":
      return buildRemoteCliOptions(cfg);
    default:
      throw new Error(`Unknown ACP connection method: ${cfg.method}`);
  }
}
var init_option_resolver = __esm({
  "src/shared/molecules/ai-core/option-resolver.ts"() {
    "use strict";
    init_env();
    init_copilot_cli_options();
    init_gemini_cli_options();
    init_azure_byok_options();
    init_remote_cli_options();
  }
});

// src/agents/skills/atoms/intent-classifier.ts
function keywordClassify(query) {
  let q = query.toLowerCase();
  for (let rule of KEYWORD_RULES)
    if (rule.keywords.some((kw) => q.includes(kw)))
      return rule.label;
  return "vector_search";
}
async function classifyIntent(query, options) {
  let { token, timeoutMs = 5e3 } = options ?? {};
  if (!token)
    return keywordClassify(query);
  try {
    let fetchFn = (await import("node-fetch")).default, controller = new AbortController(), tid = setTimeout(() => controller.abort(), timeoutMs), response = await fetchFn("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: CLASSIFIER_SYSTEM_PROMPT },
          { role: "user", content: query }
        ],
        max_tokens: 16,
        temperature: 0
      }),
      signal: controller.signal
    });
    if (clearTimeout(tid), !response.ok)
      throw new Error(`HTTP ${response.status}`);
    let raw = (await response.json()).choices?.[0]?.message?.content?.trim().replace(/^"|"$/g, "") ?? "", VALID_LABELS = [
      "galaxy_graph",
      "vision",
      "dev_sync",
      "ppt",
      "excel",
      "word",
      "cross_app",
      "vector_search",
      "recap",
      "insight"
    ], label = raw;
    if (VALID_LABELS.includes(label))
      return label;
  } catch {
  }
  return keywordClassify(query);
}
var KEYWORD_RULES, CLASSIFIER_SYSTEM_PROMPT, init_intent_classifier = __esm({
  "src/agents/skills/atoms/intent-classifier.ts"() {
    "use strict";
    KEYWORD_RULES = [
      { keywords: ["related to", "impact", "connection", "dependency", "what breaks"], label: "galaxy_graph" },
      { keywords: ["diagram", "flowchart", "screenshot", "architecture diagram"], label: "vision" },
      { keywords: ["github", "issue", "pull request", " pr ", "progress report"], label: "dev_sync" },
      { keywords: ["ppt", "slide", "presentation", "deck", "powerpoint"], label: "ppt" },
      { keywords: ["excel", "sheet", "spreadsheet", "formula", "pivot", "cell range"], label: "excel" },
      { keywords: ["data", "report", "table", "chart", "rows", "columns"], label: "excel" },
      { keywords: ["word", "document", "write", "memo", "report writing", "paragraph"], label: "word" },
      { keywords: ["sync", "export to", "from excel", "to ppt", "to word", "bridge", "cross-app", "transfer"], label: "cross_app" },
      { keywords: ["recap", "summarize", "summary", "what did we do", "\u7E3D\u7D50", "\u6458\u8981", "\u525B\u624D", "what changed", "milestone"], label: "recap" },
      { keywords: ["insight", "analyse", "analyze", "what is the status", "document status", "\u6D1E\u5BDF", "\u5206\u6790", "zenith insight", "current state"], label: "insight" }
    ];
    CLASSIFIER_SYSTEM_PROMPT = `You are an intent classification engine for the Nexus Office Add-in.
Given a user query, output ONLY one of these JSON labels (no explanation, no markdown, no extra text):
"galaxy_graph" | "vision" | "dev_sync" | "ppt" | "excel" | "word" | "cross_app" | "vector_search" | "recap" | "insight"

Label definitions:
- galaxy_graph: relationship/impact/dependency analysis
- vision: image, diagram, screenshot, or visual interpretation
- dev_sync: GitHub issues, pull requests, or project progress
- ppt: PowerPoint slides, presentations, decks
- excel: Excel spreadsheets, formulas, data tables, charts
- word: Word documents, memos, writing, document editing
- cross_app: syncing or transferring data across Office applications
- recap: summarizing past actions in this session, what changed, milestone review
- insight: analysing current document/spreadsheet state, data insights, document health
- vector_search: general questions, documentation lookup, anything else`;
  }
});

// src/agents/skills/atoms/brand-extractor.ts
function isNeutral(hex) {
  let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16), max = Math.max(r, g, b), min = Math.min(r, g, b);
  return (max === 0 ? 0 : (max - min) / max) < 0.15 || max < 30 || min > 220;
}
function normaliseHex(raw) {
  let h = raw.replace("#", "");
  return h.length === 3 ? `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}` : `#${h.toLowerCase()}`;
}
function extractHexColors(text) {
  return (text.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) ?? []).map(normaliseHex);
}
function parseThemeColor(html) {
  let m = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i) ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i);
  return m ? m[1].trim() : null;
}
function topColors(colors, n) {
  let freq = /* @__PURE__ */ new Map();
  for (let c of colors)
    isNeutral(c) || freq.set(c, (freq.get(c) ?? 0) + 1);
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([c]) => c);
}
function contrastText(bg) {
  let r = parseInt(bg.slice(1, 3), 16), g = parseInt(bg.slice(3, 5), 16), b = parseInt(bg.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "#1e293b" : "#f8fafc";
}
async function extractBrandTokens(url) {
  if (!url.startsWith("https://"))
    return { ok: !1, error: "Only HTTPS URLs are supported for brand extraction." };
  logger.info(TAG2, `Extracting brand tokens from ${url}`);
  let html;
  try {
    let controller = new AbortController(), timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS), res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "NexusBrandExtractor/1.0 (brand-color-analysis; non-indexing)",
        Accept: "text/html"
      }
    });
    if (clearTimeout(timer), !res.ok)
      return { ok: !1, error: `HTTP ${res.status} from ${url}` };
    html = await res.text();
  } catch (err) {
    let message = err instanceof Error ? err.message : String(err);
    return logger.warn(TAG2, `Fetch failed for ${url}`, { error: message }), { ok: !1, error: `Fetch failed: ${message}` };
  }
  let themeColor = parseThemeColor(html), styleContent = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) ?? []).join(" ") + (html.match(/style=["'][^"']*["']/gi) ?? []).join(" "), allColors = extractHexColors(styleContent);
  themeColor && /^#/.test(themeColor) && allColors.unshift(normaliseHex(themeColor));
  let top = topColors(allColors, 5), primary = top[0] ?? "#2563eb", secondary = top[1] ?? "#1d4ed8", accent = top[2] ?? "#8b5cf6", background = "#ffffff", text = contrastText(background), cssBlock = [
    "/* Brand Intelligence ??extracted by Nexus BrandExtractor */",
    ":root {",
    `  --brand-extracted-primary:    ${primary};`,
    `  --brand-extracted-secondary:  ${secondary};`,
    `  --brand-extracted-accent:     ${accent};`,
    `  --brand-extracted-background: ${background};`,
    `  --brand-extracted-text:       ${text};`,
    "}"
  ].join(`
`);
  return logger.info(TAG2, "Brand tokens extracted", { primary, secondary, accent, colorCandidates: top.length }), {
    ok: !0,
    tokens: { primary, secondary, accent, background, text, cssBlock, sourceUrl: url }
  };
}
var TAG2, FETCH_TIMEOUT_MS, init_brand_extractor = __esm({
  "src/agents/skills/atoms/brand-extractor.ts"() {
    "use strict";
    init_logger();
    TAG2 = "BrandExtractor", FETCH_TIMEOUT_MS = 6e3;
  }
});

// src/agents/router-agent/index.ts
var TAG3, RouterAgent, init_router_agent = __esm({
  "src/agents/router-agent/index.ts"() {
    "use strict";
    init_intent_classifier();
    init_brand_extractor();
    init_logger();
    TAG3 = "RouterAgent", RouterAgent = class {
      /**
       * Analyzes the query and determines if it needs one or more experts.
       */
      static async analyzeIntent(query, context) {
        let traceId = context.traceId ?? "unknown", log = logger.withTrace(traceId), brandMatch = query.match(/^brand:\s*(https:\/\/\S+)/i);
        if (brandMatch) {
          log.info(TAG3, "Brand URL detected, routing to BrandExtractor.");
          let result = await extractBrandTokens(brandMatch[1]);
          return {
            status: "brand_tokens_extracted",
            intent: "vision",
            traceId,
            domains: ["shared"],
            payload: result
          };
        }
        let needsExcel = /excel|spreadsheet|sheet|formula|pivot|cell range|table data/i.test(query), needsPPT = /ppt|powerpoint|slide|presentation|deck/i.test(query), needsWord = /word|document|memo|write|paragraph|report/i.test(query), domains = [];
        needsExcel && domains.push("expert-excel"), needsPPT && domains.push("expert-ppt"), needsWord && domains.push("expert-word");
        let intent = await classifyIntent(query, { token: context.token });
        if (log.info(TAG3, `Query classified as [${intent}]`), domains.length === 0)
          switch (intent) {
            case "excel":
              domains.push("expert-excel");
              break;
            case "word":
              domains.push("expert-word");
              break;
            case "ppt":
              domains.push("expert-ppt");
              break;
            default:
              domains.push("shared");
              break;
          }
        return intent === "cross_app" && !domains.includes("shared") && domains.push("shared"), log.info(TAG3, `Assigned domains [${domains.join(", ")}] for intent [${intent}]`), {
          status: "routed",
          intent,
          domains,
          traceId
        };
      }
    };
  }
});

// src/agents/skills/molecules/design-reviewer.ts
function scoreInformationArchitecture(output, domain) {
  let issues = [], score = 25;
  return domain === "ppt" && (/title|heading|h[1-3]/i.test(output) || (issues.push("No clear heading or title hierarchy detected ??slides need a visual anchor."), score -= 10), (output.match(/slide/gi) ?? []).length < 2 && (issues.push("Response should reference multiple slides to establish narrative flow."), score -= 5), /lorem ipsum/i.test(output) && (issues.push("Placeholder text detected ??replace with audience-relevant content."), score -= 10)), domain === "word" && (/section|chapter|heading|## /i.test(output) || (issues.push("Document lacks visible structural sections. Add headings to guide the reader."), score -= 10), output.split(`
`).filter((l) => l.trim()).length < 5 && (issues.push("Document is too brief ??a structured document should have at least 5 non-empty paragraphs."), score -= 8)), { name: "Information Architecture", score: Math.max(0, score), maxScore: 25, issues };
}
function scoreVisualPoetry(output, domain) {
  let issues = [], score = 20;
  return domain === "ppt" && (/whitespace|margin|padding|negative.?space|blank/i.test(output) || (issues.push("No mention of whitespace or breathing room ??slides feel crowded without it."), score -= 8), /color|palette|hsl\(|rgb\(|#[0-9a-f]{3,6}/i.test(output) || (issues.push("No color specification found ??define a purposeful 2?? color palette."), score -= 6), /font|typeface|sans.?serif|serif/i.test(output) || (issues.push("Typography not addressed ??specify font family and size hierarchy."), score -= 6)), domain === "word" && (/bold|italic|emphasis|highlight/i.test(output) || (issues.push("No typographic emphasis used ??use bold/italic to create visual rhythm in body text."), score -= 6)), { name: "Visual Poetry", score: Math.max(0, score), maxScore: 20, issues };
}
function scoreEmotionalResonance(output, domain) {
  let issues = [], score = 20;
  return /I cannot|I don't know|I'm unable|I'm not able/i.test(output) && (issues.push("Refusal language detected ??rewrite with a concrete, actionable response."), score -= 15), domain === "ppt" && (output.toLowerCase().split(" ").length < 80 && (issues.push("Slide content is too sparse ??include supporting context that builds the audience's emotional journey."), score -= 8), /problem|solution|opportunity|challenge|result|outcome/i.test(output) || (issues.push("No narrative tension detected ??include Problem/Opportunity ??Action ??Outcome arc."), score -= 7)), { name: "Emotional Resonance", score: Math.max(0, score), maxScore: 20, issues };
}
function scoreUsabilityLegibility(output, domain) {
  let issues = [], score = 20;
  if (domain === "ppt") {
    let fontMatches = output.match(/\d+\s*pt/gi) ?? [];
    for (let m of fontMatches)
      if (parseInt(m, 10) < 18) {
        issues.push(`Font size ${m} is below 18pt ??violates WCAG readability for projected slides.`), score -= 8;
        break;
      }
    let bulletLines = (output.match(/[-*?�]\s/g) ?? []).length;
    bulletLines > 6 && (issues.push(`${bulletLines} bullet points detected ??reduce to ?? lines per slide for cognitive clarity.`), score -= 6);
  }
  if (domain === "word") {
    /line.?height|leading/i.test(output);
    let sentenceCount = (output.match(/[.!?]/g) ?? []).length;
    sentenceCount > 0 && output.length / sentenceCount > 220 && (issues.push("Average sentence is very long ??aim for ??5 words per sentence for readability."), score -= 5);
  }
  return { name: "Usability & Legibility", score: Math.max(0, score), maxScore: 20, issues };
}
function scoreBrandConsistency(output, _domain) {
  let issues = [], score = 15, colorCount = new Set(
    output.match(/#[0-9a-fA-F]{3,6}|hsl\([^)]+\)|rgb\([^)]+\)|--color-[a-z-]+/g) ?? []
  ).size;
  colorCount > 6 && (issues.push(`${colorCount} distinct color values found ??constrain to a 3-color palette for brand consistency.`), score -= 8);
  let fontFamilyMatches = new Set(
    (output.match(/font-family:\s*[^;,\n]+/gi) ?? []).map((f) => f.toLowerCase())
  ).size;
  return fontFamilyMatches > 2 && (issues.push(`${fontFamilyMatches} typefaces found ??limit to 2 (one sans-serif headline, one body).`), score -= 7), { name: "Brand Consistency", score: Math.max(0, score), maxScore: 15, issues };
}
function reviewDesign(output, domain) {
  let ia = scoreInformationArchitecture(output, domain), vp = scoreVisualPoetry(output, domain), er = scoreEmotionalResonance(output, domain), ul = scoreUsabilityLegibility(output, domain), bc = scoreBrandConsistency(output, domain), dimensions = [ia, vp, er, ul, bc], totalScore = dimensions.reduce((sum, d) => sum + d.score, 0), passed = totalScore >= 70, sorted = [...dimensions].sort((a, b) => a.score / a.maxScore - b.score / b.maxScore), allIssues = sorted.flatMap((d) => d.issues), worstDimension = sorted[0], refinementHint = allIssues.length > 0 ? `Design review failed (${totalScore}/100). Weakest dimension: "${worstDimension.name}" (${worstDimension.score}/${worstDimension.maxScore}). Top issues: ${allIssues.slice(0, 3).join(" | ")}` : `Design review passed (${totalScore}/100). No major issues.`;
  return logger.info(TAG4, "Review complete", { domain, totalScore, passed, dimensionScores: dimensions.map((d) => `${d.name}:${d.score}/${d.maxScore}`) }), { totalScore, passed, dimensions, allIssues, refinementHint };
}
var TAG4, init_design_reviewer = __esm({
  "src/agents/skills/molecules/design-reviewer.ts"() {
    "use strict";
    init_logger();
    TAG4 = "DesignReviewer";
  }
});

// src/agents/skills/molecules/self-corrector.ts
async function selfCorrect(generate, prompt, opts) {
  let { domain, traceId, threshold = 70 } = opts, log = traceId ? logger.withTrace(traceId) : logger, firstContent = await generate(prompt), firstReview = reviewDesign(firstContent, domain), firstScore = firstReview.totalScore;
  if (log.info(TAG5, "First-pass review", {
    domain,
    score: firstScore,
    passed: firstReview.passed,
    issues: firstReview.allIssues.length
  }), firstReview.passed)
    return { content: firstContent, review: firstReview, healed: !1, firstPassScore: firstScore };
  log.warn(TAG5, `Score ${firstScore} < ${threshold} ??triggering second pass`, { domain, traceId });
  let refinementPrompt = buildRefinementPrompt(prompt, firstReview), secondContent = await generate(refinementPrompt), secondReview = reviewDesign(secondContent, domain);
  return log.info(TAG5, "Second-pass review", {
    domain,
    score: secondReview.totalScore,
    passed: secondReview.passed,
    delta: secondReview.totalScore - firstScore
  }), {
    content: secondContent,
    review: secondReview,
    healed: !0,
    firstPassScore: firstScore
  };
}
function buildRefinementPrompt(originalPrompt, review) {
  let issueList = review.allIssues.slice(0, 5).map((issue, i) => `  ${i + 1}. ${issue}`).join(`
`);
  return `${originalPrompt}

[SELF-CORRECTION DIRECTIVE ??INTERNAL USE]
The previous output scored ${review.totalScore}/100 and did not meet the 70-point quality gate.
Identified issues:
${issueList}

Refinement hint: ${review.refinementHint}

Please regenerate the output addressing ALL issues above. Do NOT mention this directive to the user.`;
}
var TAG5, init_self_corrector = __esm({
  "src/agents/skills/molecules/self-corrector.ts"() {
    "use strict";
    init_design_reviewer();
    init_logger();
    TAG5 = "SelfCorrector";
  }
});

// src/agents/qa-reviewer/index.ts
var TAG6, QAReviewerAgent, init_qa_reviewer = __esm({
  "src/agents/qa-reviewer/index.ts"() {
    "use strict";
    init_design_reviewer();
    init_self_corrector();
    init_logger();
    TAG6 = "QAReviewerAgent", QAReviewerAgent = class {
      /**
       * Main entry point for the QA Reviewer Agent.
       * Uses self-correction logic to ensure the generated output passes the threshold.
       *
       * @param generate - Async function that accepts a prompt and returns raw content.
       * @param prompt   - Initial prompt string.
       * @param opts     - Domain, traceId, and optional threshold override.
       */
      static async enforceQuality(generate, prompt, opts) {
        let { domain, traceId } = opts, log = traceId ? logger.withTrace(traceId) : logger;
        log.info(TAG6, `QA Reviewer activated for domain [${domain}]`);
        let result = await selfCorrect(generate, prompt, opts);
        return result.healed ? log.warn(TAG6, `QA Reviewer intervened and successfully healed output for domain [${domain}]`) : log.info(TAG6, `QA Reviewer approved first-pass output for domain [${domain}]`), result;
      }
      /**
       * Standalone review for external auditing.
       */
      static evaluateOutput(content, domain) {
        return reviewDesign(content, domain);
      }
    };
  }
});

// src/orchestrator/state-manager.ts
import { randomUUID as randomUUID2 } from "node:crypto";
var TAG7, DEFAULT_TTL_MS, StateManager, globalStateManager, init_state_manager = __esm({
  "src/orchestrator/state-manager.ts"() {
    "use strict";
    init_logger();
    TAG7 = "StateManager", DEFAULT_TTL_MS = 7200 * 1e3, StateManager = class {
      states = /* @__PURE__ */ new Map();
      cleanupTimer = null;
      constructor() {
        this.startCleanupTimer();
      }
      startCleanupTimer() {
        this.cleanupTimer = setInterval(
          () => {
            this.cleanupExpiredStates();
          },
          1800 * 1e3
        ), this.cleanupTimer.unref();
      }
      cleanupExpiredStates() {
        let now = Date.now(), count = 0;
        for (let [sessionId, state] of this.states.entries())
          now - state.lastAccessed > DEFAULT_TTL_MS && (this.states.delete(sessionId), count++);
        count > 0 && logger.info(TAG7, `Cleaned up ${count} expired agent states.`);
      }
      createState(sessionId, initialContext = {}) {
        let state = {
          sessionId,
          context: initialContext,
          history: [],
          status: "idle",
          lastAccessed: Date.now()
        };
        return this.states.set(sessionId, state), state;
      }
      getState(sessionId) {
        let state = this.states.get(sessionId);
        return state && (state.lastAccessed = Date.now()), state;
      }
      updateState(sessionId, updates) {
        let state = this.states.get(sessionId);
        if (!state) throw new Error(`State not found for session ${sessionId}`);
        return Object.assign(state, updates), state.lastAccessed = Date.now(), state;
      }
      recordAction(sessionId, action) {
        let state = this.states.get(sessionId);
        if (!state) throw new Error(`State not found for session ${sessionId}`);
        let newAction = {
          id: randomUUID2(),
          timestamp: Date.now(),
          ...action
        };
        return state.history.push(newAction), state.lastAccessed = Date.now(), newAction;
      }
      clearState(sessionId) {
        this.states.delete(sessionId);
      }
    }, globalStateManager = new StateManager();
  }
});

// src/shared/event-bus/index.ts
var EventBus, eventBus, init_event_bus = __esm({
  "src/shared/event-bus/index.ts"() {
    "use strict";
    init_logger();
    EventBus = class {
      handlers = /* @__PURE__ */ new Map();
      /**
       * Subscribe to an event.
       */
      on(event, handler) {
        this.handlers.has(event) || this.handlers.set(event, /* @__PURE__ */ new Set()), this.handlers.get(event).add(handler);
      }
      /**
       * Unsubscribe from an event.
       */
      off(event, handler) {
        let set = this.handlers.get(event);
        set && set.delete(handler);
      }
      /**
       * Emit an event.
       */
      async emit(event, data) {
        let set = this.handlers.get(event);
        if (!set) return;
        let promises = Array.from(set).map(async (handler) => {
          try {
            await handler(data);
          } catch (err) {
            logger.error("EventBus", `Error in handler for event [${event}]`, err);
          }
        });
        await Promise.allSettled(promises);
      }
    }, eventBus = new EventBus();
  }
});

// src/shared/molecules/ai-core/adaptive-watchdog.ts
var samples, AdaptiveWatchdog, init_adaptive_watchdog = __esm({
  "src/shared/molecules/ai-core/adaptive-watchdog.ts"() {
    "use strict";
    samples = /* @__PURE__ */ new Map(), AdaptiveWatchdog = {
      recordLatency(model, latencyMs) {
        let modelSamples = samples.get(model);
        modelSamples || (modelSamples = [], samples.set(model, modelSamples)), modelSamples.push(latencyMs), modelSamples.length > 100 && modelSamples.shift();
      },
      getTimeout(model) {
        let stats = this.getStats(model);
        if (stats.count < 3) return 3e5;
        let computed = Math.round(stats.p95 * 2);
        return Math.min(Math.max(computed, 3e4), 6e5);
      },
      getStats(model) {
        let modelSamples = samples.get(model);
        if (!modelSamples || modelSamples.length === 0)
          return { count: 0, p50: 0, p95: 0, p99: 0, lastUpdated: 0 };
        let sorted = [...modelSamples].sort((a, b) => a - b), len = sorted.length, idx = (pct) => Math.min(Math.floor(len * pct), len - 1);
        return {
          count: len,
          p50: sorted[idx(0.5)],
          p95: sorted[idx(0.95)],
          p99: sorted[idx(0.99)],
          lastUpdated: Date.now()
        };
      },
      reset() {
        samples.clear();
      }
    };
  }
});

// src/shared/molecules/ai-core/sdk-turn-orchestrator.ts
import crypto2 from "node:crypto";
var SdkTurnOrchestrator, init_sdk_turn_orchestrator = __esm({
  "src/shared/molecules/ai-core/sdk-turn-orchestrator.ts"() {
    "use strict";
    init_core_config();
    init_formatters();
    init_option_resolver();
    init_client_manager();
    init_session_lifecycle();
    init_adaptive_watchdog();
    init_nexus_socket();
    init_system_state_store();
    init_logger();
    SdkTurnOrchestrator = class {
      static async executeTurn(prompt, modelName, method, acpConfig, onChunk, signal) {
        let { clientOptions, sessionOptions } = resolveACPOptions(acpConfig), client = await getOrCreateClient(method, clientOptions), sessionId = generateSessionId(), originalOnEvent = sessionOptions.onEvent, augmentedOptions = {
          ...sessionOptions,
          onEvent: (event) => {
            try {
              originalOnEvent?.(event);
            } catch (originalHandlerError) {
              logger.warn("SdkTurn", "Original session onEvent handler threw", {
                sessionId,
                eventType: event.type,
                error: originalHandlerError
              });
            }
            event.type === "session.error" && logger.error("SdkTurn", "Received session error event during turn setup", {
              sessionId,
              eventType: event.type,
              data: event.data
            });
          }
        }, { session } = await createSession(
          client,
          augmentedOptions,
          method,
          sessionId,
          onChunk,
          signal,
          acpConfig.officeContext
        ), turnId = crypto2.randomUUID();
        return new Promise((resolve, reject) => {
          let fullContent = "", finished = !1, INACTIVITY_MS = AdaptiveWatchdog.getTimeout(modelName), inactivityWatcher = null, turnStartTime = performance.now(), unsubscribeHandlers = [], onAbort = () => {
            finish(new DOMException("The operation was aborted", "AbortError"));
          };
          signal && signal.addEventListener("abort", onAbort);
          let globalTimeout = setTimeout(() => {
            finish(new Error(`[Fatal Timeout] AI Response time exceeded ${CORE_SDK_CONFIG.GEN_TIMEOUT_MS / 1e3}s`));
          }, CORE_SDK_CONFIG.GEN_TIMEOUT_MS), ping = () => {
            inactivityWatcher && clearTimeout(inactivityWatcher), inactivityWatcher = setTimeout(() => {
              logger.warn("SdkTurn", "Watchdog finished idle session", {
                sessionId,
                inactivityMs: INACTIVITY_MS,
                model: modelName
              }), finish();
            }, INACTIVITY_MS);
          }, finish = (err) => {
            if (finished) return;
            for (finished = !0, signal && signal.removeEventListener("abort", onAbort), inactivityWatcher && clearTimeout(inactivityWatcher), clearTimeout(globalTimeout); unsubscribeHandlers.length > 0; ) {
              let unsubscribe = unsubscribeHandlers.pop();
              try {
                unsubscribe?.();
              } catch (unsubscribeError) {
                logger.warn("SdkTurn", "Failed to unsubscribe session listener", {
                  sessionId,
                  error: unsubscribeError
                });
              }
            }
            let latencyMs = Math.round(performance.now() - turnStartTime);
            err || (AdaptiveWatchdog.recordLatency(modelName, latencyMs), NexusSocketRelay.broadcast("TELEMETRY_LATENCY", {
              ms: latencyMs,
              model: modelName,
              turnId,
              phase: "turn"
            })), GlobalSystemState.update({ isStreaming: !1 }), NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", GlobalSystemState.getState()), cleanupSession(sessionId), session.disconnect().catch((disconnectError) => {
              logger.warn("SdkTurn", "Failed to disconnect session cleanly", {
                sessionId,
                error: disconnectError
              });
            }), err ? reject(err) : resolve(fullContent.trim() || extractResponseText({}));
          };
          unsubscribeHandlers.push(
            ...this.wireSessionEvents(session, sessionId, modelName, turnStartTime, turnId, (delta) => {
              fullContent += delta, onChunk && onChunk(delta), ping();
            }, (isReasoning) => {
              isReasoning && ping();
            }, () => ping())
          ), unsubscribeHandlers.push(session.on("session.idle", () => {
            fullContent.length > 0 && setTimeout(() => finish(), 1e3);
          })), unsubscribeHandlers.push(session.on("session.error", (event) => {
            let errorEvent = event, errMsg = errorEvent.data?.message || errorEvent.message || String(event);
            errMsg.includes("60000ms") && (errMsg.includes("session.idle") || errMsg.includes("idle")) || finish(new Error(errMsg));
          })), ping(), NexusSocketRelay.broadcast("TELEMETRY_LATENCY", {
            ms: 0,
            model: modelName,
            turnId,
            phase: "turn-start"
          }), session.send({ prompt }).catch((err) => finish(err));
        });
      }
      static wireSessionEvents(session, _sessionId, modelName, startTime, turnId, onDelta, onReasoning, onPing) {
        let ttftRecorded = !1, unsubscribeHandlers = [];
        return unsubscribeHandlers.push(session.on("assistant.message_delta", (event) => {
          let delta = event.data?.deltaContent || event.data?.content || "";
          if (delta) {
            if (!ttftRecorded) {
              let ttftMs = Math.round(performance.now() - startTime);
              NexusSocketRelay.broadcast("TELEMETRY_LATENCY", {
                ms: ttftMs,
                ttftMs,
                model: modelName,
                turnId,
                phase: "ttft"
              }), ttftRecorded = !0;
            }
            onDelta(delta);
          }
        })), unsubscribeHandlers.push(session.on("assistant.reasoning_delta", (event) => {
          let delta = event.data?.deltaContent || event.data?.content || "";
          delta && (onDelta(`[THOUGHT]: ${delta}`), onReasoning(!0));
        })), unsubscribeHandlers.push(session.on("assistant.message", (event) => {
          event.data?.content && onDelta("");
        })), unsubscribeHandlers.push(session.on("tool.execution_start", () => onPing())), unsubscribeHandlers;
      }
    };
  }
});

// src/shared/molecules/ai-core/sdk-retry-engine.ts
var CircuitBreaker, breaker, SdkRetryEngine, init_sdk_retry_engine = __esm({
  "src/shared/molecules/ai-core/sdk-retry-engine.ts"() {
    "use strict";
    init_core_config();
    init_option_resolver();
    init_logger();
    CircuitBreaker = class {
      state = 0 /* CLOSED */;
      failureCount = 0;
      lastFailureTime = 0;
      threshold = 5;
      resetTimeout = 6e4;
      // 60 seconds
      canExecute() {
        return this.state === 0 /* CLOSED */ ? !0 : this.state === 1 /* OPEN */ ? Date.now() - this.lastFailureTime > this.resetTimeout ? (this.state = 2 /* HALF_OPEN */, !0) : !1 : !0;
      }
      recordSuccess() {
        this.failureCount = 0, this.state = 0 /* CLOSED */;
      }
      recordFailure() {
        this.failureCount++, this.lastFailureTime = Date.now(), this.failureCount >= this.threshold && (this.state = 1 /* OPEN */, logger.error("CircuitBreaker", "Circuit opened due to repeated failures"));
      }
    }, breaker = new CircuitBreaker(), SdkRetryEngine = class {
      static async executeWithRetry(operation, method, acpConfig, onChunk) {
        if (!breaker.canExecute()) {
          let circuitError = "[CircuitBreaker] \u7CFB\u7D71\u76EE\u524D\u5075\u6E2C\u5230\u6301\u7E8C\u6027\u7684\u9023\u7DDA\u932F\u8AA4\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002";
          return onChunk && onChunk(circuitError), circuitError;
        }
        let retryCount = 0, maxRetries = CORE_SDK_CONFIG.MAX_SDK_RETRIES;
        for (; retryCount <= maxRetries; )
          try {
            let result = await operation();
            return breaker.recordSuccess(), result;
          } catch (error) {
            if (breaker.recordFailure(), error instanceof DOMException && error.name === "AbortError")
              throw error;
            retryCount++;
            let errorMessage = error instanceof Error ? error.message : String(error);
            if (logger.error("SdkRetry", "SDK retry attempt failed", {
              attempt: retryCount,
              totalAttempts: maxRetries + 1,
              method,
              error: errorMessage
            }), await this.handleClientCleanup(method, acpConfig), retryCount > maxRetries) {
              let fallbackText = `${CORE_SDK_CONFIG.ERROR_SDK_CONNECTION_FAIL} (?\uFFFD\uFFFD?\uFFFD?{method})?\uFFFD

?\uFFFD\u8AA4\u8A73\uFFFD?\uFFFD?{errorMessage}`;
              return onChunk && onChunk(fallbackText), fallbackText;
            }
            let baseDelay = this.extractRetryAfterMs(error) ?? Math.min(500 * Math.pow(2, retryCount), 8e3), jitter = Math.random() * baseDelay;
            logger.info("SdkRetry", "Retrying failed SDK request", {
              method,
              retryInMs: Math.round(jitter),
              attempt: retryCount + 1
            }), await new Promise((resolve) => setTimeout(resolve, jitter));
          }
        return "Unexpected error in retry loop";
      }
      static extractRetryAfterMs(error) {
        if (error && typeof error == "object") {
          let e = error;
          if (typeof e.retryAfter == "number") return e.retryAfter * 1e3;
          if (typeof e.retryAfterMs == "number") return e.retryAfterMs;
          let headers = e.headers, ra = headers?.["retry-after"] ?? headers?.["Retry-After"];
          if (ra) {
            let parsed = Number(ra);
            if (!isNaN(parsed)) return parsed * 1e3;
          }
        }
        return null;
      }
      static async handleClientCleanup(method, acpConfig) {
        try {
          let { clientOptions } = resolveACPOptions(acpConfig), { removeClientByParams: removeClientByParams2 } = await Promise.resolve().then(() => (init_client_manager(), client_manager_exports));
          await removeClientByParams2(method, clientOptions);
        } catch (cleanupErr) {
          logger.warn("SdkRetry", "Failed to cleanup client after retryable error", { method, error: cleanupErr });
        }
      }
    };
  }
});

// src/shared/molecules/ai-core/health/remote-checker.ts
async function checkRemoteHealth(port) {
  let start = Date.now(), timeout;
  try {
    let client = await getOrCreateClient("remote_cli", {
      cliUrl: `localhost:${port}`,
      cliPath: "copilot"
    });
    return await Promise.race([
      client.ping("health"),
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Remote CLI health check timed out")), 1500);
      })
    ]), { ok: !0, type: "remote_cli", latency: Date.now() - start };
  } catch {
    return null;
  } finally {
    timeout && clearTimeout(timeout);
  }
}
var init_remote_checker = __esm({
  "src/shared/molecules/ai-core/health/remote-checker.ts"() {
    "use strict";
    init_client_manager();
  }
});

// src/shared/molecules/ai-core/health/azure-checker.ts
async function checkAzureHealth(key, endpoint) {
  let start = Date.now();
  return key && endpoint ? { ok: !0, type: "azure_byok", latency: Date.now() - start, detail: "Azure key configured" } : null;
}
var init_azure_checker = __esm({
  "src/shared/molecules/ai-core/health/azure-checker.ts"() {
    "use strict";
  }
});

// src/shared/molecules/ai-core/health/cli-checker.ts
import { CopilotClient as CopilotClient2 } from "@github/copilot-sdk";
async function checkCliBaselineHealth() {
  let start = Date.now(), client = new CopilotClient2({ cliPath: "copilot" }), timeout;
  try {
    return await Promise.race([
      client.start(),
      new Promise((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`Copilot CLI health check timed out after ${Math.round(CORE_SDK_CONFIG.CLIENT_START_TIMEOUT_MS / 1e3)}s`)),
          CORE_SDK_CONFIG.CLIENT_START_TIMEOUT_MS
        );
      })
    ]), { ok: !0, type: "copilot_cli", latency: Date.now() - start };
  } catch {
    return { ok: !1, type: "none" };
  } finally {
    timeout && clearTimeout(timeout), await client.stop().catch(() => {
    });
  }
}
var init_cli_checker = __esm({
  "src/shared/molecules/ai-core/health/cli-checker.ts"() {
    "use strict";
    init_core_config();
  }
});

// src/shared/molecules/ai-core/organisms/health-prober.ts
async function checkAgentHealth() {
  if (env_default.COPILOT_AGENT_PORT) {
    let remote = await checkRemoteHealth(env_default.COPILOT_AGENT_PORT);
    if (remote) return remote;
  }
  let azure = await checkAzureHealth(env_default.AZURE_OPENAI_API_KEY, env_default.AZURE_OPENAI_ENDPOINT);
  return azure || await checkCliBaselineHealth();
}
var init_health_prober = __esm({
  "src/shared/molecules/ai-core/organisms/health-prober.ts"() {
    "use strict";
    init_env();
    init_option_resolver();
    init_client_manager();
    init_logger();
    init_remote_checker();
    init_azure_checker();
    init_cli_checker();
  }
});

// src/orchestrator/workflow-graph.ts
var workflow_graph_exports = {};
__export(workflow_graph_exports, {
  ModernSDKOrchestrator: () => ModernSDKOrchestrator,
  WorkflowGraph: () => WorkflowGraph
});
import { randomUUID as randomUUID3 } from "crypto";
var TAG8, WorkflowGraph, ModernSDKOrchestrator, init_workflow_graph = __esm({
  "src/orchestrator/workflow-graph.ts"() {
    "use strict";
    init_router_agent();
    init_qa_reviewer();
    init_state_manager();
    init_event_bus();
    init_logger();
    init_sdk_turn_orchestrator();
    init_sdk_retry_engine();
    init_option_resolver();
    init_pending_input_queue();
    init_client_manager();
    init_session_lifecycle();
    init_health_prober();
    init_server_config();
    init_expert_excel();
    init_expert_word();
    init_expert_ppt();
    TAG8 = "WorkflowGraph", WorkflowGraph = class {
      /**
       * Main entry point for a multi-agent orchestrated task.
       */
      static async executeTask(sessionId, prompt, onChunk, isExplicitCli = !1, modelName = server_config_default.COPILOT_MODEL, azureInfo, methodOverride, geminiKey, officeContext, signal) {
        let traceId = randomUUID3(), log = logger.withTrace(traceId);
        log.info(TAG8, `Starting task execution graph for session ${sessionId}`), await eventBus.emit("TASK_STARTED", { sessionId, prompt, traceId });
        let state = globalStateManager.getState(sessionId);
        state || (state = globalStateManager.createState(sessionId, officeContext)), globalStateManager.updateState(sessionId, { status: "planning", currentTask: prompt });
        try {
          let routeResult = await RouterAgent.analyzeIntent(prompt, { query: prompt, traceId });
          globalStateManager.recordAction(sessionId, {
            agent: "router",
            action: "analyze_intent",
            payload: { query: prompt },
            result: routeResult
          }), globalStateManager.updateState(sessionId, { status: "executing" });
          let method = methodOverride || resolveMethodFromContext(modelName, azureInfo, isExplicitCli), acpConfig = {
            method,
            model: modelName,
            streaming: !!onChunk,
            azure: azureInfo,
            remotePort: server_config_default.COPILOT_AGENT_PORT || void 0,
            geminiKey,
            officeContext
          }, instructionTasks = routeResult.domains.map(async (domain) => domain === "expert-excel" ? await getCoreInstructions() : domain === "expert-word" ? await getCoreInstructions3() : domain === "expert-ppt" ? await getCoreInstructions2() : ""), instructions = (await Promise.all(instructionTasks)).filter(Boolean), compositeSystemPrompt = instructions.length > 0 ? `[NEXUS MULTI-AGENT COMPOSITE SYSTEM PROMPT]

${instructions.join(`

---

`)}` : "", generator = async (p) => {
            let finalPrompt = compositeSystemPrompt ? `${compositeSystemPrompt}

USER REQUEST: ${p}` : p;
            return await SdkRetryEngine.executeWithRetry(
              () => SdkTurnOrchestrator.executeTurn(
                finalPrompt,
                modelName,
                method,
                acpConfig,
                onChunk,
                signal
              ),
              method,
              acpConfig,
              onChunk
            );
          }, finalContent, qaDomains = [];
          if (routeResult.domains.includes("expert-ppt") && qaDomains.push("ppt"), routeResult.domains.includes("expert-word") && qaDomains.push("word"), routeResult.domains.includes("expert-excel") && qaDomains.push("excel"), qaDomains.length > 0) {
            log.info(TAG8, `Routing through QA Reviewer for domains [${qaDomains.join(", ")}]`), globalStateManager.updateState(sessionId, { status: "reviewing" });
            let primaryDomain = qaDomains[0], qaResult = await QAReviewerAgent.enforceQuality(generator, prompt, {
              domain: primaryDomain,
              traceId
            });
            finalContent = qaResult.content, globalStateManager.recordAction(sessionId, {
              agent: "qa-reviewer",
              action: "review_design",
              payload: { domains: qaDomains },
              result: qaResult
            });
          } else
            log.info(TAG8, "Direct execution for generic intent (no specific QA gating)"), finalContent = await generator(prompt), globalStateManager.recordAction(sessionId, {
              agent: "expert",
              action: "execute",
              payload: { domains: routeResult.domains, prompt },
              result: "success"
            });
          return globalStateManager.updateState(sessionId, { status: "completed", currentTask: void 0 }), log.info(TAG8, "Task execution completed successfully"), await eventBus.emit("TASK_COMPLETED", { sessionId, traceId }), finalContent;
        } catch (error) {
          throw log.error(TAG8, "Workflow Graph encountered an error", error), globalStateManager.updateState(sessionId, {
            status: "error",
            error: error instanceof Error ? error.message : String(error)
          }), await eventBus.emit("TASK_FAILED", { sessionId, error: String(error), traceId }), error;
        }
      }
    }, ModernSDKOrchestrator = class {
      static async cleanup() {
        await cleanupAllSessions(), clearAllPendingInputs(), await stopAllClients();
      }
      static resolveInput(sessionId, answer) {
        return resolveInput(sessionId, answer);
      }
      static async healthCheck() {
        let health = await checkAgentHealth();
        return { [health.type || "unknown"]: !!health.ok };
      }
      static async sendPrompt(prompt, onChunk, isExplicitCli = !1, modelName = server_config_default.COPILOT_MODEL, azureInfo, methodOverride, geminiKey, officeContext, signal, sessionId) {
        let targetSession = sessionId || randomUUID3();
        return WorkflowGraph.executeTask(
          targetSession,
          prompt,
          onChunk,
          isExplicitCli,
          modelName,
          azureInfo,
          methodOverride,
          geminiKey,
          officeContext,
          signal
        );
      }
    };
  }
});

// src/infra/organisms/server-orchestrator.ts
init_server_config();
init_client_manager();
import http from "node:http";
import https from "node:https";

// src/infra/molecules/app-factory.ts
import express2 from "express";
import cors from "cors";
import path12 from "node:path";
import { randomUUID as randomUUID4 } from "node:crypto";

// src/api/organisms/auth-router.ts
init_env();
import express from "express";

// src/api/atoms/status-html.ts
function renderStatusHTML(title, message, color = "#0078D4", autoClose = !1) {
  return `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fbfbfb; color: #333; }
        .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.06); text-align: center; max-width: 400px; animation: slideIn 0.5s ease; border: 1px solid #eee; }
        .icon { font-size: 48px; color: ${color}; margin-bottom: 24px; }
        h3 { margin: 0 0 12px; font-weight: 600; font-size: 22px; }
        p { color: #666; line-height: 1.5; margin: 0 0 24px; }
        button { background: ${color}; color: white; border: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: filter 0.2s; }
        button:hover { filter: brightness(1.1); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">\u2728</div>
        <h3>${title}</h3>
        <p>${message}</p>
        <button onclick="window.close()">\u95DC\u9589\u8996\u7A97</button>
      </div>
      ${autoClose ? "<script>setTimeout(() => window.close(), 2000);</script>" : ""}
    </body>
    </html>`;
}

// src/api/molecules/session-store.ts
var SessionStore = class {
  store = /* @__PURE__ */ new Map();
  timers = /* @__PURE__ */ new Map();
  set(id, token, expiryMs = 6e4) {
    let existing = this.timers.get(id);
    existing && clearTimeout(existing), this.store.set(id, token);
    let timer = setTimeout(() => this.delete(id), expiryMs);
    this.timers.set(id, timer);
  }
  get(id) {
    return this.store.get(id);
  }
  delete(id) {
    this.store.delete(id);
    let timer = this.timers.get(id);
    timer && (clearTimeout(timer), this.timers.delete(id));
  }
}, SESSION_STORE = new SessionStore();

// src/infra/atoms/fetcher.ts
async function fetch2(input, init) {
  if (typeof globalThis.fetch != "function")
    throw new Error("No fetch implementation available. Ensure you are using Node 18+");
  return globalThis.fetch(input, init);
}

// src/api/organisms/oauth-service.ts
init_env();
var OAuthService = {
  getGitHubAuthorizeUrl(sessionId, redirectUri) {
    let clientId = env_default.GITHUB_CLIENT_ID, scope = "read:user";
    return `https://github.com/login/oauth/authorize?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state: sessionId
    }).toString()}`;
  },
  async exchangeGitHubCode(code) {
    let clientId = env_default.GITHUB_CLIENT_ID, clientSecret = env_default.GITHUB_CLIENT_SECRET, accessToken = (await (await fetch2("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    })).json()).access_token || "";
    if (!accessToken)
      throw new Error("Token exchange failed: No access_token returned");
    return accessToken;
  },
  finalizeSession(sessionId, token) {
    sessionId && token && SESSION_STORE.set(sessionId, token);
  }
};

// src/api/organisms/auth-router.ts
init_logger();
var authRouter = express.Router();
authRouter.get("/session/:id", (req, res) => {
  let id = req.params.id;
  if (!id || typeof id != "string") {
    res.status(400).json({ error: "missing id" });
    return;
  }
  let token = SESSION_STORE.get(id) || "";
  res.json({ token });
});
authRouter.get("/github", (req, res) => {
  let clientId = env_default.GITHUB_CLIENT_ID, sessionId = req.query.session || "", redirectUri = `${req.protocol}://${req.get("host")}/auth/callback`;
  if (!clientId || clientId === "your_github_oauth_client_id_here") {
    res.status(200).send(renderStatusHTML(
      "OAuth Not Configured",
      "GitHub OAuth is not configured on the server.",
      "#D93025"
    ));
    return;
  }
  let url = OAuthService.getGitHubAuthorizeUrl(sessionId, redirectUri);
  res.redirect(url);
});
authRouter.get("/callback", async (req, res) => {
  let code = req.query.code, sessionId = req.query.session || req.query.state || "";
  if (!code) {
    res.status(400).send("Missing code");
    return;
  }
  try {
    let accessToken = await OAuthService.exchangeGitHubCode(code);
    OAuthService.finalizeSession(sessionId, accessToken), res.send(renderStatusHTML(
      "\u5DF2\u6210\u529F\u9023\u63A5 GitHub",
      "\u60A8\u7684\u5E33\u865F\u5DF2\u6210\u529F\u6388\u6B0A\uFF0C\u73FE\u5728\u53EF\u4EE5\u95DC\u9589\u6B64\u8996\u7A97\u3002",
      "#0078D4",
      !0
    ));
  } catch (err) {
    let error = err;
    logger.error("AuthRouter", "OAuth callback failed", { error }), res.status(500).send(renderStatusHTML(
      "\u8A8D\u8B49\u5931\u6557",
      `\u767C\u751F\u932F\u8AA4\uFF1A${error.message}`,
      "#D93025"
    ));
  }
});
authRouter.post("/verify/gemini", async (req, res) => {
  let { key } = req.body;
  if (!key) {
    res.status(400).json({ error: "missing key" });
    return;
  }
  try {
    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`), data = await response.json();
    response.ok && data.models ? res.json({ success: !0, models: data.models.length }) : res.status(401).json({ error: data.error?.message || "Invalid API Key" });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
authRouter.post("/verify/github", async (req, res) => {
  let { token } = req.body;
  if (!token) {
    res.status(400).json({ error: "missing token" });
    return;
  }
  try {
    let response = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${token}`, "User-Agent": "Nexus-Center-Industrial" }
    }), data = await response.json();
    response.ok && data.login ? res.json({ success: !0, login: data.login }) : res.status(401).json({ error: data.message || "Invalid GitHub Token" });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
var auth_router_default = authRouter;

// src/api/organisms/api-router.ts
init_env();
import { Router } from "express";

// src/adapters/ai-providers/gemini-adapter.ts
init_env();

// src/shared/molecules/ai-core/sse-parser.ts
var SSE_PARSER = {
  async *parse(reader) {
    let decoder = new TextDecoder(), buffer = "";
    for (; reader; ) {
      let { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: !0 });
      let lines = buffer.split(`
`);
      buffer = lines.pop() || "";
      for (let line of lines) {
        let cleaned = line.trim();
        !cleaned || cleaned === "data: [DONE]" || cleaned.startsWith("data: ") && (yield cleaned.substring(6));
      }
    }
  }
};

// src/adapters/ai-providers/gemini-adapter.ts
init_logger();
var GeminiRestService = {
  /**
   * Internal Helper: Prepend models/ if missing for Native API
   */
  /**
   * Internal Helper: Map UI Model Names to Official API IDs
   * EVOLUTION: Respecting version numbers (3.1, 2.5, etc.) via slugification.
   */
  mapModel(model) {
    let slug = model.toLowerCase().trim().replace(/[\s_]+/g, "-");
    return slug.startsWith("models/") ? slug : `models/${slug}`;
  },
  async parseErrorDetail(response, fallbackMessage) {
    let raw = await response.text().catch(() => "");
    if (!raw) return fallbackMessage;
    try {
      return JSON.parse(raw).error?.message || raw;
    } catch {
      return raw;
    }
  },
  /**
   * Non-streaming call
   */
  async send(apiKey, model, payload) {
    let modelId = this.mapModel(model), url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${apiKey}`;
    logger.info("GeminiRest", "Sending non-streaming Gemini REST request", { modelId });
    let body = {
      contents: [{ parts: [{ text: payload.user || "" }] }],
      system_instruction: payload.system ? { parts: [{ text: payload.system }] } : void 0,
      generationConfig: {
        temperature: Number(env_default.DEFAULT_TEMPERATURE),
        maxOutputTokens: Number(env_default.MAX_TOKENS)
      }
    }, response = await fetch2(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: payload.signal,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      let errorDetail = await this.parseErrorDetail(response, "Gemini Native Error");
      throw logger.warn("GeminiRest", "Gemini REST request failed", {
        modelId,
        status: response.status,
        detail: errorDetail
      }), { status: response.status, detail: errorDetail };
    }
    return (await response.json())?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  },
  /**
   * SSE Streaming Generator (Gemini Native Implementation)
   */
  async *stream(apiKey, model, payload) {
    let modelId = this.mapModel(model), url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:streamGenerateContent?alt=sse&key=${apiKey}`;
    logger.info("GeminiRest", "Starting streaming Gemini REST request", { modelId });
    let body = {
      contents: [{ parts: [{ text: payload.user || "" }] }],
      system_instruction: payload.system ? { parts: [{ text: payload.system }] } : void 0,
      generationConfig: {
        temperature: Number(env_default.DEFAULT_TEMPERATURE),
        maxOutputTokens: Number(env_default.MAX_TOKENS)
      }
    }, response = await fetch2(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: payload.signal,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      let errorDetail = await this.parseErrorDetail(response, "Gemini Native Stream Error");
      throw logger.warn("GeminiRest", "Gemini streaming request failed", {
        modelId,
        status: response.status,
        detail: errorDetail
      }), { status: response.status, detail: errorDetail };
    }
    let reader = response.body?.getReader();
    if (!reader) return;
    let parseErrorLogged = !1;
    for await (let line of SSE_PARSER.parse(reader))
      try {
        let text = JSON.parse(line).candidates?.[0]?.content?.parts?.[0]?.text || "";
        text && (yield text);
      } catch (e) {
        parseErrorLogged || (parseErrorLogged = !0, logger.warn("GeminiRest", "Failed to parse SSE chunk from Gemini stream", {
          modelId,
          error: e
        }));
      }
  },
  /**
   * Key Probe (Validation)
   */
  async validate(apiKey) {
    let models = env_default.AVAILABLE_MODELS_GEMINI, lastErr = null;
    for (let m of models)
      try {
        await this.send(apiKey, m, { system: "Validation", user: "hi" });
        return;
      } catch (err) {
        lastErr = err;
        let error = err;
        if (error?.status === 401 || error?.status === 403) throw err;
      }
    throw logger.warn("GeminiRest", "Gemini API key validation exhausted all configured models", {
      models,
      error: lastErr
    }), lastErr || { status: 401, detail: "Gemini Key validation failed" };
  }
};

// src/api/organisms/copilot-handler.ts
init_env();

// src/shared/molecules/ai-core/organisms/completion-service.ts
init_server_config();
init_formatters();

// src/shared/molecules/ai-core/organisms/gemini-rest-service.ts
init_env();
init_logger();
var GeminiRestService2 = {
  /**
   * Internal Helper: Prepend models/ if missing for Native API
   */
  /**
   * Internal Helper: Map UI Model Names to Official API IDs
   * EVOLUTION: Respecting version numbers (3.1, 2.5, etc.) via slugification.
   */
  mapModel(model) {
    let slug = model.toLowerCase().trim().replace(/[\s_]+/g, "-");
    return slug.startsWith("models/") ? slug : `models/${slug}`;
  },
  async parseErrorDetail(response, fallbackMessage) {
    let raw = await response.text().catch(() => "");
    if (!raw) return fallbackMessage;
    try {
      return JSON.parse(raw).error?.message || raw;
    } catch {
      return raw;
    }
  },
  /**
   * Non-streaming call
   */
  async send(apiKey, model, payload) {
    let modelId = this.mapModel(model), url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${apiKey}`;
    logger.info("GeminiRest", "Sending non-streaming Gemini REST request", { modelId });
    let body = {
      contents: [{ parts: [{ text: payload.user || "" }] }],
      system_instruction: payload.system ? { parts: [{ text: payload.system }] } : void 0,
      generationConfig: {
        temperature: Number(env_default.DEFAULT_TEMPERATURE),
        maxOutputTokens: Number(env_default.MAX_TOKENS)
      }
    }, response = await fetch2(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: payload.signal,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      let errorDetail = await this.parseErrorDetail(response, "Gemini Native Error");
      throw logger.warn("GeminiRest", "Gemini REST request failed", {
        modelId,
        status: response.status,
        detail: errorDetail
      }), { status: response.status, detail: errorDetail };
    }
    return (await response.json())?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  },
  /**
   * SSE Streaming Generator (Gemini Native Implementation)
   */
  async *stream(apiKey, model, payload) {
    let modelId = this.mapModel(model), url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:streamGenerateContent?alt=sse&key=${apiKey}`;
    logger.info("GeminiRest", "Starting streaming Gemini REST request", { modelId });
    let body = {
      contents: [{ parts: [{ text: payload.user || "" }] }],
      system_instruction: payload.system ? { parts: [{ text: payload.system }] } : void 0,
      generationConfig: {
        temperature: Number(env_default.DEFAULT_TEMPERATURE),
        maxOutputTokens: Number(env_default.MAX_TOKENS)
      }
    }, response = await fetch2(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: payload.signal,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      let errorDetail = await this.parseErrorDetail(response, "Gemini Native Stream Error");
      throw logger.warn("GeminiRest", "Gemini streaming request failed", {
        modelId,
        status: response.status,
        detail: errorDetail
      }), { status: response.status, detail: errorDetail };
    }
    let reader = response.body?.getReader();
    if (!reader) return;
    let parseErrorLogged = !1;
    for await (let line of SSE_PARSER.parse(reader))
      try {
        let text = JSON.parse(line).candidates?.[0]?.content?.parts?.[0]?.text || "";
        text && (yield text);
      } catch (e) {
        parseErrorLogged || (parseErrorLogged = !0, logger.warn("GeminiRest", "Failed to parse SSE chunk from Gemini stream", {
          modelId,
          error: e
        }));
      }
  },
  /**
   * Key Probe (Validation)
   */
  async validate(apiKey) {
    let models = env_default.AVAILABLE_MODELS_GEMINI, lastErr = null;
    for (let m of models)
      try {
        await this.send(apiKey, m, { system: "Validation", user: "hi" });
        return;
      } catch (err) {
        lastErr = err;
        let error = err;
        if (error?.status === 401 || error?.status === 403) throw err;
      }
    throw logger.warn("GeminiRest", "Gemini API key validation exhausted all configured models", {
      models,
      error: lastErr
    }), lastErr || { status: 401, detail: "Gemini Key validation failed" };
  }
};

// src/shared/molecules/ai-core/organisms/github-models-service.ts
init_env();
var GitHubModelsService = {
  async send(token, model, payload, onChunk) {
    let url = env_default.GITHUB_MODELS_URL, response = await fetch2(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      signal: payload.signal,
      body: JSON.stringify({
        messages: [
          { role: "system", content: payload.system },
          { role: "user", content: payload.user }
        ],
        model,
        temperature: env_default.DEFAULT_TEMPERATURE,
        stream: !!onChunk
      })
    });
    if (!response.ok) {
      let data2 = await response.json().catch(() => ({}));
      throw { status: response.status, detail: data2?.error?.message || "GitHub Models Error" };
    }
    if (onChunk) {
      let reader = response.body?.getReader();
      if (!reader) return "";
      let fullText = "";
      for await (let jsonString of SSE_PARSER.parse(reader))
        try {
          let delta = JSON.parse(jsonString).choices?.[0]?.delta?.content || "";
          delta && (fullText += delta, onChunk(delta));
        } catch {
        }
      return fullText;
    }
    return (await response.json())?.choices?.[0]?.message?.content || "";
  }
};

// src/shared/atoms/ai-core/presets.ts
var FALLBACK_PRESETS = [
  {
    id: "general",
    label: "\u4E00\u822C\u5BEB\u4F5C",
    description: "\u901A\u7528\u5BEB\u4F5C\u8207\u7DE8\u8F2F\uFF0C\u512A\u5148\u76F4\u63A5\u56DE\u7B54\u554F\u984C\uFF0C\u907F\u514D\u4E0D\u5FC5\u8981\u5EF6\u4F38\u3002",
    system: "Answer the user's request directly and clearly. Be concise by default. Do not add appendices, sample code, PoC snippets, speculative parameters, or extra scenarios unless the user explicitly asks for them."
  },
  {
    id: "meeting-notes",
    label: "\u6703\u8B70\u7D00\u9304",
    description: "\u8B70\u7A0B\u3001\u6C7A\u8B70\u3001\u5F85\u8FA6\u4E8B\u9805\u8207\u8CA0\u8CAC\u4EBA\u3002",
    system: "Format output as meeting minutes with sections for agenda, discussion points, decisions, and action items. Prefer bullet lists and a compact table for owners and deadlines."
  },
  {
    id: "formal-memo",
    label: "\u6B63\u5F0F\u516C\u6587",
    description: "\u6B63\u5F0F\u8A9E\u6C23\u3001\u7A31\u8B02\u3001\u4E3B\u65E8\u8207\u7D50\u8A9E\u3002",
    system: "Write in formal business Chinese. Use a clear subject line, polite salutation, body paragraphs, and a respectful closing. Keep the layout clean and official."
  },
  {
    id: "proposal",
    label: "\u63D0\u6848\u66F8",
    description: "\u554F\u984C\u3001\u65B9\u6848\u3001\u6548\u76CA\u3001\u6642\u7A0B\u8207\u98A8\u96AA\u3002",
    system: "Structure the response as a proposal with title, executive summary, problem statement, proposed solution, benefits, timeline, risks, and next steps."
  },
  {
    id: "summary-report",
    label: "\u5831\u544A\u6458\u8981",
    description: "\u91CD\u9EDE\u6458\u8981\u3001\u7D50\u8AD6\u8207\u4E0B\u4E00\u6B65\u3002",
    system: "Summarize the content into a concise report summary with key findings, implications, and recommended next actions."
  }
];
function getPresetById(id) {
  let normalized = String(id || "general").toLowerCase();
  return FALLBACK_PRESETS.find((p) => p.id === normalized) || FALLBACK_PRESETS[0];
}

// src/shared/atoms/ai-core/prompt-template.ts
var PROFESSIONAL_DRAFT_DIRECTIVE = (prompt) => `
### \u56DE\u8986\u4EFB\u52D9 ###
\u4F7F\u7528\u8005\u9700\u6C42\uFF1A${prompt}

\u8ACB\u76F4\u63A5\u56DE\u61C9\u4F7F\u7528\u8005\u9700\u6C42\uFF0C\u512A\u5148\u63D0\u4F9B\u6E96\u78BA\u3001\u53EF\u7528\u3001\u7CBE\u7C21\u7684\u5167\u5BB9\u3002

\u57F7\u884C\u8981\u6C42\u5982\u4E0B\uFF1A
1. **\u5148\u56DE\u7B54\uFF0C\u518D\u88DC\u5145**\uFF1A\u5148\u76F4\u63A5\u56DE\u7B54\u6838\u5FC3\u554F\u984C\u3002\u53EA\u6709\u5728\u78BA\u5BE6\u6709\u52A9\u65BC\u7406\u89E3\u6642\uFF0C\u624D\u88DC\u5145\u5FC5\u8981\u80CC\u666F\u3002
2. **\u7D50\u69CB\u5316\u4F48\u5C40**\uFF1A
   - \u4F7F\u7528\u6E05\u695A\u6A19\u984C\u8207\u6BB5\u843D\uFF0C\u4F46\u4E0D\u8981\u70BA\u4E86\u6392\u7248\u800C\u6DFB\u52A0\u591A\u9918\u7AE0\u7BC0\u3002
   - \u82E5\u4F7F\u7528\u8005\u53EA\u554F\u55AE\u4E00\u554F\u984C\uFF0C\u907F\u514D\u786C\u6027\u62C6\u6210\u904E\u591A\u7AE0\u7BC0\u3002
3. **\u8A9E\u8ABF\u8207\u98A8\u683C**\uFF1A
   - \u4F7F\u7528\u7E41\u9AD4\u4E2D\u6587\u9032\u884C\u64B0\u5BEB\u3002
   - \u98A8\u683C\u61C9\u81EA\u7136\u3001\u5C08\u696D\u3001\u907F\u514D\u5197\u8A5E\u3002
   - \u4E0D\u8981\u4E3B\u52D5\u52A0\u5165\u300C\u9644\u9304\u300D\u3001\u300CPoC \u7BC4\u4F8B\u300D\u3001\u300C\u793A\u610F\u53C3\u6578\u300D\u3001\u300C\u5EF6\u4F38\u6848\u4F8B\u300D\u6216\u5047\u8A2D\u6027\u8A2D\u5B9A\uFF0C\u9664\u975E\u4F7F\u7528\u8005\u660E\u78BA\u8981\u6C42\u3002
   - \u4E0D\u8981\u7DE8\u9020 URL\u3001\u74B0\u5883\u8B8A\u6578\u540D\u7A31\u3001\u4F01\u696D\u5167\u90E8\u7AEF\u9EDE\u3001CLI \u53C3\u6578\u6216 SDK \u8A2D\u5B9A\u7BC4\u4F8B\u3002
4. **\u8F38\u51FA\u683C\u5F0F**\uFF1AMarkdown \u61C9\u6E05\u6670\u4E14\u53EF\u76F4\u63A5\u61C9\u7528\u65BC Word \u6587\u4EF6\u4E2D\u3002

\u958B\u59CB\u64B0\u5BEB\uFF08\u8ACB\u76F4\u63A5\u7522\u51FA\u5167\u5BB9\uFF09\uFF1A
`;

// src/shared/atoms/ai-core/system-identity.ts
init_env();
var SYSTEM_IDENTITY_TEMPLATE = (p) => {
  let lang = p.languageOverrides || env_default.DEFAULT_RESPONSE_LANGUAGE, persona = p.personaOverrides || env_default.DEFAULT_PERSONA;
  return [
    "# Role Context",
    p.presetSystem,
    "# Constraints",
    `- Output Language: ${lang}`,
    `- Persona Quality: ${persona}`,
    "- Format: Highly professional, Word-compatible structure"
  ].join(`
`);
};

// src/shared/atoms/ai-core/word-instructions.ts
var WORD_ACTION_GUIDE = `
[Office Agent \u589E\u5F37\u63D0\u793A]
1. \u82E5\u7528\u6236\u5E0C\u671B\u300C\u66FF\u63DB\u300D\u73FE\u6709\u5167\u5BB9\u6216\u91DD\u5C0D\u7576\u524D\u9078\u53D6\u6587\u5B57\u9032\u884C\u4FEE\u6539\uFF0C\u8ACB\u5728\u56DE\u8986\u672B\u5C3E\u5305\u542B\uFF1A
   <office-action type="replace">\u512A\u5316\u5F8C\u7684\u5167\u5BB9</office-action>
2. \u82E5\u7528\u6236\u5E0C\u671B\u300C\u5728\u5176\u5F8C\u63D2\u5165\u300D\u5167\u5BB9\uFF0C\u8ACB\u5305\u542B\uFF1A
   <office-action type="insert">\u63D2\u5165\u7684\u5167\u5BB9</office-action>
\u8ACB\u78BA\u4FDD\u5167\u5BB9\u53EF\u4EE5\u76F4\u63A5\u88AB\u63D2\u5165 Word \u4E14\u683C\u5F0F\u6B63\u78BA\u3002
`;

// src/shared/molecules/ai-core/organisms/prompt-orchestrator.ts
var PromptOrchestrator = {
  buildWordPrompt(prompt, officeContext, _model, presetId, systemPromptOverride) {
    let preset = getPresetById(presetId), userContent = PROFESSIONAL_DRAFT_DIRECTIVE(prompt), system = SYSTEM_IDENTITY_TEMPLATE({
      presetSystem: `${preset.system}

${WORD_ACTION_GUIDE}`
    });
    return systemPromptOverride && (system += `

[INJECTED_PROTOCOL]
${systemPromptOverride}`), {
      system,
      user: [
        "### Office Workspace Context",
        `Host: ${officeContext.host || "Word"}`,
        `Context Data: ${JSON.stringify(officeContext)}`,
        "### User Original Request",
        userContent
      ].join(`

`)
    };
  }
};

// src/shared/molecules/ai-core/fallback-chain.ts
init_logger();
var FallbackChain = class _FallbackChain {
  models;
  constructor(models) {
    this.models = models;
  }
  async execute(fn) {
    let lastError = null;
    for (let i = 0; i < this.models.length; i++) {
      let model = this.models[i];
      try {
        return {
          result: await fn(model),
          model,
          fallbackUsed: i > 0,
          attempts: i + 1
        };
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError")
          throw err;
        lastError = err, logger.warn("FallbackChain", "Model fallback attempt failed", {
          model,
          attempt: i + 1,
          totalAttempts: this.models.length,
          error: lastError.message
        });
      }
    }
    throw lastError || new Error("FallbackChain: all models exhausted");
  }
  static fromEnv() {
    let raw = process.env.FALLBACK_MODELS;
    if (!raw) return null;
    let models = raw.split(",").map((m) => m.trim()).filter(Boolean);
    return models.length > 1 ? new _FallbackChain(models) : null;
  }
};

// src/shared/molecules/ai-core/organisms/sdk-provider.ts
init_formatters();
init_core_config();
init_client_manager();
init_option_resolver();
init_tool_registry();
init_pending_input_queue();
init_session_lifecycle();
init_workflow_graph();
init_health_prober();
var sendPromptViaCopilotSdk = (prompt, onChunk, isExplicitCli = !1, modelName, azureInfo, methodOverride, geminiKey, officeContext, signal, sessionId) => ModernSDKOrchestrator.sendPrompt(
  prompt,
  onChunk,
  isExplicitCli,
  modelName,
  azureInfo,
  methodOverride,
  geminiKey,
  officeContext,
  signal,
  sessionId
);

// src/shared/molecules/ai-core/organisms/completion-service.ts
init_logger();
var CompletionService = {
  async execute(req, onChunk, signal) {
    let resolvedModel = req.model || server_config_default.COPILOT_MODEL, { system, user } = PromptOrchestrator.buildWordPrompt(
      req.prompt,
      req.officeContext,
      resolvedModel,
      req.presetId || "general",
      req.systemPrompt
    );
    try {
      if (req.authProvider === "github_models") {
        let token = server_config_default.getModelsToken();
        return await GitHubModelsService.send(token, resolvedModel, { system, user }, onChunk);
      }
      if (req.authProvider === "gemini_api" && req.geminiKey)
        if (req.stream) {
          for await (let chunk of GeminiRestService2.stream(req.geminiKey, resolvedModel, { system, user }))
            onChunk?.(chunk);
          return;
        } else
          return await GeminiRestService2.send(req.geminiKey, resolvedModel, { system, user });
      let isExplicitGeminiCli = req.authProvider === "gemini_cli", combinedPrompt = `${system}

${user}`, streamedText = await sendPromptViaCopilotSdk(
        combinedPrompt,
        onChunk,
        isExplicitGeminiCli,
        resolvedModel,
        void 0,
        // azure info
        isExplicitGeminiCli ? "gemini_cli" : void 0,
        req.geminiKey,
        req.officeContext,
        signal,
        req.sessionId
        // Pass sessionId to orchestrator
      );
      if (isExplicitGeminiCli && req.stream && !String(streamedText || "").trim()) {
        logger.warn("CompletionService", "Empty Gemini CLI streaming result; retrying once with non-streaming fallback", {
          model: resolvedModel,
          authProvider: req.authProvider
        });
        let fallbackText = await sendPromptViaCopilotSdk(
          user,
          void 0,
          !0,
          resolvedModel,
          void 0,
          "gemini_cli",
          req.geminiKey,
          req.officeContext,
          signal
          // propagate abort to fallback ??avoids resource leak on disconnect
        );
        return fallbackText && onChunk && await emitChunks(fallbackText, onChunk), fallbackText;
      }
      return streamedText;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError")
        throw logger.info("CompletionService", "Completion aborted by caller", {
          model: resolvedModel,
          authProvider: req.authProvider
        }), err;
      logger.error("CompletionService", "Primary completion path failed", {
        model: resolvedModel,
        authProvider: req.authProvider,
        error: err
      });
      let chain = FallbackChain.fromEnv();
      if (chain) {
        logger.warn("CompletionService", "Primary model failed; attempting fallback chain", {
          model: resolvedModel,
          authProvider: req.authProvider
        });
        try {
          let fallbackResult = await chain.execute(async (fallbackModel) => {
            let { system: _s, user: u } = PromptOrchestrator.buildWordPrompt(req.prompt, req.officeContext, fallbackModel, req.presetId || "general");
            return await sendPromptViaCopilotSdk(
              u,
              onChunk,
              !1,
              fallbackModel,
              void 0,
              void 0,
              void 0,
              req.officeContext,
              signal
            );
          });
          return fallbackResult.fallbackUsed && logger.info("CompletionService", "Fallback model succeeded", {
            primaryModel: resolvedModel,
            fallbackModel: fallbackResult.model
          }), fallbackResult.result;
        } catch (fallbackErr) {
          logger.error("CompletionService", "Fallback chain exhausted", {
            primaryModel: resolvedModel,
            error: fallbackErr
          });
        }
      }
      throw err;
    }
  }
};

// src/shared/molecules/ai-core/response-parser.ts
var ResponseParser = {
  parse(text) {
    let actions = [], cleanText = text, actionRegex = /<office-action\s+type="([^"]+)">([\s\S]*?)<\/office-action>/gi, match;
    for (; (match = actionRegex.exec(text)) !== null; )
      actions.push({
        type: match[1],
        // e.g., 'replace', 'insert'
        value: match[2].trim()
      }), cleanText = cleanText.replace(match[0], "").trim();
    return { cleanText, actions };
  }
};

// src/infra/atoms/latency-tracker.ts
var marks = /* @__PURE__ */ new Map(), MAX_MARKS = 1e3;
function markStart(label) {
  if (marks.size > MAX_MARKS) {
    let oldest = marks.keys().next().value;
    oldest && marks.delete(oldest);
  }
  marks.set(label, performance.now());
}
function markEnd(label) {
  let start = marks.get(label);
  if (start === void 0) return -1;
  let elapsed = Math.round(performance.now() - start);
  return marks.delete(label), console.log(`[Perf] ${label}: ${elapsed}ms`), elapsed;
}

// src/infra/atoms/request-logger.ts
import crypto3 from "node:crypto";

// src/infra/atoms/client-ip.ts
function getClientIp(req) {
  let forwarded = req.headers["x-forwarded-for"];
  return typeof forwarded == "string" ? forwarded.split(",")[0].trim() : req.ip || req.socket.remoteAddress || "unknown";
}

// src/infra/atoms/request-logger.ts
init_logger();
function createRequestLog(req, requestId = crypto3.randomUUID()) {
  let ip = getClientIp(req);
  return {
    requestId,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    endpoint: req.originalUrl || req.path || "/api/copilot",
    authProvider: req.body?.authProvider || "unknown",
    model: req.body?.model || "default",
    ip,
    streaming: !!req.body?.stream,
    userAgent: req.get("user-agent") || "unknown"
  };
}
function logCompletion(log, result) {
  let entry = {
    ...log,
    latencyMs: result.latencyMs,
    status: result.status,
    ...result.chunks !== void 0 && { chunks: result.chunks },
    ...result.error && { error: result.error }
  };
  logger.info("Request", "Completion finished", entry);
}

// src/api/organisms/copilot-handler.ts
init_system_state_store();
init_nexus_socket();
init_logger();
var handleCopilotRequest = async (req, res) => {
  let reqLog = createRequestLog(req, res.locals.requestId), requestId = reqLog.requestId;
  markStart(requestId);
  let firstTokenTracked = !1, chunkCount = 0, streamStartMs = 0, { prompt, officeContext, model, stream, authProvider, presetId, systemPrompt } = req.body, authHeader = req.headers.authorization, geminiKey = (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null) || env_default.GEMINI_API_KEY, streamingRes = res;
  try {
    let setStreamingState = (isStreaming) => {
      GlobalSystemState.update({ isStreaming }), NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", GlobalSystemState.getState());
    };
    if (setStreamingState(!0), stream) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no"
      }), streamingRes.flushHeaders?.(), streamingRes.socket?.setNoDelay?.(!0), res.write(`data: ${JSON.stringify({ text: "" })}

`), res.write(": " + " ".repeat(256) + `

`), streamingRes.flush?.();
      let onChunk = (chunk) => {
        if (!firstTokenTracked) {
          let ttft = markEnd(`${requestId}:first-token`);
          firstTokenTracked = !0, streamStartMs = performance.now(), GlobalSystemState.update({ ttft }), NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", GlobalSystemState.getState());
        }
        res.write(`data: ${JSON.stringify({ text: chunk })}

`), streamingRes.flush?.(), chunkCount++;
      };
      markStart(`${requestId}:first-token`);
      let abortController = new AbortController(), isClientConnected = !0, handleDisconnect = () => {
        !isClientConnected || res.writableEnded || (isClientConnected = !1, setStreamingState(!1), abortController.abort(), logger.info("CopilotHandler", "Client disconnected during stream; aborting upstream turn", {
          requestId
        }));
      };
      if (res.on("close", handleDisconnect), await CompletionService.execute(
        {
          prompt,
          officeContext,
          model,
          presetId,
          stream: !0,
          authProvider,
          geminiKey,
          systemPrompt,
          sessionId: requestId
          // Pass requestId as sessionId
        },
        (chunk) => {
          isClientConnected && onChunk(chunk);
        },
        abortController.signal
      ), isClientConnected) {
        res.write(`data: [DONE]

`);
        let streamLatency = markEnd(requestId), elapsedSec = streamStartMs > 0 ? (performance.now() - streamStartMs) / 1e3 : 1, estimatedTokens = Math.round(chunkCount * 8), tokensPerSec = elapsedSec > 0 ? Math.round(estimatedTokens / elapsedSec) : 0;
        GlobalSystemState.update({ tokensPerSec, activePersona: presetId || "General" }), NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", GlobalSystemState.getState()), logCompletion(reqLog, { latencyMs: streamLatency, status: "ok", chunks: chunkCount }), res.end();
        return;
      } else
        return;
    } else {
      let rawText = await CompletionService.execute({
        prompt,
        officeContext,
        model,
        presetId,
        stream: !1,
        authProvider,
        geminiKey,
        systemPrompt
      }), { cleanText, actions } = ResponseParser.parse(rawText), nonStreamLatency = markEnd(requestId);
      logCompletion(reqLog, { latencyMs: nonStreamLatency, status: "ok" }), res.json({
        text: cleanText,
        actions,
        model: model || env_default.COPILOT_MODEL,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        latencyMs: nonStreamLatency
      });
      return;
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      res.headersSent ? res.end() : res.status(499).end();
      return;
    }
    let error = err, detail = error.detail || error.message;
    if (logger.error("CopilotHandler", "Copilot request failed", { requestId, error }), logCompletion(reqLog, { latencyMs: markEnd(requestId), status: "error", error: error.message }), !res.headersSent) {
      res.status(error.status || 500).json({
        error: "provider_error",
        detail
      });
      return;
    }
    res.write(`data: ${JSON.stringify({ error: "provider_error", detail })}

`), res.write(`data: [DONE]

`), res.end();
  } finally {
    GlobalSystemState.update({ isStreaming: !1 }), NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", GlobalSystemState.getState());
  }
};

// src/api/organisms/api-router.ts
init_option_resolver();
init_client_manager();
init_workflow_graph();
init_nexus_socket();
init_system_state_store();

// src/api/molecules/rate-limiter.ts
init_logger();
var store = /* @__PURE__ */ new Map(), WINDOW_MS = 6e4, CLEANUP_INTERVAL_MS = 5 * 6e4, cleanupTimer = setInterval(() => {
  let now = Date.now();
  for (let [ip, entry] of store)
    (entry.timestamps.length === 0 || now - entry.lastSeen > WINDOW_MS * 2) && store.delete(ip);
}, CLEANUP_INTERVAL_MS);
cleanupTimer.unref();
function createRateLimiter(maxRequests) {
  let configuredLimit = maxRequests ?? Number(process.env.RATE_LIMIT_RPM || "30"), limit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 30, enabled = process.env.RATE_LIMIT_ENABLED !== "false";
  return (req, res, next) => {
    if (!enabled) {
      next();
      return;
    }
    let ip = getClientIp(req), now = Date.now(), windowStart = now - WINDOW_MS, entry = store.get(ip) ?? { timestamps: [], lastSeen: now };
    entry.timestamps = entry.timestamps.filter((timestamp) => timestamp > windowStart), entry.lastSeen = now;
    let resetAt = entry.timestamps.length > 0 ? entry.timestamps[0] + WINDOW_MS : now + WINDOW_MS, remaining = Math.max(limit - entry.timestamps.length, 0);
    if (res.setHeader("RateLimit-Limit", String(limit)), res.setHeader("RateLimit-Remaining", String(remaining)), res.setHeader("RateLimit-Reset", String(Math.ceil(resetAt / 1e3))), entry.timestamps.length >= limit) {
      let retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1e3));
      res.setHeader("Retry-After", String(retryAfter)), logger.warn("RateLimiter", "Request throttled", { ip, limit, retryAfter }), res.status(429).json({
        error: "rate_limit_exceeded",
        detail: `Too many requests. Limit: ${limit}/min. Retry after ${retryAfter}s.`
      });
      return;
    }
    entry.timestamps.push(now), store.set(ip, entry), next();
  };
}

// src/api/atoms/request-validator.ts
init_logger();
var MAX_INPUT_CHARS = 5e4, isNonEmptyString = (value) => typeof value == "string" && value.trim().length > 0, countText = (value) => typeof value == "string" ? value.trim().length : 0;
function validateOfficeContext(context, errors) {
  if (context == null)
    return 0;
  if (typeof context != "object" || Array.isArray(context))
    return errors.push("officeContext must be an object when provided."), 0;
  let officeContext = context, length = 0;
  for (let key of ["host", "selectionText", "documentText"]) {
    let value = officeContext[key];
    if (value !== void 0 && typeof value != "string") {
      errors.push(`officeContext.${key} must be a string when provided.`);
      continue;
    }
    length += countText(value);
  }
  return length;
}
function validateMessages(messages, errors) {
  if (messages == null)
    return 0;
  if (!Array.isArray(messages))
    return errors.push("messages must be an array when provided."), 0;
  if (messages.length === 0)
    return errors.push("messages cannot be an empty array."), 0;
  let totalLength = 0;
  return messages.forEach((message, index) => {
    if (!message || typeof message != "object" || Array.isArray(message)) {
      errors.push(`Message ${index + 1} must be an object.`);
      return;
    }
    let item = message, role = item.role, content = typeof item.content == "string" ? item.content : item.text;
    if (role !== void 0 && typeof role != "string" && errors.push(`Message ${index + 1} role must be a string when provided.`), !isNonEmptyString(content)) {
      errors.push(`Message ${index + 1} content must be a non-empty string.`);
      return;
    }
    totalLength += content.trim().length;
  }), totalLength;
}
var validateCopilotRequestBody = (body) => {
  let errors = [], prompt = typeof body.prompt == "string" ? body.prompt.trim() : "", systemPrompt = typeof body.systemPrompt == "string" ? body.systemPrompt.trim() : "", messagesLength = validateMessages(body.messages, errors), officeContextLength = validateOfficeContext(body.officeContext, errors);
  !prompt && !Array.isArray(body.messages) && errors.push('Either "prompt" or "messages" must be provided.'), body.prompt !== void 0 && !isNonEmptyString(body.prompt) && errors.push("Prompt must be a non-empty string."), body.model !== void 0 && !isNonEmptyString(body.model) && errors.push("Model must be a non-empty string when provided."), body.presetId !== void 0 && !isNonEmptyString(body.presetId) && errors.push("presetId must be a non-empty string when provided."), body.authProvider !== void 0 && !isNonEmptyString(body.authProvider) && errors.push("authProvider must be a non-empty string when provided."), body.stream !== void 0 && typeof body.stream != "boolean" && errors.push("stream must be a boolean when provided."), body.systemPrompt !== void 0 && !isNonEmptyString(body.systemPrompt) && errors.push("systemPrompt must be a non-empty string when provided.");
  let contentLength = prompt.length + systemPrompt.length + messagesLength + officeContextLength;
  return contentLength > MAX_INPUT_CHARS && errors.push(`Input exceeds maximum size of ${MAX_INPUT_CHARS.toLocaleString()} characters (Current: ${contentLength.toLocaleString()}).`), body.model !== void 0 && typeof body.model != "string" && errors.push("Model must be a string if provided."), {
    valid: errors.length === 0,
    errors
  };
}, validateCopilotRequest = (req, res, next) => {
  let result = validateCopilotRequestBody(req.body);
  if (!result.valid) {
    logger.warn("Validator", "Invalid request blocked", { errors: result.errors }), res.status(400).json({
      error: "INVALID_REQUEST",
      detail: result.errors.join("; ")
    });
    return;
  }
  next();
};

// src/api/organisms/api-router.ts
import path11 from "node:path";
import { pathToFileURL } from "node:url";
var limiter = createRateLimiter(), ACP_VALIDATION_METHODS = {
  azure: "azure_byok",
  azure_openai: "azure_byok",
  azure_byok: "azure_byok",
  gemini: "gemini_cli",
  gemini_cli: "gemini_cli",
  copilot: "copilot_cli",
  copilot_cli: "copilot_cli"
}, apiRouter = Router(), isLocalRequest = (req) => {
  let ip = req.ip || req.socket.remoteAddress || "";
  return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1" || process.env.NODE_ENV !== "production";
};
apiRouter.get("/config", (_req, res) => {
  res.json({
    COPILOT_MODEL: env_default.COPILOT_MODEL,
    AVAILABLE_MODELS_GITHUB: env_default.AVAILABLE_MODELS_GITHUB,
    AVAILABLE_MODELS_GEMINI: env_default.AVAILABLE_MODELS_GEMINI,
    APP_TITLE: env_default.APP_TITLE,
    FALLBACK_PRESETS: env_default.FALLBACK_PRESETS,
    PREVIEW_MODE_GUIDE_MD: env_default.PREVIEW_MODE_GUIDE_MD,
    DEFAULT_WORD_FONT_STYLE: env_default.DEFAULT_WORD_FONT_STYLE,
    AUTO_CONNECT_CLI: env_default.AUTO_CONNECT_CLI
  });
});
apiRouter.post("/gemini/validate", async (req, res) => {
  try {
    let { apiKey } = req.body;
    if (typeof apiKey != "string" || !apiKey.trim()) {
      res.status(400).json({ status: 400, detail: "apiKey missing" });
      return;
    }
    await GeminiRestService.validate(apiKey), res.json({ status: 200, detail: "Gemini Key is valid" });
  } catch (err) {
    let error = err, status = error.status || 401;
    res.status(status).json({ status, detail: error.detail || "Gemini Key is invalid" });
  }
});
apiRouter.post("/acp/validate", async (req, res) => {
  let client, validationTimer, acpMethod, clientOptions;
  try {
    let { method, token, endpoint, deployment } = req.body;
    if (acpMethod = ACP_VALIDATION_METHODS[method], !acpMethod) {
      res.status(400).json({ detail: `Unsupported method: ${method}` });
      return;
    }
    clientOptions = resolveACPOptions({
      method: acpMethod,
      model: acpMethod === "gemini_cli" ? "gemini-1.5-flash" : "github-models",
      streaming: !1,
      githubToken: acpMethod === "copilot_cli" && token || void 0,
      geminiKey: acpMethod === "gemini_cli" ? token : void 0,
      azure: acpMethod === "azure_byok" ? { apiKey: token, endpoint, deployment } : void 0
    }).clientOptions, client = await getOrCreateClient(acpMethod, clientOptions);
    let validationTimeoutMs = 15e3, pingPromise = client.ping("health-check"), timeoutPromise = new Promise((_, reject) => {
      validationTimer = setTimeout(
        () => reject(new Error("ACP Handshake Timeout")),
        validationTimeoutMs
      );
    });
    await Promise.race([pingPromise, timeoutPromise]), res.json({ status: 200, detail: `${method} valid` });
  } catch (err) {
    let detail = err instanceof Error ? err.message : "ACP failure";
    res.status(401).json({ status: 401, detail });
  } finally {
    validationTimer && clearTimeout(validationTimer), client && acpMethod && clientOptions && removeClientByParams(acpMethod, clientOptions).catch(() => {
    });
  }
});
apiRouter.get("/health", async (_req, res) => {
  try {
    let health = await ModernSDKOrchestrator.healthCheck();
    res.json({ status: "ok", clients: health, uptime: process.uptime() });
  } catch (err) {
    res.status(500).json({ status: "error", detail: String(err) });
  }
});
apiRouter.post("/copilot", limiter, validateCopilotRequest, handleCopilotRequest);
apiRouter.post("/system/patch", async (req, res) => {
  if (!isLocalRequest(req)) {
    res.status(403).json({ detail: "Restricted" });
    return;
  }
  try {
    let patcherPath = path11.resolve(
      process.cwd(),
      "src",
      "infra",
      "scripts",
      "core",
      "patch-copilot-sdk.mjs"
    );
    await import(pathToFileURL(patcherPath).href), res.json({ status: 200, detail: "SDK Patched" });
  } catch (err) {
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
  let { power, provider, isWarming, isStreaming } = req.body;
  if (provider && !ACP_VALIDATION_METHODS[provider]) {
    res.status(400).json({ detail: "Invalid provider" });
    return;
  }
  GlobalSystemState.update({ power, provider, isWarming, isStreaming });
  let newState = GlobalSystemState.getState();
  NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", newState), res.json({ status: 200, ...newState });
});
apiRouter.get("/system/warmup", async (req, res) => {
  if (!isLocalRequest(req)) {
    res.status(403).json({ detail: "Restricted" });
    return;
  }
  GlobalSystemState.update({ isWarming: !0 });
  try {
    let { warmUpClient: warmUpClient3 } = await Promise.resolve().then(() => (init_client_manager(), client_manager_exports));
    await warmUpClient3(GlobalSystemState.getState().provider), GlobalSystemState.update({ isWarming: !1 }), res.json({ status: 200, detail: "Warming complete" });
  } catch (e) {
    GlobalSystemState.update({ isWarming: !1 }), res.status(500).json({ status: 500, detail: String(e) });
  }
});
var api_router_default = apiRouter;

// src/infra/molecules/telemetry-middleware.ts
import crypto4 from "node:crypto";
init_nexus_socket();
function telemetryMiddleware(req, res, next) {
  let requestId = crypto4.randomUUID();
  res.locals.requestId = requestId, res.setHeader("X-Request-Id", requestId);
  let label = `api-${req.method}-${req.path.replace(/\//g, "-")}-${requestId}`;
  markStart(label);
  let finalized = !1, finalize = () => {
    if (finalized) return;
    finalized = !0;
    let ms = markEnd(label);
    ms !== -1 && NexusSocketRelay.broadcast("TELEMETRY_LATENCY", {
      ms,
      endpoint: req.originalUrl || req.path,
      method: req.method,
      status: res.statusCode,
      requestId,
      phase: "http"
    });
  };
  res.once("finish", finalize), res.once("close", finalize), next();
}

// src/infra/molecules/app-factory.ts
var AppFactory = {
  create() {
    let app = express2(), distPath = path12.resolve(process.cwd(), "dist"), defaultOrigins = [
      "https://localhost:3000",
      "https://localhost:3001",
      "https://localhost:4000"
    ], configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean), allowedOrigins = /* @__PURE__ */ new Set([...defaultOrigins, ...configuredOrigins]), allowAllOrigins = process.env.CORS_ALLOW_ALL_ORIGINS === "true", allowedPatterns = [/\.run\.app$/];
    return app.use(telemetryMiddleware), app.use((req, _res, next) => {
      req.requestId = req.headers["x-request-id"] || randomUUID4(), next();
    }), app.use(cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, !0);
          return;
        }
        allowAllOrigins || allowedOrigins.has(origin) || allowedPatterns.some((pattern) => pattern.test(origin)) ? callback(null, !0) : callback(new Error(`CORS origin not allowed: ${origin}`), !1);
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Gemini-Key", "X-User-API-Key"],
      credentials: !0
    })), app.use(express2.json({ limit: "1mb" })), app.use(express2.static(distPath)), app.use("/auth", auth_router_default), app.use("/api", api_router_default), app.get("/api/debug/list-models", async (req, res) => {
      if (process.env.EXPOSE_DEBUG_ENDPOINTS !== "true") {
        res.status(403).json({ error: "debug_endpoint_disabled" });
        return;
      }
      let key = req.query.key || req.headers["x-gemini-key"];
      if (!key) {
        res.status(400).json({ error: "Missing key" });
        return;
      }
      try {
        let response = await ((await import("node-fetch")).default || global.fetch)(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        res.json(await response.json());
      } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
      }
    }), app.get("/", (req, res) => {
      req.headers.accept?.includes("text/html") ? res.redirect("/monitor.html") : res.json({ ok: !0 });
    }), app;
  }
};

// src/infra/molecules/https-server-options.ts
import fs5 from "node:fs";
import path13 from "node:path";
async function resolveHttpsServerOptions() {
  let certPath = path13.join(process.cwd(), "certs"), keyFile = path13.join(certPath, "localhost.key"), crtFile = path13.join(certPath, "localhost.crt");
  if (fs5.existsSync(keyFile) && fs5.existsSync(crtFile))
    try {
      return console.log("[Setup] SSL: Using Industrial Zenith Certificates (Mount)"), {
        isHttps: !0,
        options: {
          key: fs5.readFileSync(keyFile),
          cert: fs5.readFileSync(crtFile)
        }
      };
    } catch (e) {
      console.error("[Setup] SSL: Failed to read mounted certs:", e);
    }
  try {
    let certs = await (await import("office-addin-dev-certs")).getHttpsServerOptions();
    return console.log("[Setup] SSL: Success (Dev-Certs)"), {
      isHttps: !0,
      options: { ca: certs.ca, key: certs.key, cert: certs.cert }
    };
  } catch (err) {
    return console.warn("[Setup] SSL: Falling back to HTTP", err instanceof Error ? err.message : String(err)), { isHttps: !1, options: {} };
  }
}

// src/infra/molecules/lifecycle-manager.ts
var LifecycleManager = class {
  static shutdownHandlers = [];
  static isShuttingDown = !1;
  static registered = !1;
  static onShutdown(handler) {
    this.shutdownHandlers.push(handler), this.ensureSignalsRegistered();
  }
  static registerServer(server) {
    this.onShutdown(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          console.log("[Lifecycle] Server closed."), resolve();
        });
      });
    });
  }
  static ensureSignalsRegistered() {
    if (this.registered) return;
    this.registered = !0, ["SIGINT", "SIGTERM"].forEach((sig) => {
      process.once(sig, async () => {
        if (this.isShuttingDown) return;
        this.isShuttingDown = !0, console.log(`
[Lifecycle] ${sig} received. Commencing unified cleanup...`);
        let timeout = setTimeout(() => {
          console.error("[Lifecycle] Cleanup timed out after 10s. Force exiting."), process.exit(1);
        }, 1e4);
        try {
          for (let handler of this.shutdownHandlers)
            try {
              await handler();
            } catch (err) {
              console.error("[Lifecycle] Cleanup handler failed:", err);
            }
          console.log("[Lifecycle] Cleanup complete. Exiting."), clearTimeout(timeout), process.exit(0);
        } catch (err) {
          console.error("[Lifecycle] Unexpected error during cleanup:", err), process.exit(1);
        }
      });
    });
  }
};
LifecycleManager.onShutdown(async () => {
  try {
    let { ModernSDKOrchestrator: ModernSDKOrchestrator2 } = await Promise.resolve().then(() => (init_workflow_graph(), workflow_graph_exports));
    await ModernSDKOrchestrator2.cleanup();
  } catch (err) {
    console.warn("[Lifecycle] SDK cleanup failed:", err);
  }
});
LifecycleManager.onShutdown(async () => {
  await stopAllClients();
});

// src/infra/organisms/server-orchestrator.ts
init_idle_cleaner();
init_nexus_socket();
init_logger();
var ServerOrchestrator = {
  async start() {
    markStart("server-startup"), logger.setHook((entry) => {
      NexusSocketRelay.broadcast("LOG_ENTRY", entry);
    });
    let app = AppFactory.create(), { isHttps, options } = await resolveHttpsServerOptions(), targetPort = Number(server_config_default.PORT) || 4e3;
    try {
      let server = isHttps ? https.createServer(options, app) : http.createServer(app);
      return await new Promise((resolve, reject) => {
        server.once("error", (error) => {
          if (error.code === "EADDRINUSE") reject(error);
          else throw error;
        }), server.listen(targetPort, () => resolve());
      }), console.log(`[Setup] Server: ${isHttps ? "https" : "http"}://localhost:${targetPort}`), markEnd("server-startup"), NexusSocketRelay.attach(server), LifecycleManager.registerServer(server), server_config_default.AUTO_CONNECT_CLI && !server_config_default.isRemoteCliConfigured() && setImmediate(() => {
        warmUpClient("copilot_cli");
      }), IdleCleaner.startScanning(async (_key) => {
        await cleanupAllSessions2(), await stopAllClients();
      }), server;
    } catch (error) {
      throw console.error("[Setup] Server failed to start:", error), error;
    }
  }
};

// src/server.ts
process.env.NODE_NO_WARNINGS = "1";
ServerOrchestrator.start().catch((err) => {
  console.error("[Critical] Core Server Orchestration Failed:", err), process.exit(1);
});
