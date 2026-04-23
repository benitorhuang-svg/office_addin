/**
 * Unit tests: SkillOrchestrator routing logic
 * Mocks all I/O (file reads, Python spawns, LLM calls)
 */

jest.mock("../atoms/intent-classifier.js", () => ({
  classifyIntent: jest.fn(),
}));
jest.mock("../atoms/brand-extractor.js", () => ({
  extractBrandTokens: jest.fn(),
}));
jest.mock("../molecules/design-reviewer.js", () => ({
  reviewDesign: jest.fn().mockReturnValue({
    totalScore: 82,
    passed: true,
    allIssues: [],
    dimensions: [],
  }),
}));
jest.mock("@agents/expert-excel/index.js", () => ({
  ExcelSkillInvoker: {
    getPromptPath: jest.fn().mockReturnValue("/fake/excel-prompt.md"),
  },
}));
jest.mock("@agents/expert-ppt/index.js", () => ({
  PPTSkillInvoker: {
    getPromptPath: jest.fn().mockReturnValue("/fake/ppt-master.md"),
  },
}));
jest.mock("@agents/expert-word/index.js", () => ({
  WordSkillInvoker: {
    getPromptPath: jest.fn().mockReturnValue("/fake/word-prompt.md"),
  },
}));
jest.mock("@agents/skills/shared/shared-invoker.js", () => ({
  SharedSkillInvoker: {
    invokeGalaxyGraph: jest
      .fn()
      .mockImplementation(() => Promise.resolve({ status: "galaxy_complete" })),
    invokeVectorSearch: jest
      .fn()
      .mockImplementation(() => Promise.resolve({ status: "vector_complete", results: [] })),
    getOmniBridgePromptPath: jest.fn().mockReturnValue("/fake/omni.md"),
  },
}));
jest.mock("fs", () => ({
  promises: {
    readFile: jest
      .fn()
      .mockImplementation(() => Promise.resolve("# Mock Prompt Content\n\nThis is a test prompt.")),
  },
}));
jest.mock("@shared/logger/index.js", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    withTrace: jest.fn().mockReturnValue({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
  },
}));

import { SkillOrchestrator } from "@agents/skills/skill-orchestrator.js";
import { classifyIntent, type IntentLabel } from "@agents/skills/atoms/intent-classifier.js";
import { extractBrandTokens } from "@agents/skills/atoms/brand-extractor.js";

const mockClassifyIntent = classifyIntent as jest.MockedFunction<typeof classifyIntent>;
const mockExtractBrandTokens = extractBrandTokens as jest.MockedFunction<typeof extractBrandTokens>;

describe("SkillOrchestrator", () => {
  let orchestrator: SkillOrchestrator;
  const baseCtx = { apiKey: "test-key", docs: [] };

  beforeEach(() => {
    jest.clearAllMocks();
    orchestrator = new SkillOrchestrator();
  });

  describe("brand intelligence shortcut", () => {
    it('intercepts "brand: https://..." before intent classification', async () => {
      mockExtractBrandTokens.mockResolvedValue({
        ok: true,
        tokens: {
          primary: "#1a1a1a",
          secondary: "#ffffff",
          accent: "#3b82f6",
          background: "#ffffff",
          text: "#111827",
          cssBlock: "",
          sourceUrl: "https://example.com",
        },
      } as Awaited<ReturnType<typeof extractBrandTokens>>);

      const result = await orchestrator.route("brand: https://example.com", baseCtx);

      expect(mockClassifyIntent).not.toHaveBeenCalled();
      expect(result).toMatchObject({ status: "brand_tokens_extracted" });
    });

    it("ignores http:// URLs (security: only HTTPS allowed)", async () => {
      mockClassifyIntent.mockResolvedValue("vector_search" as IntentLabel);
      await orchestrator.route("brand: http://example.com", baseCtx);
      expect(mockExtractBrandTokens).not.toHaveBeenCalled();
    });
  });

  describe("intent routing", () => {
    it('routes "ppt" intent and returns designReview metadata', async () => {
      mockClassifyIntent.mockResolvedValue("ppt" as IntentLabel);
      const result = (await orchestrator.route("create a presentation", baseCtx)) as Record<
        string,
        unknown
      >;

      expect(result.status).toBe("prompt_augmented");
      expect(result.category).toBe("ppt_design");
      expect(result).toHaveProperty("designReview");
      const dr = result.designReview as Record<string, unknown>;
      expect(dr.passed).toBe(true);
      expect(typeof dr.totalScore).toBe("number");
    });

    it('routes "word" intent with designReview', async () => {
      mockClassifyIntent.mockResolvedValue("word" as IntentLabel);
      const result = (await orchestrator.route("write a report", baseCtx)) as Record<
        string,
        unknown
      >;

      expect(result.status).toBe("prompt_augmented");
      expect(result.category).toBe("word_creative");
      expect(result).toHaveProperty("designReview");
    });

    it('routes "excel" intent without designReview', async () => {
      mockClassifyIntent.mockResolvedValue("excel" as IntentLabel);
      const result = (await orchestrator.route("analyze spreadsheet", baseCtx)) as Record<
        string,
        unknown
      >;

      expect(result.status).toBe("prompt_augmented");
      expect(result.category).toBe("excel_data");
      expect(result).not.toHaveProperty("designReview");
    });

    it('routes "galaxy_graph" to SharedSkillInvoker', async () => {
      mockClassifyIntent.mockResolvedValue("galaxy_graph" as IntentLabel);
      const result = await orchestrator.route("show dependency graph", {
        ...baseCtx,
        repo: "owner/repo",
      });

      expect(result).toMatchObject({ status: "galaxy_complete" });
    });

    it("returns default vector_search for unknown intent", async () => {
      mockClassifyIntent.mockResolvedValue("vector_search" as IntentLabel);
      const result = (await orchestrator.route("general question", baseCtx)) as Record<
        string,
        unknown
      >;
      expect(result).toBeDefined();
    });
  });

  describe("context propagation", () => {
    it("passes token to classifyIntent for LLM classification", async () => {
      mockClassifyIntent.mockResolvedValue("excel" as IntentLabel);
      const ctx = { ...baseCtx, token: "ghu_test_token" };

      await orchestrator.route("query", ctx);

      expect(mockClassifyIntent).toHaveBeenCalledWith("query", { token: "ghu_test_token" });
    });
  });
});
