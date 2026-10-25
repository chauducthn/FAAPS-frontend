// src/components/layout/student/StudentSidebar.tsx
// Menu điều hướng riêng cho Sinh viên.

import { CalendarClock, LayoutDashboard, MessageSquareText } from 'lucide-react';
import {
  PortalSidebar,
  type PortalNavSection,
} from '@/components/layout/portal/PortalLayout';

export const STUDENT_NAV_SECTIONS: PortalNavSection[] = [
  {
    items: [{ label: 'Trang chủ', to: '/student', icon: LayoutDashboard, end: true }],
  },
  {
    items: [
      { label: 'Yêu cầu tư vấn', to: '/student/advising-requests', icon: MessageSquareText },
      { label: 'Đặt lịch hẹn', to: '/student/appointments', icon: CalendarClock },
    ],
  },
];

export function StudentSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <PortalSidebar
      navSections={STUDENT_NAV_SECTIONS}
      homePath="/student"
      onNavigate={onNavigate}
    />
  );
}
