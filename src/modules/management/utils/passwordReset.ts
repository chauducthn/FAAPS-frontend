// Helpers for the password reset flow.
//
// The new passwords exist for one moment only: the backend hands them over
// with the reset response and nothing in this app keeps a copy. These
// helpers move a password from that response to the clipboard or to a file
// the admin hands over manually — they never store it anywhere.

/** Copies text to the clipboard. Returns false when the browser refuses. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Escapes one CSV cell: quotes, commas and line breaks. */
function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

/**
 * Builds the CSV the admin can hand to the account holders.
 *
 * Only accounts that were actually reset carry a password; the others keep
 * their status and the reason they were left alone.
 */
export function buildResetCsv(
  rows: { email: string; status: string; newPassword?: string | null; reason?: string | null }[],
): string {
  const header = ['Email', 'Status', 'Password', 'Note'];
  const lines = rows.map((row) =>
    [
      csvCell(row.email),
      csvCell(row.status),
      csvCell(row.newPassword ?? ''),
      csvCell(row.reason ?? ''),
    ].join(','),
  );
  // A BOM keeps Excel from mangling the accented names of the account holders.
  return `﻿${[header.map(csvCell).join(','), ...lines].join('\r\n')}`;
}

/** Offers the CSV as a download. The object URL is released right after. */
export function downloadResetCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Quy tắc xác định một account có thể reset password hay không.
 *
 * Backend quyết định kết quả thật (mỗi entry trả về kèm SUCCESS / SKIPPED /
 * FAILED), nên phía frontend chỉ cần biết trước để chặn những case chắc chắn
 * không reset được.
 *
 * `hasPassword` là field **optional** vì `GET /admin/users` của backend hiện
 * chưa trả về field này. Vì vậy quy tắc ở đây là fail-open: chỉ chặn khi
 * backend nói rõ là không có password (`hasPassword === false`), tuyệt đối không
 * chặn khi thiếu thông tin — nếu không thì mọi account (kể cả account đăng
 * nhập bằng email FPT và có password) sẽ bị khoá vô lý.
 */

/** Lý do hiển thị khi account không có local password. */
export const NO_PASSWORD_REASON = 'This account signs in with Google, so it has no password to reset.';

/**
 * Một account có thể reset password hay không.
 *
 * - `hasPassword === true`  → có password, reset được.
 * - `hasPassword === false` → chắc chắn là Google-only, không reset được.
 * - `hasPassword` thiếu    → không đủ thông tin, cho phép thử (backend sẽ
 *   trả SKIPPED nếu thật sự không có password).
 */
export function canResetPassword(user: { hasPassword?: boolean }): boolean {
  return user.hasPassword !== false;
}
