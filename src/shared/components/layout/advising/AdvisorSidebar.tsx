// src/components/layout/advising/AdvisorSidebar.tsx
// Menu điều hướng riêng cho Cố vấn.

import { BookOpen, CalendarDays, ClipboardCheck, Inbox, LayoutDashboard, MessageSquareText, UserRound, UsersRound } from 'lucide-react';
import {
  PortalSidebar,
  type PortalNavSection,
} from '@/shared/components/layout/portal/PortalLayout';

export const ADVISOR_NAV_SECTIONS: PortalNavSection[] = [
  {
    items: [{ label: 'Overview', to: '/advisor', icon: LayoutDashboard, end: true }],
  },
  {
    items: [
      { label: 'Advising Requests', to: '/advisor/advising-requests', icon: Inbox },
      { label: 'My Students', to: '/advisor/students', icon: UsersRound },
      { label: 'Advising Conversations', to: '/advisor/conversations', icon: MessageSquareText },
      { label: 'Study Plan Reviews', to: '/advisor/study-plans', icon: ClipboardCheck },
      { label: 'Appointments', to: '/advisor/appointments', icon: CalendarDays },
      { label: 'Academic Lookup', to: '/advisor/academic-lookup', icon: BookOpen },
      { label: 'My Profile', to: '/advisor/profile', icon: UserRound },
    ],
  },
];

export function AdvisorSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <PortalSidebar
      navSections={ADVISOR_NAV_SECTIONS}
      homePath="/advisor"
      onNavigate={onNavigate}
    />
  );
}
