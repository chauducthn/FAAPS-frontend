import { describe, expect, it } from 'vitest';
import { loginSchema } from './auth.schema';

describe('login validation', () => {
  it('no longer accepts a username such as admin', () => {
    expect(loginSchema.safeParse({ email: 'admin', password: 'abc123' }).success).toBe(false);
  });

  it('accepts a valid email', () => {
    expect(loginSchema.safeParse({ email: 'student@fpt.edu.vn', password: 'secret1' }).success).toBe(true);
  });

  it('rejects invalid emails and short passwords', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: '123456' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@fpt.edu.vn', password: '123' }).success).toBe(false);
  });
});
