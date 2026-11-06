/**
 * Cờ bật/tắt lớp mock cho khu vực Curriculum / Cohort của Admin.
 *
 * Khi mock đang bật, các service dưới đây trả dữ liệu giả bám đúng contract
 * OpenAPI của backend thay vì gọi mạng:
 *   - GET  /admin/curriculums            -> Page<CurriculumItem>
 *   - GET  /admin/curriculums/{id}/courses -> CurriculumCourseItem[]
 *   - GET  /admin/cohorts                -> Page<CurriculumItem>
 *
 * Mặc định BẬT ở môi trường dev để chạy thử UI khi backend chưa sẵn sàng.
 * Tắt bằng cách đặt `VITE_MOCK_CURRICULUM=false` trong file `.env`.
 *
 * Trong môi trường test (vitest) mock LUÔN tắt, trừ khi test gọi tắt/bật
 * thủ công qua `setCurriculumMockEnabled`.
 */

const MOCK_MODE_FLAG = true;

/** Độ trễ giả lập mạng (ms) cho các lời gọi mock — 500ms để test loading/skeleton. */
export const MOCK_NETWORK_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 500;

const readEnvFlag = (): boolean | null => {
  const raw = import.meta.env.VITE_MOCK_CURRICULUM;
  if (raw === undefined || raw === '') return null;
  return raw !== 'false' && raw !== '0';
};

/** Bật/tắt thủ công từ test hoặc từ console trong trình duyệt. */
let override: boolean | null = null;

export const setCurriculumMockEnabled = (enabled: boolean | null): void => {
  override = enabled;
};

/** Mock chỉ bật ngoài môi trường test (trừ khi được bật thủ công). */
export const isCurriculumMockEnabled = (): boolean => {
  if (override !== null) return override;
  if (import.meta.env.MODE === 'test') return false;
  const fromEnv = readEnvFlag();
  return fromEnv === null ? MOCK_MODE_FLAG : fromEnv;
};

/** Chờ một nhịp ngắn để UI có cơ hội hiện trạng thái loading. */
export const mockDelay = (ms: number = MOCK_NETWORK_DELAY_MS): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
