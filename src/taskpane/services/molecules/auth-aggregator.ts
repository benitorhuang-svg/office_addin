/**
 * Forwarding layer for Auth services.
 * Orchestrates multiple auth providers (GitHub, Gemini) via specialized sub-modules.
 */
export { createAuthController } from "../auth/orchestrator";
export { GitHubProvider } from "../auth/github-provider";
export { GeminiProvider } from "../auth/gemini-provider";
