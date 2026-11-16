import { describe, expect, it } from 'vitest';
import { buildResetCsv, canResetPassword, NO_PASSWORD_REASON } from './passwordReset';

describe('canResetPassword', () => {
  it('allows an account the backend says has a password', () => {
    expect(canResetPassword({ hasPassword: true })).toBe(true);
  });

  it('blocks an account the backend says has no password', () => {
    expect(canResetPassword({ hasPassword: false })).toBe(false);
  });

  /**
   * The current backend does not send `hasPassword` on `GET /admin/users`.
   * Treating a missing field as "no password" would lock out every account,
   * including the ones that sign in with an @fpt.edu.vn email and a password.
   */
  it('allows an account when the backend did not say either way', () => {
    expect(canResetPassword({})).toBe(true);
    expect(canResetPassword({ hasPassword: undefined })).toBe(true);
  });

  it('explains why a Google-only account cannot be reset', () => {
    expect(NO_PASSWORD_REASON).toMatch(/google/i);
  });
});

describe('buildResetCsv', () => {
  it('writes one row per account and keeps the reason for the ones left alone', () => {
    const csv = buildResetCsv([
      { email: 'a@fpt.edu.vn', status: 'SUCCESS', newPassword: 'Pass1!', reason: null },
      { email: 'b@fpt.edu.vn', status: 'SKIPPED', newPassword: null, reason: 'Google only' },
    ]);

    expect(csv).toContain('"a@fpt.edu.vn"');
    expect(csv).toContain('"Pass1!"');
    expect(csv).toContain('"b@fpt.edu.vn"');
    expect(csv).toContain('"Google only"');
    // A skipped account never carries a password.
    expect(csv).not.toContain('"b@fpt.edu.vn","SKIPPED","Pass');
  });

  it('quotes a cell that contains a comma or a quote', () => {
    const csv = buildResetCsv([
      { email: 'a@fpt.edu.vn', status: 'FAILED', newPassword: null, reason: 'bad, "really"' },
    ]);

    expect(csv).toContain('"bad, ""really"""');
  });
});
