// src/modules/auth/mocks/mockAdvisorSession.ts
// Phiên đăng nhập giả cho Advisor — chỉ dùng ở môi trường dev.
//
// Backend hiện chỉ cho Advisor đăng nhập qua Google OAuth, nên khi chạy
// frontend một mình (chưa có backend, hoặc chưa cấu hình Google) thì không
// có cách nào vào khu vực Advisor để kiểm thử. Phiên giả này cho phép mở
// thẳng /advisor với dữ liệu mock in-memory.
//
// Tắt bằng `VITE_MOCK_ADVISOR=false` trong file `.env`.
// Trong môi trường test (vitest) mock LUÔN tắt.

import type { User } from '../types/auth';
import { MOCK_ADVISOR_ID, MOCK_ADVISOR_NAME } from '@/modules/advising/mocks/advisorMockData';

/** User giả đóng vai Advisor — id trùng với hồ sơ trong mock store. */
export const MOCK_ADVISOR_SESSION_USER: User = {
  id: MOCK_ADVISOR_ID,
  email: 'khoa.tm@fpt.edu.vn',
  fullName: MOCK_ADVISOR_NAME,
  role: 'ADVISOR',
  status: 'ACTIVE',
};
