import { SharedSkillInvoker } from "../shared/shared-invoker";
import { ElegantSkillInvoker } from "../skill-invoker";
import { spawn } from "child_process";
import * as bridgeClient from "../../../infra/services/bridge-client";

jest.mock("child_process", () => ({
  spawn: jest.fn(),
}));

jest.mock("../../../infra/services/bridge-client", () => ({
  invokeVectorSearch: jest.fn(),
}));

describe("Resilience Testing & Circuit Breaker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset circuit breaker state for tests (accessing private static via any)
    (ElegantSkillInvoker as unknown as Record<string, unknown>).circuits = {
      excel: { state: "CLOSED", failures: 0 },
      ppt: { state: "CLOSED", failures: 0 },
      word: { state: "CLOSED", failures: 0 },
      shared: { state: "CLOSED", failures: 0 },
    };
  });

  it("should trip circuit breaker to OPEN after 5 consecutive failures", async () => {
    const mockVectorSearch = bridgeClient.invokeVectorSearch as jest.Mock;
    mockVectorSearch.mockRejectedValue(new Error("Persistent Failure"));

    // Fail 5 times
    for (let i = 0; i < 5; i++) {
      await expect(ElegantSkillInvoker.invokeVectorSearch("key", "query", [])).rejects.toThrow(
        "Persistent Failure"
      );
    }

    // 6th call should be blocked by circuit breaker
    await expect(ElegantSkillInvoker.invokeVectorSearch("key", "query", [])).rejects.toThrow(
      /Circuit breaker for shared is OPEN/
    );

    const status = (
      (ElegantSkillInvoker as unknown as Record<string, unknown>).circuits as Record<
        string,
        unknown
      >
    ).shared as { state: string };
    expect(status.state).toBe("OPEN");
  });

  it("should simulate Python Bridge random crash (SIGKILL)", async () => {
    const mockSpawn = spawn as jest.Mock;

    // Simulate a process that gets killed
    mockSpawn.mockReturnValue({
      stdin: { write: jest.fn(), end: jest.fn() },
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn((event, callback) => {
        if (event === "close") callback(null, "SIGKILL"); // Simulate SIGKILL
      }),
      kill: jest.fn(),
    });

    await expect(ElegantSkillInvoker.invokeGalaxyGraph("query")).rejects.toThrow(
      /Shared Skill Error \[galaxy_graph.py\]/
    );
  });

  it("should handle extreme network latency (>30s) and timeout", async () => {
    jest.useFakeTimers();
    const mockSpawn = spawn as jest.Mock;

    let closeCallback: ((code: number | null) => void) | undefined;
    mockSpawn.mockReturnValue({
      stdin: { write: jest.fn(), end: jest.fn() },
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn((event, callback) => {
        if (event === "close") closeCallback = callback;
      }),
      kill: jest.fn(),
    });

    const promise = ElegantSkillInvoker.invokeGalaxyGraph("query");

    // Advance timers past 30s
    jest.advanceTimersByTime(35000);

    // Manually trigger close to simulate Node.js behavior when signal aborts
    if (closeCallback) closeCallback(null);

    await expect(promise).rejects.toThrow(/Execution timeout after 30s/);
    jest.useRealTimers();
  });

  it("should transition to HALF_OPEN after recovery timeout", async () => {
    const mockVectorSearch = bridgeClient.invokeVectorSearch as jest.Mock;
    mockVectorSearch.mockRejectedValue(new Error("Persistent Failure"));

    // Trip the circuit
    for (let i = 0; i < 5; i++) {
      await expect(ElegantSkillInvoker.invokeVectorSearch("key", "query", [])).rejects.toThrow();
    }

    // Advance time by 31 seconds (Recovery timeout is 30s)
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now + 31000);

    // Mock success for the next call
    mockVectorSearch.mockResolvedValue({ results: [] });

    // Next call should be allowed and move to HALF_OPEN -> CLOSED
    await ElegantSkillInvoker.invokeVectorSearch("key", "query", []);

    const status = (
      (ElegantSkillInvoker as unknown as Record<string, unknown>).circuits as Record<
        string,
        unknown
      >
    ).shared as { state: string; failures: number };
    expect(status.state).toBe("CLOSED");
    expect(status.failures).toBe(0);

    jest.restoreAllMocks();
  });
});

describe("SharedSkillInvoker (Original Tests)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject on timeout (internal spawn)", async () => {
    jest.useFakeTimers();
    const mockSpawn = spawn as jest.Mock;
    let closeCallback: ((...args: unknown[]) => void) | undefined;

    mockSpawn.mockReturnValue({
      stdin: { write: jest.fn(), end: jest.fn() },
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn((event, callback) => {
        if (event === "close") closeCallback = callback;
      }),
      kill: jest.fn(),
    });

    const promise = (
      SharedSkillInvoker as unknown as { spawn: (...args: unknown[]) => Promise<unknown> }
    ).spawn("test.py", {});

    jest.advanceTimersByTime(31000);
    if (closeCallback) closeCallback(null);

    await expect(promise).rejects.toThrow(/Execution timeout after 30s/);
    jest.useRealTimers();
  });

  it("should process successful JSON output", async () => {
    const mockSpawn = spawn as jest.Mock;

    mockSpawn.mockReturnValue({
      stdin: { write: jest.fn(), end: jest.fn() },
      stdout: {
        on: jest.fn((event, callback) => {
          if (event === "data") callback(Buffer.from(JSON.stringify({ results: "success" })));
        }),
      },
      stderr: { on: jest.fn() },
      on: jest.fn((event, callback) => {
        if (event === "close") callback(0);
      }),
      kill: jest.fn(),
    });

    const result = await (
      SharedSkillInvoker as unknown as { spawn: (...args: unknown[]) => Promise<unknown> }
    ).spawn("test.py", {});
    expect(result).toBe("success");
  });
});
