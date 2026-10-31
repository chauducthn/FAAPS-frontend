/**
 * Cờ bật/tắt chế độ mock của frontend.
 *
 * Khi `IS_MOCK_MODE = true`, các service của Advisor trả về dữ liệu giả
 * (xem `src/mocks/advisorMockData.ts`) thay vì gọi backend — hữu ích khi
 * chưa có token đăng nhập thật nên mọi request đều trả 401.
 *
 * Trong môi trường test (vitest) mock luôn tắt, để các test contract API
 * vẫn assert được endpoint thực sự được gọi.
 *
 * NHỚ: đặt lại `false` (hoặc xóa cờ) trước khi merge lên nhánh chính.
 */
const MOCK_MODE_FLAG = true;

/** Chế độ mock chỉ bật ngoài môi trường test. */
export const IS_MOCK_MODE = import.meta.env.MODE !== 'test' && MOCK_MODE_FLAG;

/** Độ trễ giả lập mạng (ms) cho các lời gọi mock. */
export const MOCK_NETWORK_DELAY_MS = 500;
