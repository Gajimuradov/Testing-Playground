import { describe, expect, it } from 'vitest';
import { requestSchema } from './requestSchema';

describe('requestSchema', () => {
  it('accepts a valid request payload', () => {
    const result = requestSchema.safeParse({
      title: 'Cannot access billing report',
      description: 'Finance team cannot open the latest billing report.',
      priority: 'high',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a title that is too short', () => {
    const result = requestSchema.safeParse({
      title: 'Hi',
      description: 'A complete description for the request.',
      priority: 'medium',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an unsupported priority', () => {
    const result = requestSchema.safeParse({
      title: 'Cannot access billing report',
      description: 'Finance team cannot open the latest billing report.',
      priority: 'critical',
    });

    expect(result.success).toBe(false);
  });
});
