// src/components/layout/advising/AdvisorSidebar.tsx
// Menu điều hướng riêng cho Cố vấn — chia theo phân khu giống AdminSidebar.
//
// Mỗi phân khu có label nhỏ xám mờ phía trên; mục đang chờ xử lý hiện badge
// cam FPT để advisor thấy ngay việc cần làm mà không phải mở từng trang.

import { useMemo } from 'react';
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Inbox,
  LayoutDashboard,
  MessageSquareText,
  UserRound,
  UsersRound,
} from 'lucide-react';
import {
  PortalSidebar,
  type PortalNavSection,
} from '@/shared/components/layout/portal/PortalLayout';
import { useAdvisorAdvisingRequests } from '@/modules/advising/hooks/queries/useAdvisorQueries';
import { useAllAdvisorAppointments } from '@/modules/appointment/hooks/queries/useAppointmentQueries';

/** Bộ mục điều hướng gốc — badge được gắn động ở component bên dưới. */
const NAV_SECTIONS: PortalNavSection[] = [
  {
    title: 'WORKSPACE',
    items: [
      { label: 'Overview', to: '/advisor', icon: LayoutDashboard, end: true },
      { label: 'My Students', to: '/advisor/students', icon: UsersRound },
      { label: 'My Profile', to: '/advisor/profile', icon: UserRound },
    ],
  },
  {
    title: 'ADVISING',
    items: [
      { label: 'Advising Requests', to: '/advisor/advising-requests', icon: Inbox },
      { label: 'Advising Conversations', to: '/advisor/conversations', icon: MessageSquareText },
      { label: 'Study Plan Reviews', to: '/advisor/study-plans', icon: ClipboardCheck },
    ],
  },
  {
    title: 'APPOINTMENTS',
    items: [{ label: 'Appointments', to: '/advisor/appointments', icon: CalendarDays }],
  },
  {
    title: 'RESOURCES',
    items: [{ label: 'Academic Search', to: '/advisor/academic-lookup', icon: BookOpen }],
  },
];

/** Bản tĩnh — dùng khi cần khai báo route/label ngoài component. */
export const ADVISOR_NAV_SECTIONS: PortalNavSection[] = NAV_SECTIONS;

export function AdvisorSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pendingRequests = useAdvisorAdvisingRequests({ status: 'PENDING' });
  const appointments = useAllAdvisorAppointments();

  const pendingAppointments = useMemo(
    () => (appointments.data ?? []).filter((a) => a.status === 'PENDING').length,
    [appointments.data],
  );

  const sections = useMemo<PortalNavSection[]>(
    () =>
      NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.to === '/advisor/advising-requests') {
            return { ...item, badge: pendingRequests.data?.length ?? 0 };
          }
          if (item.to === '/advisor/appointments') {
            return { ...item, badge: pendingAppointments };
          }
          return item;
        }),
      })),
    [pendingRequests.data?.length, pendingAppointments],
  );

  return (
    <PortalSidebar
      navSections={sections}
      homePath="/advisor"
      onNavigate={onNavigate}
    />
  );
}
