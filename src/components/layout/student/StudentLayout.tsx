// src/components/layout/student/StudentLayout.tsx
// Layout riêng cho Student Portal — thay thế DashboardLayout chung (header "FAAPS | ROLE" của admin).
// Cấu trúc giống AdminLayout: sidebar trái, header sticky, menu overlay trên mobile.

import PortalLayout from '@/components/layout/portal/PortalLayout';
import { STUDENT_NAV_SECTIONS } from './StudentSidebar';
import { StudentHeaderExtra } from './StudentHeader';

export default function StudentLayout() {
  return (
    <PortalLayout
      navSections={STUDENT_NAV_SECTIONS}
      homePath="/student"
      roleLabel="Sinh viên"
      headerExtra={<StudentHeaderExtra />}
    />
  );
}
