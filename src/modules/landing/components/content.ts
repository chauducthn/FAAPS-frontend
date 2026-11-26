import {
  Warning as AlertTriangle,
  BookOpen,
  Robot as Bot,
  CalendarCheck,
  GraduationCap,
  Stack as Layers,
  ChartLine as LineChart,
  ChatCircle as MessageSquare,
  ShieldCheck,
  Sparkle as Sparkles,
  type Icon as LucideIcon,
} from '@phosphor-icons/react';
import type { RoleCode } from '@/modules/auth/types/auth';

export {
  FAQ_ITEMS,
  ROLE_SHOWCASES,
  WORKFLOW_STEPS,
  type FaqItem,
  type RoleShowcaseItem,
  type WorkflowStep,
} from './contentSections';

export interface NavLinkItem {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Features', href: '#features' },
  { label: 'Portals', href: '#roles' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
];

export interface PlatformPillar {
  icon: LucideIcon;
  label: string;
  detail: string;
}

export const PLATFORM_PILLARS: PlatformPillar[] = [
  {
    icon: Layers,
    label: '3 Role-Based Portals',
    detail: 'Tailored workspaces for Students, Advisors, and Admins',
  },
  {
    icon: Sparkles,
    label: '24/7 AI Advising',
    detail: 'Instant answers on academic rules, courses, and roadmaps',
  },
  {
    icon: GraduationCap,
    label: 'Curriculum-Aligned',
    detail: 'Tracks credits, prerequisites, and graduation progress',
  },
  {
    icon: ShieldCheck,
    label: 'Google SSO Ready',
    detail: 'Sign in with your FPT account or email in seconds',
  },
];

export interface Feature {
  icon: LucideIcon;
  category: string;
  title: string;
  description: string;
  highlights: string[];
}

export const FEATURES: Feature[] = [
  {
    icon: LineChart,
    category: 'Progress',
    title: 'Transcript & Graduation Tracking',
    description:
      'Monitor cumulative GPA, earned credits, and remaining curriculum requirements in one unified view.',
    highlights: [
      'Real-time credit completion against your cohort curriculum',
      'Clear visibility into academic standing and course history',
    ],
  },
  {
    icon: BookOpen,
    category: 'Planning',
    title: 'Semester Study Plan',
    description:
      'Build and adjust your semester-by-semester learning plan without missing prerequisite chains.',
    highlights: [
      'Course catalog lookup with credit and prerequisite details',
      'Submit study plans for advisor feedback and alignment',
    ],
  },
  {
    icon: Bot,
    category: 'AI Assistant',
    title: 'AI Chat & Study Roadmap',
    description:
      'Get instant guidance on university regulations, course selection, and an AI-generated study timeline.',
    highlights: [
      'Ask regulation and curriculum questions anytime',
      'Generate personalized semester roadmaps toward graduation',
    ],
  },
  {
    icon: MessageSquare,
    category: 'Advising',
    title: 'Advising Requests & Threads',
    description:
      'Send structured questions to your assigned academic advisor and keep every reply organized.',
    highlights: [
      'Track request status from Pending to Resolved',
      'Dedicated conversation threads tied to each advising topic',
    ],
  },
  {
    icon: CalendarCheck,
    category: 'Scheduling',
    title: '1-on-1 Appointment Booking',
    description:
      'Browse your advisor’s open time slots, book meetings directly, and stay updated with reminders.',
    highlights: [
      'Self-service booking with real-time slot availability',
      'Upcoming appointment summaries right on your dashboard',
    ],
  },
  {
    icon: AlertTriangle,
    category: 'Intervention',
    title: 'Proactive Risk Monitoring',
    description:
      'Empower advisors to spot at-risk students early and reach out before academic standing is impacted.',
    highlights: [
      'Student 360° profile with attendance and status alerts',
      'Advisor AI Copilot and proactive outreach workflows',
    ],
  },
];

export function getPortalPath(role?: RoleCode): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'ADVISOR') return '/advisor';
  return '/student';
}

export function getPortalLabel(role?: RoleCode): string {
  if (role === 'ADMIN') return 'Open Admin Console';
  if (role === 'ADVISOR') return 'Open Advisor Portal';
  return 'Open Student Portal';
}
