// src/components/layout/advisor/AdvisorHeader.tsx
// Header riêng cho Cố vấn: logo, nút demo data, avatar + tên + vai trò, menu đăng xuất.

import { MockDataToggle } from '@/components/admin/MockDataToggle';

/** Các phần nội dung bên phải của header cố vấn. */
export function AdvisorHeaderExtra() {
  return <MockDataToggle scope="portal" />;
}
