// src/components/layout/student/StudentHeader.tsx
// Header riêng cho Sinh viên: logo, chuông thông báo, avatar + tên + vai trò, menu đăng xuất.
// (Phần khung header do PortalLayout dựng; component này gom các phần nội dung header vào một chỗ.)

import { StudentNotificationBell } from './StudentNotificationBell';
import { MockDataToggle } from '@/components/admin/MockDataToggle';

/** Các phần nội dung bên phải của header sinh viên. */
export function StudentHeaderExtra() {
  return (
    <>
      <MockDataToggle scope="portal" />
      <StudentNotificationBell />
    </>
  );
}
