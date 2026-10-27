import { describe, expect, it } from 'vitest';
import { loginSchema } from './auth.schema';

describe('login validation', () => {
  it('accepts the local admin identifier', () => {
    expect(loginSchema.safeParse({ email: 'admin', password: 'abc123' }).success).toBe(true);
  });

  it('accepts a valid Google account email', () => {
    expect(loginSchema.safeParse({ email: 'student@fpt.edu.vn', password: 'secret1' }).success).toBe(true);
  });

  it('rejects invalid identifiers and short passwords', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: '123' }).success).toBe(false);
  });
});
