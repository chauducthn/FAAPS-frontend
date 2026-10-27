// src/components/layout/advising/AdvisorSidebar.tsx
// Menu điều hướng riêng cho Cố vấn.

import { CalendarDays, Inbox, LayoutDashboard, MessageSquareText } from 'lucide-react';
import {
  PortalSidebar,
  type PortalNavSection,
} from '@/components/layout/portal/PortalLayout';

export const ADVISOR_NAV_SECTIONS: PortalNavSection[] = [
  {
    items: [{ label: 'Overview', to: '/advisor', icon: LayoutDashboard, end: true }],
  },
  {
    items: [
      { label: 'Advising Requests', to: '/advisor/advising-requests', icon: Inbox },
      { label: 'Advising Conversations', to: '/advisor/conversations', icon: MessageSquareText },
      { label: 'Appointments', to: '/advisor/appointments', icon: CalendarDays },
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
