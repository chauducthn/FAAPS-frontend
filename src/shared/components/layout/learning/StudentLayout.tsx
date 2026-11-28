// src/components/layout/learning/StudentLayout.tsx
// Layout riêng cho Student Portal — thay thế DashboardLayout chung (header "FAAPS | ROLE" của admin).
// Cấu trúc giống AdminLayout: sidebar trái, header sticky, menu overlay trên mobile.

import PortalLayout from '@/shared/components/layout/portal/PortalLayout';
import { STUDENT_NAV_SECTIONS } from './StudentSidebar';
import { StudentHeaderExtra } from './StudentHeader';
import { StudentProfilePanel } from '@/modules/learning/components/StudentProfilePanel';

export default function StudentLayout() {
  return (
    <PortalLayout
      navSections={STUDENT_NAV_SECTIONS}
      homePath="/student"
      roleLabel="Student"
      headerExtra={<StudentHeaderExtra />}
      profilePanel={<StudentProfilePanel />}
    />
  );
}
