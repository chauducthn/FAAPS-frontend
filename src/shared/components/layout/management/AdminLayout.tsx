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
  GraduationCap,
  LayoutDashboard,
  Shield,
  Users,
} from 'lucide-react';
import PortalLayout, { type PortalNavSection } from '../portal/PortalLayout';
import { NotificationBell } from './NotificationBell';

export const ADMIN_NAV_SECTIONS: PortalNavSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        description: 'System overview and key academic advising metrics.',
        to: '/admin',
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },
  {
    title: 'Users & Advisors',
    items: [
      {
        label: 'User Accounts',
        description: 'Manage student and advisor accounts, access status, and password resets.',
        to: '/admin/users',
        icon: Users,
      },
      {
        label: 'Advisor Assignments',
        description: 'Assign academic advisors to cohorts and monitor advising load.',
        to: '/admin/assignments',
        icon: Briefcase,
      },
    ],
  },
  {
    title: 'Academic Data',
    items: [
      {
        label: 'Curriculum',
        description: 'Manage curriculum versions and semester roadmaps.',
        to: '/admin/curriculum',
        icon: BookOpen,
      },
      {
        label: 'Courses',
        description: 'Maintain course catalogue, prerequisites, and bulk imports.',
        to: '/admin/courses',
        icon: Book,
      },
      {
        label: 'Attendance',
        description: 'Configure attendance thresholds and import attendance records.',
        to: '/admin/attendance',
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: 'Academic Structure',
    items: [
      {
        label: 'Majors & Cohorts',
        description: 'Configure academic majors first, then manage student intake cohorts.',
        to: '/admin/majors',
        icon: GraduationCap,
      },
    ],
  },
  {
    title: 'Reports',
    items: [
      {
        label: 'Advising Reports',
        description: 'Review advising engagement and student risk analytics.',
        to: '/admin/reports',
        icon: BarChart3,
      },
      {
        label: 'Appointments',
        description: 'Monitor scheduled and completed advising appointments.',
        to: '/admin/appointments',
        icon: CalendarCheck,
      },
    ],
  },
  {
    title: 'Academic Rules',
    items: [
      {
        label: 'Academic Rules',
        description: 'Define academic policies, credit limits, and probation rules.',
        to: '/admin/rules',
        icon: Shield,
      },
    ],
  },
  {
    title: 'AI',
    items: [
      {
        label: 'AI Configuration',
        description: 'Manage AI models, prompts, retrieval settings, and quotas.',
        to: '/admin/ai-config',
        icon: Cpu,
      },
      {
        label: 'AI Performance',
        description: 'Track AI response latency, token usage, and quality metrics.',
        to: '/admin/ai-performance',
        icon: Activity,
      },
      {
        label: 'Reported Responses',
        description: 'Review and resolve student reports on AI answers.',
        to: '/admin/ai-reports',
        icon: Flag,
      },
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
