// src/components/layout/student/StudentSidebar.tsx
// Menu điều hướng riêng cho Sinh viên.

import {
  BookOpenCheck,
  BotMessageSquare,
  CalendarClock,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  Route,
  UserRound,
} from 'lucide-react';
import {
  PortalSidebar,
  type PortalNavSection,
} from '@/components/layout/portal/PortalLayout';

export const STUDENT_NAV_SECTIONS: PortalNavSection[] = [
  {
    items: [{ label: 'Trang chủ', to: '/student', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Học tập',
    items: [
      { label: 'Chat AI', to: '/student/ai-chat', icon: BotMessageSquare },
      { label: 'Lộ trình học', to: '/student/ai-roadmap', icon: Route },
      { label: 'Tổng quan học tập', to: '/student/academic-overview', icon: ClipboardList },
      { label: 'Hồ sơ', to: '/student/profile', icon: UserRound },
      { label: 'Bảng điểm', to: '/student/transcript', icon: FileText },
      { label: 'Môn học & khung CT', to: '/student/courses', icon: BookOpenCheck },
      { label: 'Kế hoạch học', to: '/student/plans', icon: ClipboardList },
    ],
  },
  {
    title: 'Tư vấn',
    items: [
      { label: 'Yêu cầu tư vấn', to: '/student/advising-requests', icon: MessageSquareText },
      { label: 'Trao đổi tư vấn', to: '/student/advising', icon: MessageSquareText },
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
