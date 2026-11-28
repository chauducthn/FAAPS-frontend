// src/modules/appointment/types/advisorOption.ts
// Types cho danh sách Advisor mà sinh viên có thể đặt lịch.
//
// Endpoint BE (GET /student/appointments/advisors) trả về danh sách advisor
// kèm cờ "cùng Major Group" — BE đã sort ưu tiên người cùng nhóm ngành lên đầu.
//
// Shape BE tham chiếu: AdvisorOptionDto { id, fullName, email, assigned }.

import type { AvailableSlot } from './appointment';

/** Một advisor mà sinh viên có thể đặt lịch. */
export interface AdvisorOption {
  /** users.id — advisors.user_id. */
  id: string;
  /** users.full_name. */
  fullName: string;
  /** users.email. */
  email: string | null;
  /** Cố vấn được phân công cứng cho sinh viên (mô hình cũ). */
  assigned?: boolean;
  /**
   * Cố vấn có cùng Major Group với sinh viên hay không.
   *
   * BE có thể đặt tên field khác (`sameMajorGroup`, `sameMajorGroupCode`, ...) —
   * FE đọc theo helper `isSameMajorGroup` để không vỡ khi contract đổi.
   */
  sameMajorGroup?: boolean;
  /** Mã nhóm ngành của cố vấn (nếu BE trả về). */
  majorGroupCode?: string | null;
  /** Tên nhóm ngành của cố vấn (nếu BE trả về). */
  majorGroupName?: string | null;
  /** Slot trống của cố vấn trong ngày đang chọn (nếu BE gộp sẵn vào response). */
  slots?: AvailableSlot[];
}

/**
 * Đọc cờ "cùng Major Group" một cách linh hoạt.
 *
 * BE có thể dùng nhiều tên field khác nhau ⇒ thử lần lượt, chỉ coi là đúng
 * khi giá trị là boolean `true` (không coi chuỗi "false" là đúng).
 */
export function isSameMajorGroup(advisor: AdvisorOption | null | undefined): boolean {
  if (!advisor) return false;
  const bag = advisor as unknown as Record<string, unknown>;
  const raw = bag.sameMajorGroup ?? bag.sameMajorGroupId ?? bag.sameMajorGroupCode;
  return raw === true;
}
