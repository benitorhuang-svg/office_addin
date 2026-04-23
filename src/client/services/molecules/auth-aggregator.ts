/**
 * Forwarding layer for Auth services.
 * Orchestrates multiple auth providers (GitHub, Gemini) via specialized sub-modules.
 */
export { createAuthController } from "../parts/auth/orchestrator";
export { GitHubProvider } from "../parts/auth/github-provider";
export { GeminiProvider } from "../parts/auth/gemini-provider";
