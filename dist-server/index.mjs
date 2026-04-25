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

// src/shared/logger/index.ts
function sanitizeValue(value, seen = /* @__PURE__ */ new WeakSet(), depth = 0) {
  if (value == null || depth >= 5)
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
    return "cause" in value && value.cause !== void 0 && (errorShape.cause = sanitizeValue(value.cause, seen, depth + 1)), errorShape;
  }
  if (typeof value != "object")
    return value;
  if (seen.has(value))
    return "[Circular]";
  if (seen.add(value), Array.isArray(value))
    return value.map((item) => sanitizeValue(item, seen, depth + 1));
  let output = {};
  for (let [key, entry] of Object.entries(value))
    REDACTED_KEYS.test(key) ? output[key] = "[REDACTED]" : typeof entry == "string" && (REDACTED_KEYS.test(entry) || /^(ghu_|ghp_|gho_|github_pat_|eyJh|bearer\s)/i.test(entry)) ? output[key] = "[REDACTED_VALUE]" : typeof entry == "string" && entry.length > 5e3 ? output[key] = entry.substring(0, 5e3) + "...[TRUNCATED]" : output[key] = sanitizeValue(entry, seen, depth + 1);
  return output;
}
function writeLog(level, tag, message, data, requestId, traceId, perf) {
  let entry = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level,
    tag,
    message
  };
  requestId && (entry.requestId = requestId), traceId && (entry.traceId = traceId), data !== void 0 && (entry.data = sanitizeValue(data)), perf && (entry.performance = perf);
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
var REDACTED_KEYS, logHook, timers, logger, init_logger = __esm({
  "src/shared/logger/index.ts"() {
    "use strict";
    REDACTED_KEYS = /token|api[_-]?key|authorization|bearer|password|secret/i;
    logHook = null, timers = /* @__PURE__ */ new Map();
    logger = {
      info: (tag, message, data) => writeLog("info", tag, message, data),
      warn: (tag, message, data) => writeLog("warn", tag, message, data),
      error: (tag, message, data) => writeLog("error", tag, message, data),
      /**
       * Starts a performance timer for an operation.
       */
      startTimer: (tag, operationId) => {
        let key = `${tag}:${operationId}`;
        timers.set(key, {
          startTime: performance.now(),
          startMemory: typeof process < "u" ? process.memoryUsage().rss : 0
        }), performance.mark(`${key}-start`);
      },
      /**
       * Ends a performance timer and logs the results.
       */
      endTimer: (tag, operationId, message, data) => {
        let key = `${tag}:${operationId}`, startData = timers.get(key);
        if (!startData) return;
        performance.mark(`${key}-end`), performance.measure(key, `${key}-start`, `${key}-end`);
        let durationMs = performance.now() - startData.startTime, memoryUsageMb = ((typeof process < "u" ? process.memoryUsage().rss : 0) - startData.startMemory) / 1024 / 1024;
        writeLog("info", tag, message, data, void 0, void 0, {
          durationMs,
          memoryUsageMb: Math.max(0, memoryUsageMb)
        }), timers.delete(key);
      },
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

// src/config/molecules/server-config.ts
var _cachedFallbackPresets, config, server_config_default, init_server_config = __esm({
  "src/config/molecules/server-config.ts"() {
    "use strict";
    init_base_env();
    init_logger();
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
            if (_cachedFallbackPresets = JSON.parse(BASE_ENV.FALLBACK_PRESETS_JSON), !Array.isArray(_cachedFallbackPresets)) throw new Error("Not an array");
          } catch (e) {
            let error = e;
            logger.warn("Failed to parse FALLBACK_PRESETS_JSON, using default:", error?.message || String(e)), _cachedFallbackPresets = [
              { id: "general", name: "General", description: "Default", systemPrompt: "" }
            ];
          }
        return _cachedFallbackPresets;
      },
      get PREVIEW_MODE_GUIDE_MD() {
        return BASE_ENV.PREVIEW_MODE_GUIDE_MD;
      },
      get DEFAULT_WORD_FONT_STYLE() {
        return BASE_ENV.DEFAULT_WORD_FONT_STYLE;
      },
      getServerPatToken: () => {
        let token = firstDefinedValue(
          process.env.COPILOT_GITHUB_TOKEN,
          process.env.GH_TOKEN,
          process.env.GITHUB_TOKEN,
          process.env.GITHUB_PAT,
          process.env.COPILOT_PAT
        );
        if (!token)
          throw logger.error("ServerConfig", "Failed to find a valid GitHub PAT in environment variables."), new Error("FATAL: A GitHub PAT or Copilot token is required but was not provided.");
        return token;
      },
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
      },
      get CORS_ALLOWED_ORIGINS() {
        return (process.env.CORS_ALLOWED_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean).map((o) => o.startsWith("/") && o.endsWith("/") ? new RegExp(o.slice(1, -1)) : o);
      }
    }, server_config_default = config;
  }
});

// src/config/env.ts
import { z } from "zod";
var envSchema, validatedEnv, env_default, init_env = __esm({
  "src/config/env.ts"() {
    "use strict";
    init_base_env();
    init_server_config();
    envSchema = z.object({
      // Infrastructure
      PORT: z.coerce.number().positive().default(4e3),
      // AI Provider Keys
      GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required for Gemini operations"),
      // GitHub OAuth (Required for Auth workflows)
      GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
      GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
      // Rate Limiting
      RATE_LIMIT_RPM: z.coerce.number().positive().default(30),
      RATE_LIMIT_ENABLED: z.boolean().default(!0),
      // Optional AI Keys (can be empty but should be validated if present)
      AZURE_OPENAI_API_KEY: z.string().optional().default(""),
      AZURE_OPENAI_ENDPOINT: z.string().optional().default(""),
      AZURE_OPENAI_DEPLOYMENT: z.string().optional().default(""),
      // Copilot / GitHub Tokens
      COPILOT_GITHUB_TOKEN: z.string().optional().default("")
    }), validatedEnv = envSchema.safeParse({
      PORT: BASE_ENV.PORT,
      GEMINI_API_KEY: BASE_ENV.GEMINI_API_KEY,
      GITHUB_CLIENT_ID: BASE_ENV.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: BASE_ENV.GITHUB_CLIENT_SECRET,
      RATE_LIMIT_RPM: BASE_ENV.RATE_LIMIT_RPM,
      RATE_LIMIT_ENABLED: BASE_ENV.RATE_LIMIT_ENABLED,
      AZURE_OPENAI_API_KEY: BASE_ENV.AZURE_OPENAI_API_KEY,
      AZURE_OPENAI_ENDPOINT: BASE_ENV.AZURE_OPENAI_ENDPOINT,
      AZURE_OPENAI_DEPLOYMENT: BASE_ENV.AZURE_OPENAI_DEPLOYMENT,
      COPILOT_GITHUB_TOKEN: process.env.COPILOT_GITHUB_TOKEN || ""
    });
    if (!validatedEnv.success) {
      console.error("\u274C [FATAL] Environment validation failed:");
      let formatted = validatedEnv.error.format();
      Object.entries(formatted).forEach(([key, value]) => {
        key !== "_errors" && console.error(`   - ${key}: ${value._errors.join(", ")}`);
      }), process.exit(1);
    }
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
              let title = parts[1] ?? "Untitled Chart", type = parts[2] ?? "ColumnClustered", range = parts[3] || "AUTO";
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

// src/agents/shared/skill-executor-factory.ts
function createSkillExecutor(skillName, invoke) {
  return async (params, ctx) => {
    let start = Date.now();
    try {
      return {
        ok: !0,
        data: await invoke(params),
        meta: {
          durationMs: Date.now() - start,
          skillName,
          traceId: ctx?.traceId
        }
      };
    } catch (err) {
      return logger.error("SkillExecutor", `Skill ${skillName} failed`, { error: err, traceId: ctx?.traceId }), {
        ok: !1,
        error: err instanceof Error ? err.message : String(err),
        meta: { skillName, traceId: ctx?.traceId }
      };
    }
  };
}
var init_skill_executor_factory = __esm({
  "src/agents/shared/skill-executor-factory.ts"() {
    "use strict";
    init_logger();
  }
});

// src/infra/services/bridge-client.ts
async function post(path15, body) {
  let controller = new AbortController(), timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    let response = await fetch(`${BRIDGE_URL}${path15}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    if (!response.ok) {
      let errorDetail = "(no body)";
      try {
        let errorJson = await response.json();
        errorDetail = JSON.stringify(errorJson);
      } catch {
        errorDetail = await response.text().catch(() => "(no body)");
      }
      throw new Error(`Skill bridge HTTP ${response.status}: ${errorDetail}`);
    }
    return await response.json();
  } catch (err) {
    throw err.name === "AbortError" ? new Error(`Skill bridge request timed out after ${REQUEST_TIMEOUT_MS}ms`) : err;
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
function requireObject(value, errorMessage) {
  if (value && typeof value == "object" && !Array.isArray(value))
    return value;
  throw new Error(errorMessage);
}
function requireString(value, errorMessage) {
  if (typeof value == "string" && value.trim().length > 0)
    return value.trim();
  throw new Error(errorMessage);
}
function requireStringArray(value, fieldName) {
  if (!Array.isArray(value) || value.length === 0)
    throw new Error(`${fieldName} must be a non-empty string array`);
  return value.map((item, index) => requireString(item, `${fieldName}[${index}] must be a non-empty string`));
}
function normalizeCellReference(value, fieldName) {
  let ref = requireString(value, `${fieldName} is required`);
  if (ref.includes(":"))
    throw new Error(`${fieldName} must reference a single cell, not a range (${ref})`);
  return ref;
}
function normalizeFormula(change) {
  let rawFormula = change.formula ?? change.value, formula = requireString(rawFormula, "Formula value is required");
  return formula.startsWith("=") ? formula : `=${formula}`;
}
function normalizePivotValues(value) {
  if (!Array.isArray(value) || value.length === 0)
    throw new Error("Pivot values must be a non-empty array");
  return value.map((item, index) => {
    if (typeof item == "string")
      return { field: item, func: "SUM" };
    let spec = requireObject(item, `Pivot value at index ${index} must be a string or object`), field = requireString(spec.field, `Pivot value field at index ${index} is required`), funcValue = spec.func ?? "SUM";
    if (funcValue === "SUM" || funcValue === "COUNT" || funcValue === "AVERAGE")
      return { field, func: funcValue };
    throw new Error(`Unsupported pivot aggregation function at index ${index}: ${String(funcValue)}`);
  });
}
function normalizeExcelChange(change, index) {
  let op = requireObject(change, `Excel change at index ${index} must be an object`), rawAction = op.op ?? op.action ?? (typeof op.type == "string" ? EXCEL_ACTION_NAME_MAP[op.type] ?? op.type : void 0), actionName = requireString(rawAction, `Excel change at index ${index} is missing an action name`);
  switch (actionName) {
    case "set_value":
      return {
        op: "set_value",
        cell: normalizeCellReference(op.cell ?? op.range, `changes[${index}].cell`),
        value: op.value
      };
    case "set_formula":
    case "add_formula":
      return {
        op: "add_formula",
        cell: normalizeCellReference(op.cell ?? op.range, `changes[${index}].cell`),
        formula: normalizeFormula(op)
      };
    case "format_range": {
      let format = op.format ? requireObject(op.format, `changes[${index}].format must be an object`) : void 0;
      return {
        op: "format_range",
        range: requireString(op.range, `changes[${index}].range is required`),
        bold: op.bold ?? format?.bold,
        fill_color: op.fill_color ?? op.fillColor ?? format?.fillColor,
        font_color: op.font_color ?? op.fontColor,
        number_format: op.number_format ?? op.numberFormat ?? format?.numberFormat
      };
    }
    case "set_column_width":
      return {
        op: "set_column_width",
        column: requireString(op.column, `changes[${index}].column is required`),
        width: op.width
      };
    case "merge_cells":
      return {
        op: "merge_cells",
        range: requireString(op.range, `changes[${index}].range is required`)
      };
    case "add_header_row":
      return {
        op: "add_header_row",
        row: op.row,
        headers: op.headers,
        sheet: op.sheet
      };
    case "create_pivottable":
      return {
        op: "create_pivottable",
        source: requireString(op.source, `changes[${index}].source is required`),
        destination: requireString(op.destination, `changes[${index}].destination is required`),
        name: requireString(op.name ?? `PivotTable${index + 1}`, `changes[${index}].name is required`),
        rows: requireStringArray(op.rows, `changes[${index}].rows`),
        columns: Array.isArray(op.columns) ? op.columns.map((item, columnIndex) => requireString(item, `changes[${index}].columns[${columnIndex}] must be a non-empty string`)) : [],
        values: normalizePivotValues(op.values)
      };
    case "get_metadata":
      return { op: "get_metadata" };
    case "define_table_schema":
      throw new Error("define_table_schema is not currently supported by the Excel bridge");
    default:
      throw new Error(`Unsupported Excel action: ${actionName}`);
  }
}
function normalizeExcelChanges(changes) {
  return changes.map((change, index) => normalizeExcelChange(change, index));
}
var __dirname, EXCEL_ACTION_NAME_MAP, ExcelSkillInvoker, init_excel_invoker = __esm({
  "src/agents/expert-excel/domain/excel-invoker.ts"() {
    "use strict";
    init_bridge_client();
    __dirname = path2.dirname(fileURLToPath(import.meta.url)), EXCEL_ACTION_NAME_MAP = {
      SET_VALUE: "set_value",
      SET_FORMULA: "add_formula",
      FORMAT_RANGE: "format_range",
      CREATE_PIVOT_TABLE: "create_pivottable",
      DEFINE_TABLE_SCHEMA: "define_table_schema"
    };
    ExcelSkillInvoker = class {
      /**
       * Invoke the ExcelExpert skill via the skill bridge HTTP API.
       */
      static async invokeExcelExpert(inputPath, outputPath, changes, officeContext) {
        return invokeExcelSkill({
          input_path: inputPath,
          output_path: outputPath,
          changes: normalizeExcelChanges(changes),
          office_context: officeContext ? requireObject(officeContext, "Excel officeContext must be an object") : void 0
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
var excelSkill, init_excel_tools = __esm({
  "src/agents/expert-excel/excel.tools.ts"() {
    "use strict";
    init_skill_executor_factory();
    init_excel_invoker();
    excelSkill = {
      name: "excel_expert",
      version: "5.1.0",
      description: "Workflow-first spreadsheet automation for xlsx/xlsm/csv/tsv deliverables, workbook-safe edits, formula-first modeling, and template-preserving reporting.",
      trigger: "Spreadsheet requests that require schema awareness, existing workbook preservation, formula correctness, pivot summarization, or file deliverables in xlsx/xlsm/csv/tsv.",
      logic: "Inspect workbook and office context first, preserve existing structure when an input workbook is present, then apply the smallest auditable set of spreadsheet operations.",
      intent_labels: ["excel", "spreadsheet", "data_analysis", "formula"],
      examples: [
        {
          input: {
            input_path: "pricing-template.xlsx",
            output_path: "consolidation.xlsx",
            changes: [{ op: "set_formula", cell: "B2", formula: "=VLOOKUP(A2, '[Prices.xlsx]Sheet1'!$A$2:$B$100, 2, FALSE)" }]
          },
          output: { ok: !0 },
          reasoning: "Employs exact match VLOOKUP with external workbook references to ensure price integrity across datasets."
        },
        {
          input: {
            output_path: "summary.xlsx",
            changes: [{ op: "create_pivottable", source: "SalesData", destination: "Summary!A1", name: "SalesSummary", rows: ["Region"], columns: ["Year"], values: ["Amount"] }]
          },
          output: { ok: !0 },
          reasoning: "Transforms raw transactional data into executive-level insights using structured aggregation."
        }
      ],
      parallel_safe: !0,
      edge_cases: "Large range operations (>10,000 cells) may require batching. Formulas must use A1 notation, respect logical invariants, and avoid hardcoded business values.",
      workflow: {
        overview: "Treat Excel work as a governed workbook change: understand the sheet model, preserve formulas and invariants, then apply concise atomic edits that remain auditable.",
        whenToUse: [
          "The task mentions spreadsheets, ranges, formulas, pivots, charts, or numeric reporting.",
          "The user references a spreadsheet file path or wants a spreadsheet file delivered.",
          "The answer depends on workbook structure such as tables, named ranges, or active-sheet context.",
          "The task must preserve an existing workbook template, sheet layout, or downstream reporting structure.",
          "The user needs a plan for spreadsheet edits, not just prose about the data."
        ],
        process: [
          "Inspect the active sheet, range selection, table schemas, and sample rows before proposing edits.",
          "Prefer editing an existing workbook in place via input_path so existing styles, formulas, validations, and layouts remain intact.",
          "Validate references, anchoring, and downstream logic so formulas preserve workbook invariants and computed values stay formula-driven.",
          "Emit the smallest set of atomic Excel actions needed to complete the task and explain the intended workbook outcome."
        ],
        rationalizations: [
          {
            excuse: "The workbook looks simple, so I can skip checking table schemas and just target guessed ranges.",
            reality: "Excel tasks break silently when structure is assumed. Schema and range checks are part of correctness, not optional overhead."
          },
          {
            excuse: "I can hardcode the value for now and turn it into a formula later.",
            reality: "Temporary hardcoding becomes workbook debt. Use references or named ranges from the start so downstream logic stays reliable."
          },
          {
            excuse: "Rebuilding the sheet from scratch is faster than preserving the existing template.",
            reality: "Throwing away workbook structure loses formatting, validations, and downstream references. Preserve the template unless the user explicitly wants a rebuild."
          }
        ],
        redFlags: [
          "Inventing sheet names, table names, or ranges that are not present in officeContext.",
          "Hardcoding values into formulas when references or named ranges should be used instead.",
          "Discarding an existing workbook template when input_path indicates the sheet should be edited rather than recreated.",
          "Applying large formatting or data rewrites without calling out scale and batching risk."
        ],
        verification: [
          "Every formula uses intentional A1 references and explicit anchoring where needed.",
          "Target ranges and sheet names are either present in context or clearly identified as assumptions.",
          "If input_path is provided, the requested output keeps the workbook's existing layout and only changes the intended cells or summary areas.",
          "The proposed changes preserve business totals, pivots, or other logical invariants listed in context."
        ],
        references: [
          "Excel tables and named ranges over raw coordinates for maintainability.",
          "Preserve workbook templates and validations unless the user explicitly requests a new workbook.",
          "Only emit spreadsheet output formats the runtime can preserve safely: xlsx, xlsm, csv, or tsv.",
          "Prefer additive workbook edits that are easy to inspect and roll back."
        ]
      },
      parameters: {
        type: "object",
        required: ["output_path", "changes"],
        properties: {
          input_path: { type: "string", description: "Optional path to an existing xlsx, xlsm, csv, or tsv spreadsheet to preserve and modify" },
          output_path: { type: "string", description: "Path to the output spreadsheet file (.xlsx, .xlsm, .csv, or .tsv)" },
          changes: {
            type: "array",
            description: "Array of atomic operations: set_value, add_formula, format_range, create_pivottable, get_metadata.",
            items: { type: "object" }
          },
          officeContext: { type: "object", description: "Optional context from Office host" }
        }
      },
      execute: createSkillExecutor("excel_expert", async (params) => await ExcelSkillInvoker.invokeExcelExpert(
        params.input_path ?? "",
        params.output_path,
        params.changes,
        params.officeContext
      ))
    };
  }
});

// src/agents/expert-excel/index.ts
import fs from "node:fs/promises";
import path3 from "node:path";
async function getCoreInstructions() {
  if (cachedInstructions !== null) return cachedInstructions;
  let promptPath = path3.join(__currentDir, "prompts", "excel-expert.md");
  try {
    let content = await fs.readFile(promptPath, "utf-8");
    return cachedInstructions = content, content;
  } catch (err) {
    let error = err;
    return logger.warn("ExcelExpertIndex", "Failed to load core instructions from disk", { error: error.message }), cachedInstructions = "", "";
  }
}
var __currentDir, cachedInstructions, init_expert_excel = __esm({
  "src/agents/expert-excel/index.ts"() {
    "use strict";
    init_logger();
    init_excel_tools();
    init_excel_invoker();
    __currentDir = path3.resolve(process.cwd(), "src", "agents", "expert-excel"), cachedInstructions = null;
  }
});

// src/agents/shared/workflow-skill-packet.ts
function buildSkillWorkflowPacket(skill) {
  return {
    id: skill.name,
    version: skill.version,
    description: skill.description,
    trigger: skill.trigger,
    logic: skill.logic,
    intentLabels: skill.intent_labels ?? [],
    edgeCases: skill.edge_cases,
    parallelSafe: skill.parallel_safe,
    overview: skill.workflow.overview,
    whenToUse: [...skill.workflow.whenToUse],
    process: [...skill.workflow.process],
    rationalizations: skill.workflow.rationalizations.map((item) => ({
      excuse: item.excuse,
      reality: item.reality
    })),
    redFlags: [...skill.workflow.redFlags],
    verification: [...skill.workflow.verification],
    references: [...skill.workflow.references ?? []]
  };
}
function renderSkillWorkflowGuide(skill, coreInstructions) {
  let sections = [
    `# Skill: ${skill.name}`,
    "",
    "## Overview",
    skill.workflow.overview,
    "",
    "## When to Use",
    ...skill.workflow.whenToUse.map((item) => `- ${item}`),
    "",
    "## Process",
    ...skill.workflow.process.map((item, index) => `${index + 1}. ${item}`),
    "",
    "## Common Rationalizations",
    "| Rationalization | Reality |",
    "|---|---|",
    ...skill.workflow.rationalizations.map((item) => `| ${item.excuse} | ${item.reality} |`),
    "",
    "## Red Flags",
    ...skill.workflow.redFlags.map((item) => `- ${item}`),
    "",
    "## Verification",
    ...skill.workflow.verification.map((item) => `- ${item}`)
  ];
  return skill.workflow.references && skill.workflow.references.length > 0 && sections.push("", "## References", ...skill.workflow.references.map((item) => `- ${item}`)), coreInstructions && sections.push("", "## Core Instructions", coreInstructions.trim()), sections.join(`
`);
}
var init_workflow_skill_packet = __esm({
  "src/agents/shared/workflow-skill-packet.ts"() {
    "use strict";
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
      }), prompt = includePrompt ? await loadPrompt(definition.promptPath) : "", workflow = buildSkillWorkflowPacket(definition.skill), workflowGuide = renderSkillWorkflowGuide(definition.skill, prompt);
      return createSuccessToolResult({
        status: "office_skill_ready",
        domain: definition.domain,
        skill: definition.skillName,
        skillId: definition.skill.name,
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
        workflow,
        workflowGuide,
        usageHints: definition.usageHints
      });
    }
  });
}
var init_office_skill_tool = __esm({
  "src/tools/office-atoms/shared/office-skill-tool.ts"() {
    "use strict";
    init_workflow_skill_packet();
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
      skill: excelSkill,
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
function requireObject2(value, errorMessage) {
  if (value && typeof value == "object" && !Array.isArray(value))
    return value;
  throw new Error(errorMessage);
}
function requireString2(value, errorMessage) {
  if (typeof value == "string" && value.trim().length > 0)
    return value.trim();
  throw new Error(errorMessage);
}
function getSlideIndex(op, index, fallback = 0) {
  let slideIndex = op.slide_index ?? op.slideIndex ?? fallback;
  if (typeof slideIndex != "number" || Number.isNaN(slideIndex))
    throw new Error(`changes[${index}].slide_index must be a number`);
  return slideIndex;
}
function normalizePPTChange(change, index) {
  let op = requireObject2(change, `PPT change at index ${index} must be an object`), rawAction = op.op ?? op.action ?? (typeof op.type == "string" ? PPT_ACTION_NAME_MAP[op.type] ?? op.type : void 0), actionName = requireString2(rawAction, `PPT change at index ${index} is missing an action name`);
  switch (actionName) {
    case "add_title_slide":
      return {
        op: "add_title_slide",
        title: op.title,
        subtitle: op.subtitle,
        metadata: op.metadata
      };
    case "add_slide":
      return {
        op: "add_slide",
        title: op.title,
        body: op.body ?? op.content ?? op.text,
        layout_index: op.layout_index,
        font_size_pt: op.font_size_pt ?? op.fontSize,
        metadata: op.metadata
      };
    case "add_shape":
      return {
        op: "add_shape",
        slide_index: getSlideIndex(op, index),
        shape_type: op.shape_type ?? op.shapeType ?? (typeof op.style == "string" ? op.style : "rectangle"),
        text: op.text ?? op.content,
        left: op.left,
        top: op.top,
        width: op.width,
        height: op.height,
        fill_color: op.fill_color ?? op.hex_color ?? op.themeColor,
        font_size_pt: op.font_size_pt ?? op.fontSize,
        metadata: op.metadata
      };
    case "insert_text":
      return {
        op: "insert_text",
        slide_index: getSlideIndex(op, index),
        shape_name: requireString2(op.shape_name ?? op.shapeName, `changes[${index}].shape_name is required`),
        text: requireString2(op.text ?? op.content, `changes[${index}].text is required`),
        metadata: op.metadata
      };
    case "set_font":
      return {
        op: "set_font",
        slide_index: getSlideIndex(op, index),
        shape_name: requireString2(op.shape_name ?? op.shapeName, `changes[${index}].shape_name is required`),
        size_pt: op.size_pt ?? op.font_size_pt ?? op.fontSize,
        bold: op.bold,
        color: op.color ?? op.themeColor,
        metadata: op.metadata
      };
    case "add_image":
      return {
        op: "add_image",
        slide_index: getSlideIndex(op, index),
        image_path: requireString2(op.image_path ?? op.path, `changes[${index}].image_path is required`),
        left_in: op.left_in,
        top_in: op.top_in,
        width_in: op.width_in,
        left: op.left,
        top: op.top,
        width: op.width,
        height: op.height,
        metadata: op.metadata
      };
    case "set_background_color":
      return {
        op: "set_background_color",
        slide_index: getSlideIndex(op, index),
        hex_color: op.hex_color ?? op.themeColor,
        metadata: op.metadata
      };
    case "set_slide_notes":
      return {
        op: "set_slide_notes",
        slide_index: getSlideIndex(op, index),
        notes: op.notes ?? op.text,
        metadata: op.metadata
      };
    case "get_metadata":
      return { op: "get_metadata", metadata: op.metadata };
    case "apply_layout":
    case "insert_image_placeholder":
      throw new Error(`${actionName} is not currently supported by the PPT bridge`);
    default:
      throw new Error(`Unsupported PPT action: ${actionName}`);
  }
}
function normalizePPTChanges(changes) {
  return changes.map((change, index) => normalizePPTChange(change, index));
}
var __dirname2, PPT_ACTION_NAME_MAP, PPTExpertInvoker, init_ppt_invoker = __esm({
  "src/agents/expert-ppt/domain/ppt-invoker.ts"() {
    "use strict";
    init_bridge_client();
    __dirname2 = path4.dirname(fileURLToPath2(import.meta.url)), PPT_ACTION_NAME_MAP = {
      ADD_SHAPE: "add_shape",
      UPDATE_CONTENT: "insert_text",
      APPLY_LAYOUT: "apply_layout",
      INSERT_IMAGE_PLACEHOLDER: "insert_image_placeholder",
      ADD_SLIDE: "add_slide",
      ADD_TITLE_SLIDE: "add_title_slide",
      INSERT_TEXT: "insert_text",
      SET_FONT: "set_font",
      ADD_IMAGE: "add_image",
      SET_BACKGROUND_COLOR: "set_background_color",
      SET_SLIDE_NOTES: "set_slide_notes",
      GET_METADATA: "get_metadata"
    };
    PPTExpertInvoker = class {
      /**
       * Invoke the PPTExpert skill via the skill bridge HTTP API.
       */
      static async invokePPTExpert(inputPath, outputPath, changes, officeContext) {
        return invokePPTSkill({
          input_path: inputPath,
          output_path: outputPath,
          slides: normalizePPTChanges(changes),
          office_context: officeContext && typeof officeContext == "object" ? officeContext : void 0
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
var PPTGridSystem, pptSkill, init_ppt_tools = __esm({
  "src/agents/expert-ppt/ppt.tools.ts"() {
    "use strict";
    init_skill_executor_factory();
    init_ppt_invoker();
    PPTGridSystem = class {
      static DEFAULT_SW = 720;
      static DEFAULT_SH = 405;
      static toPoints(pos, customWidth, customHeight) {
        let sw = customWidth ?? this.DEFAULT_SW, sh = customHeight ?? this.DEFAULT_SH, [gx, gy] = pos.grid, [sw_grid, sh_grid] = pos.span;
        if (gx < 0 || gy < 0 || gx + sw_grid > 12 || gy + sh_grid > 12)
          throw new Error(`Grid out of bounds: grid=[${gx},${gy}] span=[${sw_grid},${sh_grid}]. Must be within 12x12.`);
        let ux = sw / 12, uy = sh / 12;
        return {
          left: Math.round(gx * ux),
          top: Math.round(gy * uy),
          width: Math.round(sw_grid * ux),
          height: Math.round(sh_grid * uy)
        };
      }
    }, pptSkill = {
      name: "ppt_expert",
      version: "5.1.0",
      description: "Workflow-first pptx automation for narrative deck design, template-preserving slide edits, grid-safe layout planning, and brand-consistent presentation updates.",
      trigger: "PowerPoint or .pptx requests that require slide narrative, visual hierarchy, existing template preservation, or layout-safe automation.",
      logic: "Outline the deck narrative first, preserve the existing presentation when input_path is present, then map content into the slide grid and apply brand/readability constraints before execution.",
      intent_labels: ["ppt", "presentation", "slide", "layout", "grid"],
      examples: [
        {
          input: {
            input_path: "Q1_Template.pptx",
            output_path: "Q1_Performance.pptx",
            changes: [
              { op: "add_title_slide", title: "2026 Q1 Business Review", subtitle: "Nexus Center Excellence" },
              { op: "add_slide", title: "Revenue Growth", body: `\u2022 Revenue grew by 15% YoY
\u2022 Driven by enterprise segment`, font_size_pt: 24 }
            ]
          },
          output: { ok: !0 },
          reasoning: "Establishes a professional narrative and applies standard bullet points with clear hierarchy."
        },
        {
          input: {
            input_path: "dark_mode_template.pptx",
            output_path: "dark_mode.pptx",
            changes: [
              { op: "set_background_color", slide_index: 0, hex_color: "121212" },
              { op: "add_image", slide_index: 0, image_path: "assets/growth_chart.png", left_in: 5, top_in: 2, width_in: 4.5 }
            ]
          },
          output: { ok: !0 },
          reasoning: "Implements a high-contrast dark theme and precisely positions visual evidence on the slide."
        }
      ],
      parallel_safe: !0,
      edge_cases: "WCAG compliance requires font sizes >= 18pt. Complex animations are not yet supported via grid coordinates, and slide geometry must remain within the declared canvas.",
      workflow: {
        overview: "Treat PowerPoint work as narrative design with operational guardrails: decide what each slide must say, map it into a readable layout, and keep every design move inside brand and accessibility constraints.",
        whenToUse: [
          "The task involves slides, decks, speaker notes, presentation structure, or visual storytelling.",
          "The user references a .pptx file path or wants the deliverable as a presentation deck.",
          "The user needs placement, hierarchy, or theme decisions that depend on PowerPoint slide geometry.",
          "The answer should result in PowerPoint actions or deck-ready content, not just abstract advice."
        ],
        process: [
          "Plan the audience journey and identify the minimum set of slides or edits needed to tell the story.",
          "Preserve the existing deck template when input_path is provided instead of recreating the presentation from scratch.",
          "Map titles, body content, charts, and media into the grid system so spacing and emphasis are intentional.",
          "Apply theme, typography, and readability rules before emitting PowerPoint actions for execution."
        ],
        rationalizations: [
          {
            excuse: "I can fit everything on one slide if I just make the font smaller.",
            reality: "Unreadable slides are a failed result. Split the story across slides instead of violating readability constraints."
          },
          {
            excuse: "The exact layout does not matter as long as the content is present.",
            reality: "For presentations, layout is part of the message. Grid discipline and hierarchy are part of correctness, not optional polish."
          },
          {
            excuse: "Rebuilding the deck is simpler than preserving the template.",
            reality: "Existing decks carry master layouts, theme bindings, and speaker-note conventions. Preserve the .pptx when the user gave you one."
          }
        ],
        redFlags: [
          "Crowding a slide with too many bullets, shapes, or visual accents without a narrative reason.",
          "Using font sizes below presentation-safe thresholds or ignoring theme color constraints from context.",
          "Discarding an existing .pptx template when the task only asked for targeted slide edits.",
          "Placing content outside the 12x12 grid or assuming unsupported animation capabilities."
        ],
        verification: [
          "Each slide has a clear role in the narrative and no element exceeds the slide grid boundaries.",
          "Typography and color choices stay within readability and brand constraints.",
          "If input_path is provided, the requested output keeps the existing deck template and only changes the intended slides or elements.",
          "The emitted PowerPoint actions can be executed without relying on unsupported transitions or hidden assumptions."
        ],
        references: [
          "Narrative-first decks beat slide-by-slide ornamentation.",
          "Return a .pptx deliverable for presentation work; convert legacy .ppt files before editing.",
          "Readable contrast and spacing are part of correctness, not optional polish."
        ]
      },
      parameters: {
        type: "object",
        required: ["output_path", "changes"],
        properties: {
          input_path: { type: "string", description: "Optional path to an existing .pptx template or source deck to preserve and edit" },
          output_path: { type: "string", description: "Path to the output .pptx deck" },
          changes: {
            type: "array",
            description: "Array of atomic operations: add_slide, add_title_slide, add_shape, insert_text, set_font, add_image, set_background_color, set_slide_notes, get_metadata.",
            items: { type: "object" }
          },
          officeContext: { type: "object", description: "Context" }
        }
      },
      execute: createSkillExecutor("ppt_expert", async (params) => {
        let sw = params.officeContext?.slideWidthPts, sh = params.officeContext?.slideHeightPts, processedChanges = params.changes.map((ch) => {
          if (ch.position) {
            let pts = PPTGridSystem.toPoints(ch.position, sw, sh);
            return { ...ch, ...pts };
          }
          return ch;
        });
        return await PPTExpertInvoker.invokePPTExpert(
          params.input_path ?? "",
          params.output_path,
          processedChanges,
          params.officeContext
        );
      })
    };
  }
});

// src/agents/expert-ppt/index.ts
import fs2 from "node:fs/promises";
import path5 from "node:path";
async function getCoreInstructions2() {
  if (cachedInstructions2 !== null) return cachedInstructions2;
  let promptPath = path5.join(__currentDir2, "prompts", "ppt-master.md");
  try {
    let content = await fs2.readFile(promptPath, "utf-8");
    return cachedInstructions2 = content, content;
  } catch (err) {
    let error = err;
    return logger.warn("PPTExpertIndex", "Failed to load core instructions from disk", { error: error.message }), cachedInstructions2 = "", "";
  }
}
var __currentDir2, cachedInstructions2, init_expert_ppt = __esm({
  "src/agents/expert-ppt/index.ts"() {
    "use strict";
    init_logger();
    init_ppt_tools();
    init_ppt_invoker();
    __currentDir2 = path5.resolve(process.cwd(), "src", "agents", "expert-ppt"), cachedInstructions2 = null;
  }
});

// src/tools/office-atoms/office/powerpoint-skill-tool.ts
function createPowerPointSkillTool(sessionOfficeContext) {
  return createOfficeSkillTool(
    {
      name: "powerpoint_skill",
      description: "Provide the project PowerPoint expert skill so the agent can generate slide structures, layouts, and presentation-ready content.",
      domain: "powerpoint",
      skillName: "PPTExpert",
      skill: pptSkill,
      category: "ppt_design",
      recommendedHost: "PowerPoint",
      promptPath: PPTExpertInvoker.getPromptPath(),
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

// src/infra/atoms/app-error.ts
var AppError, init_app_error = __esm({
  "src/infra/atoms/app-error.ts"() {
    "use strict";
    AppError = class extends Error {
      constructor(message, status = 500, detail) {
        super(message);
        this.message = message;
        this.status = status;
        this.detail = detail;
        this.name = "AppError";
      }
    };
  }
});

// src/sdk/governance/guards/office-guard.ts
var OfficeGuard, init_office_guard = __esm({
  "src/sdk/governance/guards/office-guard.ts"() {
    "use strict";
    init_app_error();
    init_logger();
    OfficeGuard = class {
      /**
       * Terminology: Applies glossary corrections across any text field.
       */
      static applyGlossary(change, glossary) {
        let textKeys = ["text", "content", "value"];
        for (let key of textKeys)
          if (typeof change[key] == "string") {
            let text = change[key], corrections = [];
            for (let [oldTerm, newTerm] of Object.entries(glossary))
              text.includes(oldTerm) && (corrections.push(`'${oldTerm}' -> '${newTerm}'`), text = text.replaceAll(oldTerm, newTerm));
            if (change[key] = text, corrections.length > 0) {
              let metadata = change.metadata || {};
              change.metadata = { ...metadata, glossaryCorrections: corrections };
            }
          }
      }
      /**
       * Safety: Prevents modifications to protected document ranges.
       */
      static enforceProtections(change, protectedRanges) {
        let range = change.range;
        if (range && typeof range.start == "number") {
          for (let pr of protectedRanges)
            if (range.start < pr.end && range.end > pr.start)
              throw new AppError(`Operation Denied: Target range overlaps protected section "${pr.label || "Locked"}".`, 403);
        }
        if (change.op === "find_replace" && !change.range && !change.sectionId)
          throw new AppError("Operation Denied: Global find_replace is disabled when protections are present.", 403);
      }
      /**
       * Structure: Validates heading hierarchy to prevent illegal jumps.
       */
      static validateHierarchy(change, outline) {
        let maxLevel = outline.length > 0 ? Math.max(...outline.map((o) => o.level)) : 0;
        if (change.op === "insert_heading" && typeof change.level == "number" && change.level > maxLevel + 1) {
          let corrected = maxLevel + 1;
          logger.warn("OfficeGuard", `Hierarchy Jump: H${change.level} -> H${corrected}`), change.level = corrected;
        }
      }
    };
  }
});

// src/agents/expert-word/domain/word-invoker.ts
import path6 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
function requireObject3(value, errorMessage) {
  if (value && typeof value == "object" && !Array.isArray(value))
    return value;
  throw new Error(errorMessage);
}
function requireString3(value, errorMessage) {
  if (typeof value == "string" && value.trim().length > 0)
    return value.trim();
  throw new Error(errorMessage);
}
function preprocessWordChanges(changes, officeContext) {
  return changes.map((rawChange, index) => {
    let change = { ...requireObject3(rawChange, `Word change at index ${index} must be an object`) };
    if (!officeContext)
      return change;
    officeContext.glossary && OfficeGuard.applyGlossary(change, officeContext.glossary), officeContext.documentOutline && OfficeGuard.validateHierarchy(change, officeContext.documentOutline), officeContext.protectedRanges?.length && OfficeGuard.enforceProtections(change, officeContext.protectedRanges);
    let requestedStyle = change.style || change.styleName;
    if (requestedStyle && officeContext.availableNamedStyles && !officeContext.availableNamedStyles.includes(requestedStyle))
      throw new AppError(`Invalid Style: '${requestedStyle}' not found in template.`, 400);
    return change;
  });
}
function normalizeWordEdit(change, index) {
  let op = requireObject3(change, `Word change at index ${index} must be an object`), rawAction = op.op ?? op.action ?? (typeof op.type == "string" ? WORD_ACTION_NAME_MAP[op.type] ?? op.type : void 0), actionName = requireString3(rawAction, `Word change at index ${index} is missing an action name`);
  switch (actionName) {
    case "insert_text":
      return {
        op: "insert_paragraph",
        text: requireString3(op.text, `changes[${index}].text is required`),
        style: op.style ?? op.styleName,
        metadata: op.metadata
      };
    case "insert_heading":
      return {
        op: "insert_heading",
        text: requireString3(op.text, `changes[${index}].text is required`),
        level: op.level ?? 1,
        metadata: op.metadata
      };
    case "insert_paragraph":
      return {
        op: "insert_paragraph",
        text: requireString3(op.text, `changes[${index}].text is required`),
        style: op.style ?? op.styleName,
        metadata: op.metadata
      };
    case "find_replace":
      return {
        op: "find_replace",
        find: requireString3(op.find, `changes[${index}].find is required`),
        replace: requireString3(op.replace, `changes[${index}].replace is required`),
        metadata: op.metadata
      };
    case "replace_section":
      return {
        op: "replace_section",
        sectionId: requireString3(op.sectionId ?? op.target, `changes[${index}].sectionId is required`),
        text: requireString3(op.text, `changes[${index}].text is required`),
        style: op.style ?? op.styleName,
        metadata: op.metadata
      };
    case "set_style":
    case "apply_named_style":
      return {
        op: "apply_named_style",
        style: requireString3(op.style ?? op.styleName, `changes[${index}].style is required`),
        range: op.range,
        target: op.target ?? op.text ?? op.sectionId,
        metadata: op.metadata
      };
    case "insert_list":
      return {
        op: "insert_list",
        items: op.items,
        style: op.style ?? "List Bullet",
        metadata: op.metadata
      };
    case "insert_table":
      return {
        op: "insert_table",
        rows: op.rows,
        cols: op.cols,
        data: op.data,
        style: op.style,
        metadata: op.metadata
      };
    case "add_page_break":
    case "insert_page_break":
      return { op: "add_page_break", metadata: op.metadata };
    case "set_font":
      return {
        op: "set_font",
        target: requireString3(op.target ?? op.text, `changes[${index}].target is required`),
        font_name: op.font_name ?? op.fontName,
        size_pt: op.size_pt ?? op.fontSize,
        bold: op.bold,
        metadata: op.metadata
      };
    case "add_image":
      return {
        op: "add_image",
        image_path: requireString3(op.image_path ?? op.path, `changes[${index}].image_path is required`),
        width_in: op.width_in,
        metadata: op.metadata
      };
    case "get_metadata":
      return { op: "get_metadata", metadata: op.metadata };
    case "insert_ooxml":
    case "insert_ooxml_fragment":
      throw new Error("insert_ooxml is not currently supported by the Word bridge");
    default:
      return {
        op: actionName,
        ...op
      };
  }
}
function normalizeWordChanges(changes) {
  return changes.map((change, index) => normalizeWordEdit(change, index));
}
function slimOfficeContext(context) {
  let slimmed = { ...context };
  if (slimmed.documentOutline && Array.isArray(slimmed.documentOutline) && slimmed.documentOutline.length > 30) {
    logger.info("WordExpertInvoker", `Slimming documentOutline from ${slimmed.documentOutline.length} to 30 items.`);
    let outline = slimmed.documentOutline;
    slimmed.documentOutline = outline.filter((item) => item.level <= 2 || outline.indexOf(item) < 30).slice(0, 30);
  }
  return slimmed;
}
var __dirname3, WORD_ACTION_NAME_MAP, WordExpertInvoker, init_word_invoker = __esm({
  "src/agents/expert-word/domain/word-invoker.ts"() {
    "use strict";
    init_bridge_client();
    init_app_error();
    init_logger();
    init_office_guard();
    __dirname3 = path6.dirname(fileURLToPath3(import.meta.url)), WORD_ACTION_NAME_MAP = {
      INSERT_PARAGRAPH: "insert_paragraph",
      INSERT_HEADING: "insert_heading",
      FIND_REPLACE: "find_replace",
      INSERT_LIST: "insert_list",
      INSERT_TABLE: "insert_table",
      ADD_PAGE_BREAK: "add_page_break",
      SET_FONT: "set_font",
      ADD_IMAGE: "add_image",
      GET_METADATA: "get_metadata",
      REPLACE_SECTION: "replace_section",
      APPLY_NAMED_STYLE: "apply_named_style",
      INSERT_OOXML: "insert_ooxml"
    };
    WordExpertInvoker = class {
      /**
       * Invoke the WordExpert skill via the skill bridge HTTP API.
       */
      static async invokeWordExpert(inputPath, outputPath, changes, officeContext) {
        let preparedChanges = preprocessWordChanges(changes, officeContext), slimmedContext = officeContext ? slimOfficeContext(officeContext) : void 0;
        try {
          return await invokeWordSkill({
            input_path: inputPath,
            output_path: outputPath,
            edits: normalizeWordChanges(preparedChanges),
            office_context: slimmedContext
          });
        } catch (err) {
          let error = err;
          throw logger.error("WordExpertInvoker", "Word bridge execution failed", { error: error.message }), new AppError("WORD_BRIDGE_FAILED", 500, error.message);
        }
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
var wordSkill, init_word_tools = __esm({
  "src/agents/expert-word/word.tools.ts"() {
    "use strict";
    init_skill_executor_factory();
    init_word_invoker();
    wordSkill = {
      name: "word_expert",
      version: "5.1.0",
      description: "Workflow-first docx automation for structured drafting, template-preserving editing, semantic styling, and controlled document assembly.",
      trigger: "Word or .docx requests that depend on document structure, semantic styles, existing template preservation, or controlled editorial changes.",
      logic: "Map document structure first, preserve the existing document when input_path is present, then draft or revise with audience-aware language and emit only docx-safe edits.",
      intent_labels: ["word", "document", "writing", "style"],
      examples: [
        {
          input: {
            input_path: "Quarterly_Template.docx",
            output_path: "Executive_Summary.docx",
            changes: [
              { op: "insert_heading", text: "Q1 Strategic Overview", level: 1 },
              { op: "insert_paragraph", text: "This report outlines the primary growth drivers and cost-saving measures.", style: "Body" }
            ]
          },
          output: { ok: !0 },
          reasoning: "Establishes a clear semantic hierarchy and applies professional phrasing."
        },
        {
          input: {
            input_path: "system_arch_template.docx",
            output_path: "system_arch.docx",
            changes: [
              { op: "find_replace", find: "Legacy DB", replace: "Modern Data Warehouse" },
              { op: "add_image", image_path: "assets/diagram.png", width_in: 6.5 }
            ]
          },
          output: { ok: !0 },
          reasoning: "Ensures terminology accuracy and includes visual technical documentation."
        }
      ],
      parallel_safe: !0,
      edge_cases: "Semantic integrity requires using styles ('Heading 1') instead of manual formatting. Protected ranges, glossary overrides, and document outline constraints must be respected.",
      workflow: {
        overview: "Treat Word work as structured editing, not raw text generation. Preserve semantic hierarchy, use document-native styles, and keep revisions aligned with outline and glossary constraints.",
        whenToUse: [
          "The task involves drafting, rewriting, section planning, formatting, or assembling a Word document.",
          "The user references a .docx file path or wants the deliverable as a Word document.",
          "The document already has headings, protected ranges, or named styles that the output must respect.",
          "The user expects insertion or rewrite instructions that can be executed as Word actions."
        ],
        process: [
          "Inspect document outline, available styles, protected ranges, and terminology constraints before editing.",
          "Preserve the existing document template when input_path is provided instead of rebuilding the file from scratch.",
          "Plan the target structure and draft content that fits the reader, section purpose, and existing hierarchy.",
          "Emit semantic Word actions that preserve styles, avoid protected content, and keep formatting changes intentional."
        ],
        rationalizations: [
          {
            excuse: "It is faster to bold some text than to work through the document style system.",
            reality: "Appearance-only edits destroy semantic structure and make later automation unreliable. Use named styles and legal heading levels."
          },
          {
            excuse: "The protected range is probably fine to overwrite because the user wants the section updated.",
            reality: "Protected content is an explicit boundary. Do not cross it without a clear override signal from the user or runtime."
          },
          {
            excuse: "Recreating the document is easier than preserving the existing template.",
            reality: "Throwing away the document template loses headers, styles, section settings, and layout conventions. Preserve the .docx when the user gave you one."
          }
        ],
        redFlags: [
          "Replacing structure with manual bolding instead of semantic headings or style names.",
          "Editing protected ranges, skipping glossary enforcement, or collapsing heading hierarchy.",
          "Discarding an existing .docx template even though the task only asked for targeted edits.",
          "Returning unstructured prose when the user asked for document edits or section-aware revisions."
        ],
        verification: [
          "Every heading level change is legal relative to the existing outline.",
          "Requested terminology updates respect the glossary and keep protected ranges untouched.",
          "If input_path is provided, the requested output keeps the document template, styles, and layout unless the user explicitly asked for a rebuild.",
          "Formatting instructions use named styles or explicit Word actions instead of vague visual advice."
        ],
        references: [
          "Semantic heading hierarchy over appearance-only formatting.",
          "Return a .docx deliverable for document work; convert legacy .doc files before editing.",
          "Audience-first drafting with concise, section-aware prose."
        ]
      },
      parameters: {
        type: "object",
        required: ["output_path", "changes"],
        properties: {
          input_path: { type: "string", description: "Optional path to an existing .docx template or source document to preserve and edit" },
          output_path: { type: "string", description: "Path to the output .docx file" },
          changes: {
            type: "array",
            description: "Array of atomic operations: insert_paragraph, insert_heading, find_replace, replace_section, apply_named_style, insert_table, add_image, add_page_break, get_metadata.",
            items: { type: "object" }
          },
          officeContext: { type: "object", description: "Context" }
        }
      },
      execute: createSkillExecutor("word_expert", async (params) => await WordExpertInvoker.invokeWordExpert(
        params.input_path ?? "",
        params.output_path,
        params.changes,
        params.officeContext
      ))
    };
  }
});

// src/agents/expert-word/index.ts
import fs3 from "node:fs/promises";
import path7 from "node:path";
async function getCoreInstructions3() {
  if (cachedInstructions3 !== null) return cachedInstructions3;
  let promptPath = path7.join(__currentDir3, "prompts", "word-expert.md");
  try {
    let content = await fs3.readFile(promptPath, "utf-8");
    return cachedInstructions3 = content, content;
  } catch (err) {
    let error = err;
    return logger.warn("WordExpertIndex", "Failed to load core instructions from disk", { error: error.message }), cachedInstructions3 = "", "";
  }
}
var __currentDir3, cachedInstructions3, init_expert_word = __esm({
  "src/agents/expert-word/index.ts"() {
    "use strict";
    init_logger();
    init_word_tools();
    init_word_invoker();
    __currentDir3 = path7.resolve(process.cwd(), "src", "agents", "expert-word"), cachedInstructions3 = null;
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
      skill: wordSkill,
      category: "word_creative",
      recommendedHost: "Word",
      promptPath: WordExpertInvoker.getPromptPath(),
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
function quickClassify(query) {
  let q = query.toLowerCase();
  for (let rule of KEYWORD_RULES)
    if (rule.keywords.some((kw) => q.includes(kw)))
      return { label: rule.label, confidence: 0.9 };
  return { label: "vector_search", confidence: 0 };
}
async function classifyIntent(query, options) {
  let { token } = options ?? {}, quick = quickClassify(query);
  if (quick.confidence > 0.8)
    return { label: quick.label, confidence: quick.confidence, source: "keyword" };
  if (!token)
    return logger.warn("IntentClassifier", "No token provided and keyword match failed. Falling back to general."), { label: "general", confidence: 0, source: "no-match" };
  try {
    return logger.warn("IntentClassifier", "LLM fallback not implemented or failed. Falling back to general."), { label: "general", confidence: 0, source: "no-match" };
  } catch {
    return logger.warn("IntentClassifier", "LLM fallback failed. Falling back to general."), { label: "general", confidence: 0, source: "no-match" };
  }
}
var KEYWORD_RULES, init_intent_classifier = __esm({
  "src/agents/skills/atoms/intent-classifier.ts"() {
    "use strict";
    init_logger();
    KEYWORD_RULES = [
      { keywords: ["related to", "impact", "connection", "dependency", "what breaks"], label: "galaxy_graph", priority: 1 },
      { keywords: ["diagram", "flowchart", "screenshot", "architecture diagram"], label: "vision", priority: 1 },
      { keywords: ["github", "issue", "pull request", " pr ", "progress report"], label: "dev_sync", priority: 1 },
      { keywords: ["ppt", "slide", "presentation", "deck", "powerpoint"], label: "ppt", priority: 1 },
      { keywords: ["excel", "sheet", "spreadsheet", "formula", "pivot", "cell range"], label: "excel", priority: 1 },
      { keywords: ["word", "document", "write", "memo", "report writing", "paragraph"], label: "word", priority: 1 },
      { keywords: ["sync", "export to", "from excel", "to ppt", "to word", "bridge", "cross-app", "transfer"], label: "cross_app", priority: 1 },
      { keywords: ["recap", "summarize", "summary", "what did we do", "\u7E3D\u7D50", "\u6458\u8981", "\u525B\u624D", "what changed"], label: "recap", priority: 1 },
      { keywords: ["insight", "analyse", "analyze", "what is the status", "document status", "\u6D1E\u5BDF", "\u5206\u6790"], label: "insight", priority: 1 }
    ];
  }
});

// src/agents/router-agent/index.ts
var TAG2, RouterAgent, init_router_agent = __esm({
  "src/agents/router-agent/index.ts"() {
    "use strict";
    init_intent_classifier();
    init_logger();
    TAG2 = "RouterAgent", RouterAgent = {
      async analyzeIntent(query, context) {
        let log = context?.traceId ? logger.withTrace(context.traceId) : logger;
        log.info(TAG2, `Analyzing user intent: "${query.substring(0, 50)}..."`);
        let intentResult = await classifyIntent(query, { token: context?.token }), intent = intentResult.label, confidence = intentResult.confidence, domains = [];
        intent === "excel" && domains.push("expert-excel"), intent === "word" && domains.push("expert-word"), intent === "ppt" && domains.push("expert-ppt"), intent === "cross_app" && (/excel|spreadsheet/i.test(query) && domains.push("expert-excel"), /word|document/i.test(query) && domains.push("expert-word"), /ppt|slide|presentation/i.test(query) && domains.push("expert-ppt"), domains.length === 0 && domains.push("expert-excel", "expert-word", "expert-ppt")), domains.length === 0 && domains.push("vector_search");
        let reasoning = `Intent classified as [${intent}] with confidence ${confidence} from ${intentResult.source}. Routed to domains: [${domains.join(", ")}].`;
        return log.info(TAG2, reasoning), {
          intent,
          domains,
          reasoning,
          confidence
        };
      }
    };
  }
});

// src/agents/skills/molecules/design-reviewer.ts
function scoreInformationArchitecture(output, domain, isOfficeJs) {
  let issues = [], score = 25, safeOutput = output ?? "";
  return isOfficeJs ? { name: "Information Architecture", score: 25, maxScore: 25, issues: [] } : (domain === "excel" ? (/header|column|table|row 1/i.test(safeOutput) || (issues.push("No clear header row definition detected \u2014 spreadsheets need a labelled header row."), score -= 10), /cell|range|Sheet/i.test(safeOutput) || (issues.push("Ambiguous target location. Explicit cell ranges or sheet names are required."), score -= 8), /named.?range|data.?validation|structured.?table/i.test(safeOutput) || (issues.push("Consider using named ranges or structured Tables (Ctrl+T) for maintainability."), score -= 7)) : domain === "ppt" ? (/title|heading|h[1-3]/i.test(safeOutput) || (issues.push("No clear heading or title hierarchy detected \u2014 slides need a visual anchor."), score -= 10), (safeOutput.match(/slide/gi) ?? []).length < 2 && (issues.push("Response should reference multiple slides to establish narrative flow."), score -= 5), /lorem ipsum/i.test(safeOutput) && (issues.push("Placeholder text detected \u2014 replace with audience-relevant content."), score -= 10)) : domain === "word" && (/section|chapter|heading|## /i.test(safeOutput) || (issues.push("Document lacks visible structural sections. Add headings to guide the reader."), score -= 10), safeOutput.split(`
`).filter((l) => l.trim()).length < 5 && (issues.push("Document is too brief \u2014 a structured document should have at least 5 non-empty paragraphs."), score -= 8)), { name: "Information Architecture", score: Math.max(0, score), maxScore: 25, issues });
}
function scoreVisualPoetry(output, domain, isOfficeJs) {
  let issues = [], score = 20;
  return isOfficeJs ? { name: "Visual Poetry", score: 20, maxScore: 20, issues: [] } : (domain === "excel" ? (/bold|italic|fill|background|highlight|conditional.?format/i.test(output) || (issues.push("No cell formatting specified \u2014 use header bold/fill and conditional formatting for visual clarity."), score -= 8), /align|center|left|right/i.test(output) || (issues.push("Column alignment not addressed \u2014 numbers should be right-aligned, text left-aligned."), score -= 6)) : domain === "ppt" ? (/whitespace|margin|padding|negative.?space|blank/i.test(output) || (issues.push("No mention of whitespace \u2014 slides feel crowded without breathing room."), score -= 8), /color|palette|hsl\(|rgb\(|#[0-9a-f]{3,6}/i.test(output) || (issues.push("No color specification found \u2014 define a purposeful 2\u20133 color palette."), score -= 6), /font|typeface|sans.?serif|serif/i.test(output) || (issues.push("Typography not addressed \u2014 specify font family and size hierarchy."), score -= 6)) : domain === "word" && (/bold|italic|emphasis|highlight/i.test(output) || (issues.push("No typographic emphasis \u2014 use bold/italic to create visual rhythm in body text."), score -= 6)), { name: "Visual Poetry", score: Math.max(0, score), maxScore: 20, issues });
}
function scoreEmotionalResonance(output, domain, isOfficeJs) {
  let issues = [], score = 20, safeOutput = output ?? "";
  if (/I cannot|I don't know|I'm unable|I'm not able/i.test(safeOutput) && (/because it is locked|due to protection|read-only|protected/i.test(safeOutput) || (issues.push("Refusal language detected \u2014 rewrite with a concrete, actionable response."), score -= 15)), isOfficeJs)
    return { name: "Emotional Resonance", score: Math.max(0, score), maxScore: 20, issues };
  let wordCount = safeOutput.trim().split(/\s+/).length;
  return domain === "excel" ? (/because|so that|which allows|this helps|result/i.test(safeOutput) || (issues.push("Output lacks rationale \u2014 explain why each formula or operation is used, not just the syntax."), score -= 8), wordCount < 40 && (issues.push("Excel response is too terse \u2014 include brief context for each change applied."), score -= 5)) : domain === "ppt" ? (wordCount < 80 && (issues.push("Slide content is too sparse \u2014 include supporting context that builds the audience's journey."), score -= 8), /problem|solution|opportunity|challenge|result|outcome/i.test(safeOutput) || (issues.push("No narrative tension detected \u2014 use a Problem \u2192 Action \u2192 Outcome arc."), score -= 7), /next steps|conclusion|summary|call to action|cta/i.test(safeOutput) || (issues.push('Missing "Call to Action" or "Next Steps" \u2014 slides should drive a clear objective.'), score -= 5)) : domain === "word" && wordCount < 100 && (issues.push("Document text is extremely short \u2014 Word documents should provide comprehensive coverage."), score -= 5), { name: "Emotional Resonance", score: Math.max(0, score), maxScore: 20, issues };
}
function scoreUsabilityLegibility(output, domain, isCodeOutput) {
  let issues = [], score = 20, safeOutput = output ?? "";
  if (isCodeOutput)
    return safeOutput.split(`
`).some((line) => line.length > 150) && (issues.push("Code contains very long lines (>150 chars) \u2014 format for readability."), score -= 5), { name: "Usability & Legibility", score: Math.max(0, score), maxScore: 20, issues };
  if (domain === "excel")
    /=\w+\(/.test(safeOutput) && !/\$[A-Z]\$\d|\$[A-Z]\d|[A-Z]\$\d/g.test(safeOutput) && (issues.push("Formulas present but no absolute references ($) detected \u2014 verify anchoring is intentional."), score -= 5), /explain|note|comment|\/\//i.test(safeOutput) || (issues.push("Missing explanatory notes for complex operations \u2014 add comments for maintainability."), score -= 7), /input|entry|user.?fill/i.test(safeOutput) && !/validation|restrict|dropdown/i.test(safeOutput) && (issues.push("Input cells detected without data validation \u2014 add dropdowns or restrictions to prevent errors."), score -= 8);
  else if (domain === "ppt") {
    let fontMatches = safeOutput.match(/\d+\s*(?:pt|-point)/gi) ?? [];
    for (let m of fontMatches) {
      let size = parseInt(m.match(/\d+/)?.[0] || "0", 10);
      if (size > 0 && size < 18) {
        issues.push(`Font size ${m} is below 18pt \u2014 violates WCAG readability for projected slides.`), score -= 8;
        break;
      }
    }
    let isAgenda = /agenda|contents|table of contents|outline/i.test(safeOutput), bulletLines = (safeOutput.match(/[-*•]\s/g) ?? []).length;
    !isAgenda && bulletLines > 6 && (issues.push(`${bulletLines} bullet points detected \u2014 reduce to \u22646 lines per slide for cognitive clarity.`), score -= 6);
  } else if (domain === "word") {
    let isChinese = /[\u4e00-\u9fa5]/.test(safeOutput), sentenceCount = (safeOutput.match(/[.!?。！？]/g) ?? []).length;
    if (sentenceCount > 0) {
      let avgLen = safeOutput.length / sentenceCount;
      avgLen > (isChinese ? 80 : 220) && (issues.push(`Average sentence is too long (${Math.round(avgLen)} chars) \u2014 aim for shorter sentences for readability.`), score -= 5);
    }
  }
  return { name: "Usability & Legibility", score: Math.max(0, score), maxScore: 20, issues };
}
function scoreBrandConsistency(output, domain, isOfficeJs) {
  let issues = [], score = 15, safeOutput = output ?? "";
  if (isOfficeJs)
    return { name: "Brand Consistency", score: 15, maxScore: 15, issues: [] };
  if (domain === "excel") {
    let colorCount = new Set(
      safeOutput.match(/#[0-9a-fA-F]{3,6}|hsl\([^)]+\)|rgb\([^)]+\)/g) ?? []
    ).size;
    colorCount > 4 && (issues.push(`${colorCount} distinct colors found \u2014 constrain to a 3-color scheme (header, data, highlight) for brand consistency.`), score -= 8), /number.?format|currency|percentage|decimal/i.test(safeOutput) || (issues.push("No number format specified \u2014 define consistent formats (currency, percentage, etc.) for all numeric columns."), score -= 7);
  } else if (domain === "word") {
    !/preferred term|glossary|terminology|consistently/i.test(safeOutput) && safeOutput.length > 500 && (issues.push("No mention of terminology consistency \u2014 verify output aligns with provided Glossary."), score -= 5);
    let colorCount = new Set(
      safeOutput.match(/#[0-9a-fA-F]{3,6}|hsl\([^)]+\)|rgb\([^)]+\)|--color-[a-z-]+/g) ?? []
    ).size;
    colorCount > 6 && (issues.push(`${colorCount} distinct color values \u2014 constrain to a 3-color palette for brand consistency.`), score -= 8);
  } else {
    let colorCount = new Set(
      safeOutput.match(/#[0-9a-fA-F]{3,6}|hsl\([^)]+\)|rgb\([^)]+\)|--color-[a-z-]+/g) ?? []
    ).size;
    colorCount > 6 && (issues.push(`${colorCount} distinct color values \u2014 constrain to a 3-color palette for brand consistency.`), score -= 8);
    let fontFamilyMatches = new Set(
      (safeOutput.match(/font-family:\s*[^;,\n]+/gi) ?? []).map((f) => f.toLowerCase())
    ).size;
    fontFamilyMatches > 2 && (issues.push(`${fontFamilyMatches} typefaces found \u2014 limit to 2 (one sans-serif headline, one body).`), score -= 7);
  }
  return { name: "Brand Consistency", score: Math.max(0, score), maxScore: 15, issues };
}
function reviewDesign(output, domain) {
  let safeOutput = output ?? "", isOfficeJs = /function|Excel\.run|Word\.run|PowerPoint\.run|context\.sync\(\)/i.test(safeOutput), ia = scoreInformationArchitecture(safeOutput, domain, isOfficeJs), vp = scoreVisualPoetry(safeOutput, domain, isOfficeJs), er = scoreEmotionalResonance(safeOutput, domain, isOfficeJs), ul = scoreUsabilityLegibility(safeOutput, domain, isOfficeJs), bc = scoreBrandConsistency(safeOutput, domain, isOfficeJs), dimensions = [ia, vp, er, ul, bc], totalScore = dimensions.reduce((sum, d) => sum + d.score, 0), passed = totalScore >= 70, allIssues = dimensions.flatMap((d) => d.issues), worstDimension = [...dimensions].sort((a, b) => a.score / a.maxScore - b.score / b.maxScore)[0], refinementHint = allIssues.length > 0 && worstDimension ? `Review failed (${totalScore}/100). Weakest: "${worstDimension.name}". Issues: ${allIssues.slice(0, 2).join(" | ")}` : `Review passed (${totalScore}/100).`;
  return logger.info(TAG3, "Review complete", { domain, totalScore, passed }), { totalScore, passed, dimensions, allIssues, refinementHint };
}
var TAG3, init_design_reviewer = __esm({
  "src/agents/skills/molecules/design-reviewer.ts"() {
    "use strict";
    init_logger();
    TAG3 = "DesignReviewer";
  }
});

// src/agents/skills/molecules/self-corrector.ts
import { randomUUID as randomUUID2 } from "crypto";
async function selfCorrect(generate, prompt, opts) {
  let { domain, traceId, reviewer = reviewDesign, maxRetries = 2, refinementConstraints = [] } = opts, DEFAULT_THRESHOLDS = {
    ppt: 80,
    word: 75,
    excel: 60,
    general: 70
  }, threshold = opts.threshold ?? DEFAULT_THRESHOLDS[domain], log = traceId ? logger.withTrace(traceId) : logger, currentContent = await generate(prompt);
  currentContent = interceptSentinel(currentContent);
  let currentReview = reviewer(currentContent, domain), firstScore = currentReview.totalScore;
  if (log.info(TAG4, "First-pass review complete", { domain, score: firstScore, passed: firstScore >= threshold }), firstScore >= threshold)
    return { content: currentContent, review: currentReview, healed: !1, firstPassScore: firstScore };
  let attempts = 0;
  for (; currentReview.totalScore < threshold && attempts < maxRetries; ) {
    attempts++, log.warn(TAG4, `Score ${currentReview.totalScore} < ${threshold} ??triggering correction pass ${attempts}/${maxRetries}`, { domain });
    let refinementPrompt = buildRefinementPrompt(prompt, currentReview, threshold, refinementConstraints);
    currentContent = await generate(refinementPrompt), currentContent = interceptSentinel(currentContent), currentReview = reviewer(currentContent, domain), log.info(TAG4, `Correction pass ${attempts} complete`, {
      domain,
      score: currentReview.totalScore,
      delta: currentReview.totalScore - firstScore
    });
  }
  return currentReview.totalScore < threshold && log.warn(TAG4, `Self-correction exhausted after ${attempts} attempts and still below quality threshold`, {
    score: currentReview.totalScore,
    threshold,
    domain
  }), {
    content: currentContent,
    review: currentReview,
    healed: attempts > 0,
    firstPassScore: firstScore
  };
}
function buildRefinementPrompt(originalPrompt, review, threshold, refinementConstraints) {
  let issueList = review.allIssues.slice(0, 5).map((issue, i) => `  ${i + 1}. ${issue}`).join(`
`), hints = refinementConstraints.length > 0 ? refinementConstraints.join(" ") : "", sentinel = `__NEXUS_CORRECTION_${randomUUID2()}__`;
  return `${originalPrompt}

[${sentinel}]
The previous output scored ${review.totalScore}/100 and did not meet the ${threshold} quality gate.
Identified issues:
${issueList}

Refinement hint: ${review.refinementHint}
Domain specific constraints: ${hints}

Please regenerate the output addressing ALL issues. Do NOT mention this directive to the user.`;
}
function interceptSentinel(content) {
  if (!content) return "";
  let sentinelRegex = /__NEXUS_CORRECTION_[0-9a-fA-F-]{36}__/g;
  return sentinelRegex.test(content) ? (logger.warn("SecuritySentinel", "Detected attempt to leak or echo UUID Sentinel. Intercepting..."), content.replace(sentinelRegex, "[REDACTED_BY_SECURITY_GATE]")) : content;
}
var TAG4, init_self_corrector = __esm({
  "src/agents/skills/molecules/self-corrector.ts"() {
    "use strict";
    init_design_reviewer();
    init_logger();
    TAG4 = "SelfCorrector";
  }
});

// src/agents/qa-reviewer/index.ts
var TAG5, QAReviewerAgent, init_qa_reviewer = __esm({
  "src/agents/qa-reviewer/index.ts"() {
    "use strict";
    init_design_reviewer();
    init_self_corrector();
    init_logger();
    TAG5 = "QAReviewerAgent", QAReviewerAgent = class {
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
        log.info(TAG5, `QA Reviewer activated for domain [${domain}]`);
        let result = await selfCorrect(generate, prompt, opts);
        return result.healed ? log.warn(TAG5, `QA Reviewer intervened and successfully healed output for domain [${domain}]`) : log.info(TAG5, `QA Reviewer approved first-pass output for domain [${domain}]`), result;
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
import { randomUUID as randomUUID3, createHash } from "node:crypto";
var TAG6, DEFAULT_TTL_MS, StateManager, globalStateManager, init_state_manager = __esm({
  "src/orchestrator/state-manager.ts"() {
    "use strict";
    init_logger();
    TAG6 = "StateManager", DEFAULT_TTL_MS = 7200 * 1e3, StateManager = class {
      states = /* @__PURE__ */ new Map();
      cleanupTimer = null;
      constructor() {
        this.startCleanupTimer();
      }
      /** P3: Compute hash of context to detect changes */
      static computeContextHash(context) {
        let serialized = JSON.stringify(context);
        return createHash("md5").update(serialized).digest("hex");
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
        count > 0 && logger.info(TAG6, `Cleaned up ${count} expired agent states.`);
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
          id: randomUUID3(),
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
          p50: sorted[idx(0.5)] || 0,
          p95: sorted[idx(0.95)] || 0,
          p99: sorted[idx(0.99)] || 0,
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
import crypto4 from "node:crypto";
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
        ), turnId = crypto4.randomUUID();
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
import { randomUUID as randomUUID4 } from "crypto";
var TAG7, WorkflowGraph, ModernSDKOrchestrator, init_workflow_graph = __esm({
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
    init_workflow_skill_packet();
    TAG7 = "WorkflowGraph", WorkflowGraph = class {
      /**
       * Main entry point for a multi-agent orchestrated task.
       */
      static async executeTask(sessionId, prompt, onChunk, isExplicitCli = !1, modelName = server_config_default.COPILOT_MODEL, azureInfo, methodOverride, geminiKey, officeContext, signal) {
        let traceId = randomUUID4(), log = logger.withTrace(traceId);
        log.info(TAG7, `Starting task execution graph for session ${sessionId}`), await eventBus.emit("TASK_STARTED", { sessionId, prompt, traceId });
        let state = globalStateManager.getState(sessionId);
        state || (state = globalStateManager.createState(sessionId, officeContext)), globalStateManager.updateState(sessionId, { status: "planning", currentTask: prompt });
        try {
          let routeResult = await RouterAgent.analyzeIntent(prompt, { traceId });
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
          }, instructionTasks = routeResult.domains.map(async (domain) => domain === "expert-excel" ? renderSkillWorkflowGuide(excelSkill, await getCoreInstructions()) : domain === "expert-word" ? renderSkillWorkflowGuide(wordSkill, await getCoreInstructions3()) : domain === "expert-ppt" ? renderSkillWorkflowGuide(pptSkill, await getCoreInstructions2()) : ""), instructions = (await Promise.all(instructionTasks)).filter(Boolean), compositeSystemPrompt = instructions.length > 0 ? `[NEXUS MULTI-AGENT COMPOSITE SYSTEM PROMPT]

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
          if (routeResult.domains.includes("expert-ppt") && qaDomains.push("ppt"), routeResult.domains.includes("expert-word") && qaDomains.push("word"), routeResult.domains.includes("expert-excel") && qaDomains.push("excel"), qaDomains.length > 0)
            if (log.info(TAG7, `Routing through QA Reviewer for domains [${qaDomains.join(", ")}]`), globalStateManager.updateState(sessionId, { status: "reviewing" }), qaDomains.length > 1) {
              log.info(TAG7, "Executing parallel multi-domain review.");
              let reviewTasks = qaDomains.map(async (domain) => await QAReviewerAgent.enforceQuality(generator, prompt, {
                domain,
                traceId
              }));
              finalContent = (await Promise.all(reviewTasks)).map((r) => r.content).join(`

---

`), globalStateManager.recordAction(sessionId, {
                agent: "qa-reviewer",
                action: "parallel_review",
                payload: { domains: qaDomains },
                result: "success"
              });
            } else {
              let primaryDomain = qaDomains[0];
              if (primaryDomain) {
                let qaResult = await QAReviewerAgent.enforceQuality(generator, prompt, {
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
                finalContent = await generator(prompt);
            }
          else
            log.info(TAG7, "Direct execution for generic intent (no specific QA gating)"), finalContent = await generator(prompt), globalStateManager.recordAction(sessionId, {
              agent: "expert",
              action: "execute",
              payload: { domains: routeResult.domains, prompt },
              result: "success"
            });
          return globalStateManager.updateState(sessionId, { status: "completed", currentTask: void 0 }), log.info(TAG7, "Task execution completed successfully"), await eventBus.emit("TASK_COMPLETED", { sessionId, traceId }), finalContent;
        } catch (error) {
          throw log.error(TAG7, "Workflow Graph encountered an error", error), globalStateManager.updateState(sessionId, {
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
        let targetSession = sessionId || randomUUID4();
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
import path13 from "node:path";
import { randomUUID as randomUUID5 } from "node:crypto";

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
import crypto2 from "crypto";
var SessionStore = class {
  store = /* @__PURE__ */ new Map();
  timers = /* @__PURE__ */ new Map();
  MAX_SESSIONS = 1e3;
  DEFAULT_EXPIRY = 6e4;
  // 1 minute
  /**
   * Generates a high-entropy session ID.
   */
  generateId() {
    return crypto2.randomUUID();
  }
  set(id, token, expiryMs = this.DEFAULT_EXPIRY) {
    let isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id), isPrefixed = id.startsWith("state:") || id.startsWith("verifier:");
    if (!id || typeof id != "string" || !isUuid && !isPrefixed)
      throw new Error("Invalid session ID format: Entropy requirement not met");
    if (this.store.size >= this.MAX_SESSIONS && !this.store.has(id)) {
      let oldestKey = this.store.keys().next().value;
      oldestKey && this.delete(oldestKey);
    }
    let existing = this.timers.get(id);
    existing && clearTimeout(existing), this.store.set(id, {
      token,
      accessCount: 0,
      createdAt: Date.now()
    });
    let timer = setTimeout(() => this.delete(id), expiryMs);
    timer.unref(), this.timers.set(id, timer);
  }
  get(id) {
    let session = this.store.get(id);
    if (session) {
      if (session.accessCount += 1, session.accessCount > 100) {
        this.delete(id);
        return;
      }
      return session.token;
    }
  }
  delete(id) {
    this.store.delete(id);
    let timer = this.timers.get(id);
    timer && (clearTimeout(timer), this.timers.delete(id));
  }
  clear() {
    for (let timer of this.timers.values())
      clearTimeout(timer);
    this.store.clear(), this.timers.clear();
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
  getGitHubAuthorizeUrl(_sessionId, redirectUri, state, codeChallenge) {
    let params = {
      client_id: env_default.GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: "read:user",
      state
    };
    return codeChallenge && (params.code_challenge = codeChallenge, params.code_challenge_method = "S256"), `https://github.com/login/oauth/authorize?${new URLSearchParams(params).toString()}`;
  },
  async exchangeGitHubCode(code, codeVerifier) {
    let clientId = env_default.GITHUB_CLIENT_ID, clientSecret = env_default.GITHUB_CLIENT_SECRET, body = { client_id: clientId, client_secret: clientSecret, code };
    codeVerifier && (body.code_verifier = codeVerifier);
    let accessToken = (await (await fetch2("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body)
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

// src/api/molecules/rate-limiter.ts
init_logger();

// src/infra/atoms/client-ip.ts
function getClientIp(req) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

// src/api/molecules/rate-limiter.ts
var stores = /* @__PURE__ */ new Map();
function evictStale(store, now, maxStaleMs) {
  for (let [ip, entry] of store)
    now - entry.lastSeen > maxStaleMs && store.delete(ip);
}
function createRateLimiter(maxRequests, windowMs = 6e4, name = "default") {
  let limit = maxRequests ?? Number(process.env.RATE_LIMIT_RPM || "30"), enabled = process.env.RATE_LIMIT_ENABLED !== "false", MAX_STALE_MS = windowMs * 2;
  stores.has(name) || stores.set(name, /* @__PURE__ */ new Map());
  let store = stores.get(name);
  return (req, res, next) => {
    if (!enabled) {
      next();
      return;
    }
    let rawIp = getClientIp(req);
    if (!rawIp || typeof rawIp != "string" || !rawIp.includes(".") && !rawIp.includes(":")) {
      res.status(403).json({ error: "invalid_ip_origin" });
      return;
    }
    let ip = rawIp, now = Date.now(), windowStart = now - windowMs;
    store.size > 2e3 && evictStale(store, now, MAX_STALE_MS);
    let entry = store.get(ip) ?? { timestamps: [], lastSeen: now };
    if (entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart), entry.lastSeen = now, entry.timestamps.length >= limit) {
      let resetAt = (entry.timestamps[0] ?? now) + windowMs, retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1e3));
      res.setHeader("RateLimit-Limit", String(limit)), res.setHeader("RateLimit-Remaining", "0"), res.setHeader("RateLimit-Reset", String(Math.ceil(resetAt / 1e3))), res.setHeader("Retry-After", String(retryAfter)), logger.warn("RateLimiter", `Throttled [${name}]`, { ip, limit, retryAfter }), res.status(429).json({
        error: "rate_limit_exceeded",
        detail: `Too many requests for ${name}. Limit: ${limit} per ${windowMs / 1e3}s. Retry after ${retryAfter}s.`
      });
      return;
    }
    entry.timestamps.push(now), store.set(ip, entry);
    let remaining = Math.max(limit - entry.timestamps.length, 0);
    res.setHeader("RateLimit-Limit", String(limit)), res.setHeader("RateLimit-Remaining", String(remaining)), next();
  };
}

// src/api/organisms/auth-router.ts
import crypto3 from "crypto";
var authRouter = express.Router(), authRateLimiter = createRateLimiter(10, 900 * 1e3, "auth-security");
authRouter.get("/login", authRateLimiter, (req, res) => {
  res.redirect(`/auth/github${req.url.includes("?") ? "?" + req.url.split("?")[1] : ""}`);
});
authRouter.get("/session/:id", (req, res) => {
  let id = req.params.id;
  if (!id || typeof id != "string") {
    res.status(400).json({ error: "missing id" });
    return;
  }
  let token = SESSION_STORE.get(id) || "";
  res.json({ token });
});
authRouter.get("/github", authRateLimiter, (req, res) => {
  let clientId = env_default.GITHUB_CLIENT_ID, redirectUri = `${req.protocol}://${req.get("host")}/auth/callback`, sessionId = req.query.session || "";
  if ((!sessionId || sessionId.length < 32) && (sessionId = SESSION_STORE.generateId()), !clientId || clientId === "your_github_oauth_client_id_here") {
    res.status(200).send(renderStatusHTML(
      "OAuth Not Configured",
      "GitHub OAuth is not configured on the server.",
      "#D93025"
    ));
    return;
  }
  let state = `${sessionId}:${crypto3.randomBytes(16).toString("hex")}`, codeVerifier = crypto3.randomBytes(32).toString("base64url"), codeChallenge = crypto3.createHash("sha256").update(codeVerifier).digest("base64url");
  try {
    SESSION_STORE.set(`state:${sessionId}`, state, 6e5), SESSION_STORE.set(`verifier:${sessionId}`, codeVerifier, 6e5);
  } catch {
    res.status(500).send("Session initialization failed: Internal Security Error");
    return;
  }
  let url = OAuthService.getGitHubAuthorizeUrl(sessionId, redirectUri, state, codeChallenge);
  res.redirect(url);
});
authRouter.get("/callback", authRateLimiter, async (req, res) => {
  let code = req.query.code, state = req.query.state, sessionId = state && state.includes(":") ? state.split(":")[0] : req.query.session || "", expectedState = SESSION_STORE.get(`state:${sessionId}`);
  if (!state || !expectedState || state !== expectedState) {
    logger.warn("AuthRouter", "CSRF state mismatch or expired session", {
      sessionId,
      stateReceived: !!state,
      stateExpected: !!expectedState
    }), res.status(403).send(renderStatusHTML("Security Alert", "Invalid state / CSRF potential.", "#D93025"));
    return;
  }
  if (!code) {
    res.status(400).send("Missing code");
    return;
  }
  let codeVerifier = SESSION_STORE.get(`verifier:${sessionId}`);
  try {
    if (!sessionId) {
      res.status(400).send("Missing session identifier.");
      return;
    }
    let accessToken = await OAuthService.exchangeGitHubCode(code, codeVerifier || "");
    OAuthService.finalizeSession(sessionId, accessToken), SESSION_STORE.delete(`state:${sessionId}`), SESSION_STORE.delete(`verifier:${sessionId}`), res.send(renderStatusHTML(
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
import { z as z2 } from "zod";

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
      if (model)
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
    for (; (match = actionRegex.exec(text)) !== null; ) {
      let actionType = match[1], actionValue = match[2];
      actionType && actionValue && actions.push({
        type: actionType,
        // e.g., 'replace', 'insert'
        value: actionValue.trim()
      }), cleanText = cleanText.replace(match[0], "").trim();
    }
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
import crypto5 from "node:crypto";
init_logger();
function createRequestLog(req, requestId = crypto5.randomUUID()) {
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
var CopilotRequestSchema = z2.object({
  prompt: z2.string().min(1).max(1e4),
  // Protect against overly long prompts
  officeContext: z2.record(z2.string(), z2.unknown()).optional(),
  model: z2.string().optional(),
  stream: z2.boolean().optional().default(!1),
  authProvider: z2.string().optional(),
  presetId: z2.string().optional(),
  systemPrompt: z2.string().optional()
}), handleCopilotRequest = async (req, res) => {
  let reqLog = createRequestLog(req, res.locals.requestId), requestId = reqLog.requestId;
  markStart(requestId);
  let validation = CopilotRequestSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: "invalid_request", detail: validation.error.format() });
    return;
  }
  let { prompt, officeContext, model, stream, authProvider, presetId, systemPrompt } = validation.data, bearerMatch = req.headers.authorization?.match(/Bearer\s+(.+)/i), bearerToken = bearerMatch ? bearerMatch[1] : null;
  if (!bearerToken) {
    res.status(401).json({ error: "missing_api_key", detail: "Authorization header required" });
    return;
  }
  if (!/^[A-Za-z0-9-_.=]+$/.test(bearerToken) || bearerToken.length < 15) {
    res.status(401).json({ error: "invalid_api_key", detail: "Authorization token format is invalid" });
    return;
  }
  let geminiKey = bearerToken, firstTokenTracked = !1, chunkCount = 0, streamStartMs = 0, totalOutputChars = 0, streamingRes = res;
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
        totalOutputChars += chunk.length, res.write(`data: ${JSON.stringify({ text: chunk })}

`), streamingRes.flush?.(), chunkCount++;
      };
      markStart(`${requestId}:first-token`);
      let abortController = new AbortController();
      if (res.on("close", () => {
        setStreamingState(!1), abortController.abort();
      }), await CompletionService.execute(
        {
          prompt,
          officeContext: officeContext ?? {},
          model,
          presetId,
          stream: !0,
          authProvider,
          geminiKey,
          systemPrompt,
          sessionId: requestId
        },
        onChunk,
        abortController.signal
      ), !res.writableEnded) {
        res.write(`data: [DONE]

`);
        let streamLatency = markEnd(requestId), tokenWeight = /[^\x00-\x7F]/.test(prompt) ? 1.5 : 1, elapsedSec = streamStartMs > 0 ? (performance.now() - streamStartMs) / 1e3 : 1, estimatedTokens = Math.max(Math.round(totalOutputChars * tokenWeight / 4), chunkCount), tokensPerSec = elapsedSec > 0 ? Math.round(estimatedTokens / elapsedSec) : 0;
        GlobalSystemState.update({ tokensPerSec, activePersona: presetId || "General" }), NexusSocketRelay.broadcast("SYSTEM_STATE_UPDATED", GlobalSystemState.getState()), logCompletion(reqLog, { latencyMs: streamLatency, status: "ok", chunks: chunkCount }), res.end();
      }
    } else {
      let rawText = await CompletionService.execute({
        prompt,
        officeContext: officeContext ?? {},
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
    }
  } catch (err) {
    let isAbort = err instanceof DOMException && err.name === "AbortError", isTimeout = err instanceof Error && err.name === "TimeoutError";
    if (isAbort) {
      res.headersSent ? res.end() : res.status(499).end();
      return;
    }
    let error = err, detail = error.detail || error.message;
    if (logger.error("CopilotHandler", isTimeout ? "Request timeout" : "Copilot request failed", { requestId, error }), logCompletion(reqLog, { latencyMs: markEnd(requestId), status: "error", error: error.message }), !res.headersSent) {
      res.status(isTimeout ? 504 : error.status || 500).json({
        error: isTimeout ? "timeout" : "provider_error",
        detail
      });
      return;
    }
    res.write(`data: ${JSON.stringify({ error: "provider_error", detail })}

`), res.write(`data: [DONE]

`), res.end();
  }
};

// src/api/organisms/api-router.ts
init_option_resolver();
init_client_manager();
init_workflow_graph();
init_nexus_socket();
init_system_state_store();

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
import path12 from "node:path";
import { pathToFileURL } from "node:url";

// src/orchestrator/skill-registry.ts
init_logger();
import { z as z3 } from "zod";
import path11 from "node:path";
import fs5 from "node:fs/promises";
var SkillSchema = z3.object({
  name: z3.string().regex(/^[a-z0-9_]+$/, "Skill name must be snake_case"),
  version: z3.string().regex(/^\d+\.\d+\.\d+$/, "Version must follow SemVer (x.y.z)"),
  description: z3.string().min(10),
  parameters: z3.object({
    type: z3.literal("object"),
    properties: z3.record(z3.string(), z3.any()),
    required: z3.array(z3.string()).optional()
  }),
  examples: z3.array(z3.object({
    input: z3.any(),
    output: z3.any(),
    reasoning: z3.string().min(5, "Reasoning must be substantial")
  })).min(1, "At least one example with reasoning is required"),
  workflow: z3.object({
    overview: z3.string().min(10),
    whenToUse: z3.array(z3.string().min(5)).min(1),
    process: z3.array(z3.string().min(5)).min(1),
    rationalizations: z3.array(z3.object({
      excuse: z3.string().min(5),
      reality: z3.string().min(5)
    })).min(1),
    redFlags: z3.array(z3.string().min(5)).min(1),
    verification: z3.array(z3.string().min(5)).min(1),
    references: z3.array(z3.string().min(3)).optional()
  })
}), SkillRegistry = class _SkillRegistry {
  static instance;
  skills = /* @__PURE__ */ new Map();
  constructor() {
  }
  static getInstance() {
    return _SkillRegistry.instance || (_SkillRegistry.instance = new _SkillRegistry()), _SkillRegistry.instance;
  }
  /**
   * Register a single skill with version conflict check and Zod validation.
   */
  registerSkill(skill) {
    let validation = SkillSchema.safeParse(skill);
    if (!validation.success)
      throw logger.error("SkillRegistry", `Validation failed for skill: ${skill.name}`, validation.error.format()), new Error(`Skill validation failed: ${skill.name}`);
    let existing = this.skills.get(skill.name);
    if (existing) {
      if (existing.version === skill.version) {
        logger.warn("SkillRegistry", `Skill ${skill.name} v${skill.version} already registered. Skipping.`);
        return;
      }
      let existingVer = existing.version.split(".").map(Number), newVer = skill.version.split(".").map(Number), isNewer = !1;
      for (let i = 0; i < 3; i++) {
        let v1 = existingVer[i] ?? 0, v2 = newVer[i] ?? 0;
        if (v2 > v1) {
          isNewer = !0;
          break;
        }
        if (v1 > v2) break;
      }
      if (isNewer)
        logger.info("SkillRegistry", `Upgrading skill: ${skill.name} from v${existing.version} to v${skill.version}`);
      else {
        logger.warn("SkillRegistry", `Version conflict: ${skill.name} v${existing.version} is already registered and newer or same as v${skill.version}. Skipping.`);
        return;
      }
    }
    this.skills.set(skill.name, skill), logger.info("SkillRegistry", `Registered skill: ${skill.name} (v${skill.version})`);
  }
  /**
   * Full Automatic Discovery Mechanism.
   * Scans src/agents/expert-* folders for index.ts/js and auto-imports skills.
   */
  async discoverAndRegister() {
    logger.info("SkillRegistry", "Starting automatic skill discovery...");
    let agentsDir = path11.resolve(process.cwd(), "src", "agents");
    try {
      let expertFolders = (await fs5.readdir(agentsDir, { withFileTypes: !0 })).filter((e) => e.isDirectory() && e.name.startsWith("expert-")).map((e) => e.name);
      for (let folder of expertFolders) {
        let indexPath = path11.join(agentsDir, folder, "index.ts");
        try {
          await fs5.stat(indexPath);
          let module = await import(`file://${indexPath.replace(/\\/g, "/")}`), skillKey = `${folder.replace("expert-", "")}Skill`, skill = module[skillKey] || module.defaultSkill || Object.values(module).find((v) => {
            let val = v;
            return val?.name && val?.execute;
          });
          skill && this.registerSkill(skill);
        } catch (err) {
          logger.warn("SkillRegistry", `Skipped ${folder}: ${err}`);
        }
      }
      await this.syncToSDKRegistry();
    } catch (error) {
      logger.error("SkillRegistry", "Critical failure during skill discovery", error);
    }
    logger.info("SkillRegistry", `Discovery completed. Total skills: ${this.skills.size}`);
  }
  /**
   * Industrial P5: Synchronize registry state to the integrated SDK registry location.
   * Ensures 'latest.json' is always the single source of truth for all components.
   */
  async syncToSDKRegistry() {
    try {
      let snapshot = {
        version: "Omni-Arsenal-AutoSync",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        skills: this.getRegistrySnapshot()
      }, sdkRegistryPath = path11.resolve(process.cwd(), "src", "sdk", "registry", "manifests", "latest.json");
      await fs5.mkdir(path11.dirname(sdkRegistryPath), { recursive: !0 }), await fs5.writeFile(sdkRegistryPath, JSON.stringify(snapshot, null, 2), "utf-8"), logger.info("SkillRegistry", `Successfully synchronized ${this.skills.size} skills to SDK Registry.`);
    } catch (err) {
      logger.error("SkillRegistry", "Failed to sync to SDK Registry", err);
    }
  }
  /**
   * Dynamic loading mechanism: load skills from a provided array (e.g., from a discovery service).
   */
  async dynamicLoad(skills) {
    logger.info("SkillRegistry", "Starting dynamic skill loading...");
    for (let skill of skills)
      try {
        this.registerSkill(skill);
      } catch (error) {
        logger.error("SkillRegistry", `Failed to load skill: ${skill.name}`, error);
      }
    logger.info("SkillRegistry", `Dynamic loading completed. Total skills: ${this.skills.size}`);
  }
  /**
   * Register multiple skills at once.
   */
  registerSkills(skills) {
    skills.forEach((skill) => this.registerSkill(skill));
  }
  /**
   * Find a specific skill by name.
   */
  findSkill(name) {
    return this.skills.get(name);
  }
  /**
   * Return all registered tools in OpenAI-compatible format.
   * Aligned with Industrial Grade Spec.
   */
  toOpenAITools() {
    return Array.from(this.skills.values()).map((skill) => ({
      type: "function",
      function: {
        name: skill.name,
        description: `${skill.description} Workflow: ${skill.workflow.process.slice(0, 3).join(" -> ")}`,
        parameters: skill.parameters,
        strict: !0
        // Industrial safety
      }
    }));
  }
  /**
   * Export a complete snapshot of the registry with all metadata.
   * Useful for high-fidelity context injection or debugging.
   */
  getRegistrySnapshot() {
    return Array.from(this.skills.values()).map((skill) => ({
      name: skill.name,
      version: skill.version,
      description: skill.description,
      trigger: skill.trigger,
      logic: skill.logic,
      intent_labels: skill.intent_labels,
      examples: skill.examples,
      edge_cases: skill.edge_cases,
      parallel_safe: skill.parallel_safe,
      workflow: skill.workflow,
      parameters: skill.parameters
    }));
  }
  /**
   * Return all registered tools in OpenAI-compatible format (legacy).
   */
  getAllTools() {
    return this.toOpenAITools();
  }
  /**
   * Get all registered skill instances.
   */
  getSkills() {
    return Array.from(this.skills.values());
  }
  /**
   * (Optional) Runtime discovery based on capability search.
   */
  async discover(capability) {
    return Array.from(this.skills.values()).find(
      (s) => s.description.toLowerCase().includes(capability.toLowerCase()) || s.name.includes(capability.toLowerCase())
    );
  }
}, skillRegistry = SkillRegistry.getInstance();

// src/api/organisms/api-router.ts
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
apiRouter.get("/skills", (_req, res) => {
  try {
    let snapshot = skillRegistry.getRegistrySnapshot();
    res.json({
      version: "Omni-Zenith-Dynamic",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      skills: snapshot
    });
  } catch (err) {
    res.status(500).json({ status: 500, detail: "Registry snapshot failure: " + String(err) });
  }
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
    res.json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: Math.round(process.uptime()),
      node_version: process.version,
      providers: health,
      memory: process.memoryUsage().rss
    });
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
    let patcherPath = path12.resolve(
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

// src/infra/molecules/app-factory.ts
init_env();

// src/infra/molecules/telemetry-middleware.ts
import crypto6 from "node:crypto";
init_nexus_socket();
function telemetryMiddleware(req, res, next) {
  let requestId = crypto6.randomUUID();
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
  res.once("finish", () => {
    finalize();
    let tokenUsage = req.body?.usage?.totalTokens ?? 0;
    tokenUsage > 0 && NexusSocketRelay.broadcast("TELEMETRY_COST", {
      tokens: tokenUsage,
      agent: req.body?.agent,
      domain: req.body?.domain,
      requestId
    }), req.path.includes("/feedback");
  }), res.once("close", finalize), next();
}

// src/infra/molecules/app-factory.ts
var AppFactory = {
  create() {
    let app = express2(), distPath = path13.resolve(process.cwd(), "dist"), defaultOrigins = [
      "https://localhost:3000",
      "https://localhost:3001",
      "https://localhost:4000"
    ], configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean), allowedOrigins = /* @__PURE__ */ new Set([...defaultOrigins, ...configuredOrigins]), allowAllOrigins = process.env.CORS_ALLOW_ALL_ORIGINS === "true";
    return app.use(telemetryMiddleware), app.use((req, _res, next) => {
      req.requestId = req.headers["x-request-id"] || randomUUID5(), next();
    }), app.use(cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, !0);
          return;
        }
        allowAllOrigins || allowedOrigins.has(origin) || (origin && Array.isArray(env_default.CORS_ALLOWED_ORIGINS) ? env_default.CORS_ALLOWED_ORIGINS.some(
          (pattern) => pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
        ) : !1) ? callback(null, !0) : callback(new Error(`CORS origin not allowed: ${origin}`), !1);
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
import fs6 from "node:fs";
import path14 from "node:path";
async function resolveHttpsServerOptions() {
  let certPath = path14.join(process.cwd(), "certs"), keyFile = path14.join(certPath, "localhost.key"), crtFile = path14.join(certPath, "localhost.crt");
  if (fs6.existsSync(keyFile) && fs6.existsSync(crtFile))
    try {
      return console.log("[Setup] SSL: Using Industrial Zenith Certificates (Mount)"), {
        isHttps: !0,
        options: {
          key: fs6.readFileSync(keyFile),
          cert: fs6.readFileSync(crtFile)
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

// src/orchestrator/register-all-skills.ts
async function registerAllSkills() {
  await skillRegistry.discoverAndRegister();
}

// src/infra/organisms/server-orchestrator.ts
var ServerOrchestrator = {
  async start() {
    markStart("server-startup"), await registerAllSkills(), logger.setHook((entry) => {
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
