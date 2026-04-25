import { z } from "zod";
import { BASE_ENV } from "@config/atoms/base-env.js";

/**
 * Wave 1: Defensive Foundation - Environment Validation
 * Using Zod to define a complete schema for all critical environment variables.
 */
const envSchema = z.object({
  // Infrastructure
  PORT: z.coerce.number().positive().default(4000),

  // AI Provider Keys
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required for Gemini operations"),

  // GitHub OAuth (Required for Auth workflows)
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),

  // Rate Limiting
  RATE_LIMIT_RPM: z.coerce.number().positive().default(30),
  RATE_LIMIT_ENABLED: z.boolean().default(true),

  // Optional AI Keys (can be empty but should be validated if present)
  AZURE_OPENAI_API_KEY: z.string().optional().default(""),
  AZURE_OPENAI_ENDPOINT: z.string().optional().default(""),
  AZURE_OPENAI_DEPLOYMENT: z.string().optional().default(""),

  // Copilot / GitHub Tokens
  COPILOT_GITHUB_TOKEN: z.string().optional().default(""),
});

// We validate against BASE_ENV which already has some defaults and process.env values
const validatedEnv = envSchema.safeParse({
  PORT: BASE_ENV.PORT,
  GEMINI_API_KEY: BASE_ENV.GEMINI_API_KEY,
  GITHUB_CLIENT_ID: BASE_ENV.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: BASE_ENV.GITHUB_CLIENT_SECRET,
  RATE_LIMIT_RPM: BASE_ENV.RATE_LIMIT_RPM,
  RATE_LIMIT_ENABLED: BASE_ENV.RATE_LIMIT_ENABLED,
  AZURE_OPENAI_API_KEY: BASE_ENV.AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_ENDPOINT: BASE_ENV.AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_DEPLOYMENT: BASE_ENV.AZURE_OPENAI_DEPLOYMENT,
  COPILOT_GITHUB_TOKEN: process.env.COPILOT_GITHUB_TOKEN || "",
});

if (!validatedEnv.success) {
  console.error("❌ [FATAL] Environment validation failed:");
  const formatted = validatedEnv.error.format();
  Object.entries(formatted).forEach(([key, value]) => {
    if (key !== "_errors") {
      console.error(`   - ${key}: ${(value as { _errors: string[] })._errors.join(", ")}`);
    }
  });
  process.exit(1); // Fail-fast mechanism
}

import config from "@config/molecules/server-config.js";
export default config;
