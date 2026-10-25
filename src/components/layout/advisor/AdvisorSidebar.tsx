// src/components/layout/advisor/AdvisorSidebar.tsx
// Menu điều hướng riêng cho Cố vấn.

import { CalendarDays, Inbox, LayoutDashboard } from 'lucide-react';
import {
  PortalSidebar,
  type PortalNavSection,
} from '@/components/layout/portal/PortalLayout';

export const ADVISOR_NAV_SECTIONS: PortalNavSection[] = [
  {
    items: [{ label: 'Tổng quan', to: '/advisor', icon: LayoutDashboard, end: true }],
  },
  {
    items: [
      { label: 'Yêu cầu tư vấn', to: '/advisor/advising-requests', icon: Inbox },
      { label: 'Lịch hẹn', to: '/advisor/appointments', icon: CalendarDays },
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
