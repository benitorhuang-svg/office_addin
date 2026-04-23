/**
 * Unit tests: Logger ??structured JSON output, secret redaction, requestId scoping
 */
import { logger } from '@shared/logger/index.js';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('writes structured JSON to stdout', () => {
    logger.info('TestTag', 'hello world', { count: 42 });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const line = consoleSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(line);

    expect(parsed.level).toBe('info');
    expect(parsed.tag).toBe('TestTag');
    expect(parsed.message).toBe('hello world');
    expect(parsed.data).toEqual({ count: 42 });
    expect(parsed.timestamp).toBeDefined();
  });

  it('redacts sensitive keys', () => {
    logger.info('Auth', 'token check', { apiKey: 'sk-secret', authorization: 'Bearer tok', safe: 'visible' });

    const line = consoleSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(line);

    expect(parsed.data.apiKey).toBe('[REDACTED]');
    expect(parsed.data.authorization).toBe('[REDACTED]');
    expect(parsed.data.safe).toBe('visible');
    // Ensure actual secret never appears in output
    expect(line).not.toContain('sk-secret');
  });

  it('includes requestId when using withReqId scoped logger', () => {
    const scoped = logger.withReqId('req-abc-123');
    scoped.warn('Route', 'not found');

    const line = warnSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(line);

    expect(parsed.requestId).toBe('req-abc-123');
    expect(parsed.level).toBe('warn');
  });

  it('serializes Error objects safely', () => {
    const err = new Error('test failure');
    logger.error('Crash', 'something broke', err);

    const line = errorSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(line);

    expect(parsed.data.name).toBe('Error');
    expect(parsed.data.message).toBe('test failure');
    expect(typeof parsed.data.stack).toBe('string');
  });

  it('handles circular references without throwing', () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj.self = obj;

    expect(() => logger.info('Tag', 'circular', obj)).not.toThrow();

    const line = consoleSpy.mock.calls[0][0] as string;
    expect(line).toContain('[Circular]');
  });

  it('omits data field when no data is provided', () => {
    logger.info('Tag', 'no data');

    const line = consoleSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(line);

    expect(parsed).not.toHaveProperty('data');
  });
});
