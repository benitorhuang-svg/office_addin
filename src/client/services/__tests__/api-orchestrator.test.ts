import { sendToCopilot } from "@services/organisms/api-orchestrator.js";
import { fetchWithTimeout } from "@services/atoms/api-client.js";
import { resolveLocalApiUrl } from "@services/molecules/local-server-resolver.js";

jest.mock("../atoms/api-client");
jest.mock("../molecules/local-server-resolver");

const mockFetchWithTimeout = fetchWithTimeout as jest.Mock;
const mockResolveLocalApiUrl = resolveLocalApiUrl as jest.Mock;

describe("API Orchestrator (Frontend Integration)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveLocalApiUrl.mockImplementation((path: string) =>
      Promise.resolve(`http://localhost:3000${path}`)
    );
  });

  it("should send officeContext correctly to the backend", async () => {
    mockFetchWithTimeout.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: "Mock response", actions: [], model: "gpt-4o" }),
    });

    const officeContext = {
      selectedText: "",
      activeSheet: "SalesData",
      glossary: { AI: "Artificial Intelligence" },
      themeColors: { primary: "#008CA1" },
    };

    await sendToCopilot(
      "Test prompt",
      "mock-token",
      officeContext as unknown as import("@services/atoms/types.js").OfficeContextPayload,
      "gpt-4o",
      "default",
      "copilot_cli",
      null
    );

    expect(mockFetchWithTimeout).toHaveBeenCalledWith(
      "http://localhost:3000/api/copilot",
      expect.objectContaining({
        body: expect.stringContaining(
          '"officeContext":{"selectedText":"","activeSheet":"SalesData","glossary":{"AI":"Artificial Intelligence"},"themeColors":{"primary":"#008CA1"}}'
        ),
      })
    );
  });

  it("should handle server errors gracefully", async () => {
    mockFetchWithTimeout.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: "Rate limit exceeded" }),
    });

    await expect(
      sendToCopilot(
        "test",
        null,
        {} as import("@services/atoms/types.js").OfficeContextPayload,
        "gpt-4o",
        "default",
        "copilot_cli",
        null
      )
    ).rejects.toThrow("Rate limit exceeded");
  });
});
