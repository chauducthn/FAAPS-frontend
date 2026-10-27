// src/components/layout/advising/AdvisorLayout.tsx
// Layout riêng cho Advisor Portal — thay thế DashboardLayout chung.

import PortalLayout from '@/components/layout/portal/PortalLayout';
import { ADVISOR_NAV_SECTIONS } from './AdvisorSidebar';
import { AdvisorHeaderExtra } from './AdvisorHeader';

export default function AdvisorLayout() {
  return (
    <PortalLayout
      navSections={ADVISOR_NAV_SECTIONS}
      homePath="/advisor"
      roleLabel="Advisor"
      headerExtra={<AdvisorHeaderExtra />}
    />
  );
}
