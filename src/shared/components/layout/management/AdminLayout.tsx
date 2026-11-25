import {
  Activity,
  BarChart3,
  Book,
  BookOpen,
  Briefcase,
  CalendarCheck,
  ClipboardCheck,
  Cpu,
  Flag,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import PortalLayout, { type PortalNavSection } from '../portal/PortalLayout';
import { NotificationBell } from './NotificationBell';

export const ADMIN_NAV_SECTIONS: PortalNavSection[] = [
  {
    items: [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Users & Advisors',
    items: [
      { label: 'User Accounts', to: '/admin/users', icon: UserIcon },
      { label: 'Advisor Assignments', to: '/admin/assignments', icon: Briefcase },
    ],
  },
  {
    title: 'Academic Data',
    items: [
      { label: 'Curriculum', to: '/admin/curriculum', icon: BookOpen },
      { label: 'Courses', to: '/admin/courses', icon: Book },
      { label: 'Attendance', to: '/admin/attendance', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Academic Structure',
    items: [
      { label: 'Majors', to: '/admin/majors', icon: GraduationCap },
      { label: 'Cohorts', to: '/admin/cohorts', icon: FolderOpen },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Advising Reports', to: '/admin/reports', icon: BarChart3 },
      { label: 'Appointments', to: '/admin/appointments', icon: CalendarCheck },
    ],
  },
  {
    title: 'Academic Rules',
    items: [{ label: 'Academic Rules', to: '/admin/rules', icon: Shield }],
  },
  {
    title: 'AI',
    items: [
      { label: 'AI Configuration', to: '/admin/ai-config', icon: Cpu },
      { label: 'AI Performance', to: '/admin/ai-performance', icon: Activity },
      { label: 'Reported Responses', to: '/admin/ai-reports', icon: Flag },
    ],
  },
];

export default function AdminLayout() {
  return (
    <PortalLayout
      navSections={ADMIN_NAV_SECTIONS}
      homePath="/admin"
      roleLabel="Admin"
      profilePath="/admin/profile"
      headerExtra={<NotificationBell />}
    />
  );
}
