/**
 * Atom: Provider Profiles
 * Single source of truth for the visual & semantic identity of each auth path.
 * Used across AuthGateway, PromptGroup, ExpertHub, and WelcomeMessage
 * to guarantee atomic-level consistency.
 */
import { NexusProvider } from "@shared/types";
import type { IconName } from "@atoms/Icon";

export interface ProviderProfile {
    /** Unique provider key */
    provider: NexusProvider;
    /** User-facing display name (login card) */
    displayName: string;
    /** Short subtitle for login card */
    subtitle: string;
    /** Icon name from the Icon atom */
    icon: IconName;
    /** CSS class suffix for pill colour theming */
    pillVariant: "preview" | "gemini" | "github";
    /** Label shown in the prompt bar pill */
    pillLabel: string;
    /** Welcome message text after login */
    welcomeText: string;
}

/**
 * Master registry — order matters for rendering in AuthGateway.
 */
export const PROVIDER_PROFILES: Record<string, ProviderProfile> = {
    /** ────── Guest / Preview Mode ────── */
    [NexusProvider.PREVIEW]: {
        provider: NexusProvider.PREVIEW,
        displayName: "以訪客身份進入",
        subtitle: "探索核心功能 · 無需認證",
        icon: "user",
        pillVariant: "preview",
        pillLabel: "預覽模式",
        welcomeText:
            "您好！我是您的智慧編輯夥伴。目前正處於「預覽模式」，您可以直接描述您想要完成的檔案編輯任務、詢問技術問題，或是上傳專案文件讓我協助分析。",
    },

    /** ────── Google Gemini (API Key) ────── */
    [NexusProvider.GEMINI_API]: {
        provider: NexusProvider.GEMINI_API,
        displayName: "Google Gemini Pro",
        subtitle: "高性能雲端引擎 · 支持多模態",
        icon: "gemini",
        pillVariant: "gemini",
        pillLabel: "GEMINI PRO",
        welcomeText:
            "您好！我是由 **Google Gemini** 技術驅動的 Nexus 智慧專家。系統已建立安全加密連線，您可以利用強大的多模態模型來協助處理複雜的文件分析與創意撰寫任務。",
    },

    /** ────── GitHub Copilot (PAT) ────── */
    [NexusProvider.COPILOT_PAT]: {
        provider: NexusProvider.COPILOT_PAT,
        displayName: "GitHub Copilot",
        subtitle: "企業級開發邏輯 · 語境感知強項",
        icon: "github",
        pillVariant: "github",
        pillLabel: "COPILOT",
        welcomeText:
            "您好！我是您的 **GitHub Copilot** 工業級助手。我已準備好協助您進行結構化文案產出、數據診斷以及 Office 自動化腳本編寫。",
    },
};

/**
 * Resolve a NexusProvider enum value to its visual profile.
 * Falls back to the PREVIEW profile for unknown providers.
 */
export function resolveProviderProfile(provider: NexusProvider | string | null | undefined): ProviderProfile {
    if (!provider) return PROVIDER_PROFILES[NexusProvider.PREVIEW];

    const p = String(provider).toLowerCase();

    // Direct match
    if (PROVIDER_PROFILES[p]) return PROVIDER_PROFILES[p];

    // Fuzzy match for legacy enum values (copilot_cli, copilot_oauth, etc.)
    if (p.includes("gemini")) return PROVIDER_PROFILES[NexusProvider.GEMINI_API];
    if (p.includes("copilot") || p.includes("github")) return PROVIDER_PROFILES[NexusProvider.COPILOT_PAT];

    return PROVIDER_PROFILES[NexusProvider.PREVIEW];
}
