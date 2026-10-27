// src/components/layout/learning/StudentSidebar.tsx
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
    items: [{ label: 'Home', to: '/student', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'ACADEMICS',
    items: [
      { label: 'Chat AI', to: '/student/ai-chat', icon: BotMessageSquare },
      { label: 'AI Roadmap', to: '/student/ai-roadmap', icon: Route },
      { label: 'Academic Overview', to: '/student/academic-overview', icon: ClipboardList },
      { label: 'Profile', to: '/student/profile', icon: UserRound },
      { label: 'Transcript', to: '/student/transcript', icon: FileText },
      { label: 'Courses & Curriculum', to: '/student/courses', icon: BookOpenCheck },
      { label: 'Study Plans', to: '/student/plans', icon: ClipboardList },
    ],
  },
  {
    title: 'ADVISING',
    items: [
      { label: 'Advising Requests', to: '/student/advising-requests', icon: MessageSquareText },
      { label: 'Advising Conversations', to: '/student/advising', icon: MessageSquareText },
      { label: 'Book Appointment', to: '/student/appointments', icon: CalendarClock },
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
