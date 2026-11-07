/**
 * Cờ bật/tắt lớp mock cho khu vực Advisor (tư vấn + lịch hẹn + kế hoạch học tập).
 *
 * Khi mock đang bật, các service của Advisor KHÔNG gọi mạng mà đọc/ghi trực tiếp
 * vào mock store in-memory, nên mọi thao tác (accept/reject request, gửi tin nhắn,
 * đổi trạng thái lịch hẹn, sửa lịch rảnh, duyệt kế hoạch học tập) cập nhật UI
 * ngay lập tức sau khi React Query invalidate.
 *
 * Mặc định BẬT ở môi trường dev để chạy thử UI khi backend chưa sẵn sàng.
 * Tắt bằng `VITE_MOCK_ADVISOR=false` trong file `.env`.
 *
 * Trong môi trường test (vitest) mock LUÔN tắt, trừ khi test gọt tắt/bật
 * thủ công qua `setAdvisorMockEnabled`.
 */

/** Độ trễ giả lập mạng (ms) — 350ms để UI có cơ hội hiện loading/skeleton. */
export const MOCK_NETWORK_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 350;

const readEnvFlag = (): boolean | null => {
  const raw = import.meta.env.VITE_MOCK_ADVISOR;
  if (raw === undefined || raw === '') return null;
  return raw !== 'false' && raw !== '0';
};

/** Bật/tắt thủ công từ test hoặc từ console trong trình duyệt. */
let override: boolean | null = null;

export const setAdvisorMockEnabled = (enabled: boolean | null): void => {
  override = enabled;
};

/** Mock chỉ bật ngoài môi trường test (trừ khi được bật thủ công). */
export const isAdvisorMockEnabled = (): boolean => {
  if (override !== null) return override;
  if (import.meta.env.MODE === 'test') return false;
  const fromEnv = readEnvFlag();
  return fromEnv === null ? true : fromEnv;
};

/** Chờ một nhịp ngắn để UI có cơ hội hiện trạng thái loading. */
export const mockDelay = (ms: number = MOCK_NETWORK_DELAY_MS): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
