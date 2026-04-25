import express, { type Request, type Response } from "express";
import config from "@config/env.js";
import { renderStatusHTML } from "@api/atoms/status-html.js";
import { SESSION_STORE } from "@api/molecules/session-store.js";
import { OAuthService } from "@api/organisms/oauth-service.js";
import { logger } from "@shared/logger/index.js";
import { createRateLimiter } from "@api/molecules/rate-limiter.js";
import crypto from "crypto";

interface GeminiModelsResponse {
  models?: unknown[];
  error?: {
    message?: string;
  };
}

interface GitHubUserResponse {
  login?: string;
  message?: string;
}

/**
 * Wave 1: Defensive Foundation - Auth Security Upgrade
 * Coordinates the full OAuth lifecycle with PKCE, CSRF protection, and strict rate limiting.
 */
const authRouter = express.Router();

// Stricter Rate Limit for Auth: 10 attempts per 15 minutes
const authRateLimiter = createRateLimiter(10, 15 * 60 * 1000, "auth-security");

/**
 * Endpoint: Auth Entry Point (Standardized)
 */
authRouter.get("/login", authRateLimiter, (req: Request, res: Response): void => {
  res.redirect(`/auth/github${req.url.includes("?") ? "?" + req.url.split("?")[1] : ""}`);
});

/**
 * Endpoint: Polling for session token
 */
authRouter.get("/session/:id", (req: Request, res: Response): void => {
  const id = req.params.id;
  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "missing id" });
    return;
  }
  const token = SESSION_STORE.get(id) || "";

  res.json({ token });
});

/**
 * Endpoint: GitHub OAuth entry point
 */
authRouter.get("/github", authRateLimiter, (req: Request, res: Response): void => {
  const clientId = config.GITHUB_CLIENT_ID;
  const redirectUri = `${req.protocol}://${req.get("host")}/auth/callback`;

  // Ensure Session ID is a high-entropy UUID
  let sessionId = (req.query.session as string) || "";
  if (!sessionId || sessionId.length < 32) {
    sessionId = SESSION_STORE.generateId();
  }

  if (!clientId || clientId === "your_github_oauth_client_id_here") {
    res
      .status(200)
      .send(
        renderStatusHTML(
          "OAuth Not Configured",
          "GitHub OAuth is not configured on the server.",
          "#D93025"
        )
      );
    return;
  }

  // CSRF Protection: Generate strong random state with session linkage
  const state = `${sessionId}:${crypto.randomBytes(16).toString("hex")}`;

  // PKCE: Generate verifier and challenge
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");

  // Store security tokens with Session ID linkage
  try {
    // We use the full state as the key to ensure strict 1:1 matching
    SESSION_STORE.set(`state:${sessionId}`, state, 600000); // 10 min expiry for flow
    SESSION_STORE.set(`verifier:${sessionId}`, codeVerifier, 600000);
  } catch (_err) {
    res.status(500).send("Session initialization failed: Internal Security Error");
    return;
  }

  const url = OAuthService.getGitHubAuthorizeUrl(sessionId, redirectUri, state, codeChallenge);
  res.redirect(url);
});

/**
 * Endpoint: GitHub OAuth callback
 */
authRouter.get("/callback", authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;
  const state = req.query.state as string;

  // Extract sessionId from state
  const sessionId =
    state && state.includes(":") ? state.split(":")[0] : (req.query.session as string) || "";

  // Refined State Verification: Strict match against stored state
  const expectedState = SESSION_STORE.get(`state:${sessionId}`);
  if (!state || !expectedState || state !== expectedState) {
    logger.warn("AuthRouter", "CSRF state mismatch or expired session", {
      sessionId,
      stateReceived: !!state,
      stateExpected: !!expectedState,
    });
    res
      .status(403)
      .send(renderStatusHTML("Security Alert", "Invalid state / CSRF potential.", "#D93025"));
    return;
  }

  if (!code) {
    res.status(400).send("Missing code");
    return;
  }

  const codeVerifier = SESSION_STORE.get(`verifier:${sessionId}`);

  try {
    // Exchange code using PKCE verifier
    if (!sessionId) {
      res.status(400).send("Missing session identifier.");
      return;
    }

    const accessToken = await OAuthService.exchangeGitHubCode(code, codeVerifier || "");
    OAuthService.finalizeSession(sessionId, accessToken);

    // Clean up temporary security tokens
    SESSION_STORE.delete(`state:${sessionId}`);
    SESSION_STORE.delete(`verifier:${sessionId}`);

    res.send(
      renderStatusHTML(
        "已成功連接 GitHub",
        "您的帳號已成功授權，現在可以關閉此視窗。",
        "#0078D4",
        true
      )
    );
  } catch (err: unknown) {
    const error = err as Error;
    logger.error("AuthRouter", "OAuth callback failed", { error });
    res.status(500).send(renderStatusHTML("認證失敗", `發生錯誤：${error.message}`, "#D93025"));
  }
});

/**
 * Endpoint: Verify Gemini API Key (Real Check)
 */
authRouter.post("/verify/gemini", async (req: Request, res: Response): Promise<void> => {
  const { key } = req.body;
  if (!key) {
    res.status(400).json({ error: "missing key" });
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );
    const data = (await response.json()) as GeminiModelsResponse;
    if (response.ok && data.models) {
      res.json({ success: true, models: data.models.length });
    } else {
      res.status(401).json({ error: data.error?.message || "Invalid API Key" });
    }
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

/**
 * Endpoint: Verify GitHub PAT (Real Check)
 */
authRouter.post("/verify/github", async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;
  if (!token) {
    res.status(400).json({ error: "missing token" });
    return;
  }

  try {
    const response = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${token}`, "User-Agent": "Nexus-Center-Industrial" },
    });
    const data = (await response.json()) as GitHubUserResponse;
    if (response.ok && data.login) {
      res.json({ success: true, login: data.login });
    } else {
      res.status(401).json({ error: data.message || "Invalid GitHub Token" });
    }
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default authRouter;
