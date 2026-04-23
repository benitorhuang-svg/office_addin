import { SharedSkillInvoker } from '../shared/shared-invoker';
import { spawn } from 'child_process';

jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

describe('SharedSkillInvoker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject on timeout', async () => {
    jest.useFakeTimers();
    const mockSpawn = spawn as jest.Mock;
    let closeCallback: any;
    
    mockSpawn.mockReturnValue({
      stdin: { write: jest.fn(), end: jest.fn() },
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn((event, callback) => {
        if (event === 'close') closeCallback = callback;
      }),
      kill: jest.fn(),
    });

    const promise = (SharedSkillInvoker as any).spawn('test.py', {});
    
    // Advance timers by 31s (timeout is 30s)
    jest.advanceTimersByTime(31000);
    
    // Trigger close manually since it's a mock
    if (closeCallback) closeCallback(null);
    
    await expect(promise).rejects.toThrow(/Execution timeout after 30s/);
    jest.useRealTimers();
  });

  it('should reject on JSON parse failure', async () => {
    const mockSpawn = spawn as jest.Mock;
    
    mockSpawn.mockReturnValue({
      stdin: { write: jest.fn(), end: jest.fn() },
      stdout: {
        on: jest.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from('Invalid JSON {'));
        }),
      },
      stderr: { on: jest.fn() },
      on: jest.fn((event, callback) => {
        if (event === 'close') callback(0);
      }),
      kill: jest.fn(),
    });

    await expect((SharedSkillInvoker as any).spawn('test.py', {})).rejects.toThrow(/Failed to parse test.py output JSON/);
  });

  it('should process successful JSON output', async () => {
    const mockSpawn = spawn as jest.Mock;
    
    mockSpawn.mockReturnValue({
      stdin: { write: jest.fn(), end: jest.fn() },
      stdout: {
        on: jest.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from(JSON.stringify({ results: 'success' })));
        }),
      },
      stderr: { on: jest.fn() },
      on: jest.fn((event, callback) => {
        if (event === 'close') callback(0);
      }),
      kill: jest.fn(),
    });

    const result = await (SharedSkillInvoker as any).spawn('test.py', {});
    expect(result).toBe('success');
  });

  it('should reject if stderr returns error code', async () => {
    const mockSpawn = spawn as jest.Mock;
    
    mockSpawn.mockReturnValue({
      stdin: { write: jest.fn(), end: jest.fn() },
      stdout: { on: jest.fn() },
      stderr: {
        on: jest.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from('Something went wrong'));
        }),
      },
      on: jest.fn((event, callback) => {
        if (event === 'close') callback(1); // non-zero exit code
      }),
      kill: jest.fn(),
    });

    await expect((SharedSkillInvoker as any).spawn('test.py', {})).rejects.toThrow(/Shared Skill Error \[test.py\]/);
  });
});
