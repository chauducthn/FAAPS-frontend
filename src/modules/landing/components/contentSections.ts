import { GraduationCap, ShieldCheck, UserCheck, type LucideIcon } from 'lucide-react';
import type { RoleCode } from '@/modules/auth/types/auth';

export interface RoleShowcaseItem {
  id: RoleCode;
  label: string;
  icon: LucideIcon;
  tagline: string;
  summary: string;
  capabilities: string[];
  previewTitle: string;
  previewBadge: string;
  previewMetrics: { label: string; value: string }[];
  previewItems: { title: string; meta: string; status: string }[];
  ctaLabel: string;
  portalPath: string;
}

export const ROLE_SHOWCASES: RoleShowcaseItem[] = [
  {
    id: 'STUDENT',
    label: 'Student',
    icon: GraduationCap,
    tagline: 'Stay on track from first semester to graduation',
    summary:
      'Combine your official curriculum data with AI planning and direct access to your assigned academic advisor.',
    capabilities: [
      'View GPA, earned credits, and remaining graduation requirements',
      'Generate an AI study roadmap and ask regulation questions 24/7',
      'Manage your semester study plan and explore major courses',
      'Submit advising requests and book 1-on-1 advisor appointments',
    ],
    previewTitle: 'Student Portal Snapshot',
    previewBadge: 'SE · K19 Curriculum',
    previewMetrics: [
      { label: 'Credits Earned', value: '96 / 138' },
      { label: 'Current GPA', value: '8.4 / 10' },
      { label: 'Standing', value: 'Good' },
    ],
    previewItems: [
      { title: 'AI Study Roadmap', meta: '3 semesters remaining to graduation', status: 'Updated' },
      { title: 'Advising Request #104', meta: 'Elective swap for Fall semester', status: 'In Progress' },
      { title: 'Advisor Appointment', meta: 'Thu, 14:00 · Room / Online', status: 'Confirmed' },
    ],
    ctaLabel: 'Sign in to Student Portal',
    portalPath: '/student',
  },
  {
    id: 'ADVISOR',
    label: 'Academic Advisor',
    icon: UserCheck,
    tagline: 'Support every advisee with full academic context',
    summary:
      'Review student profiles, resolve advising requests faster, and intervene early when students need support.',
    capabilities: [
      'Monitor at-risk advisees with Student 360° academic snapshots',
      'Manage advising requests and threaded student conversations',
      'Review submitted study plans and confirm 1-on-1 appointments',
      'Use Academic Lookup, Advising Reports, and Advisor AI Copilot',
    ],
    previewTitle: 'Advisor Workspace Snapshot',
    previewBadge: 'Assigned Advisees',
    previewMetrics: [
      { label: 'Assigned Students', value: '120' },
      { label: 'Pending Requests', value: '6' },
      { label: 'Needs Attention', value: '4' },
    ],
    previewItems: [
      { title: 'Proactive Outreach', meta: '4 students flagged for credit/GPA review', status: 'Action' },
      { title: 'Study Plan Review', meta: 'Software Engineering · Fall Term', status: 'Pending' },
      { title: 'Academic Lookup', meta: 'Curriculum & prerequisite verification', status: 'Ready' },
    ],
    ctaLabel: 'Sign in to Advisor Portal',
    portalPath: '/advisor',
  },
  {
    id: 'ADMIN',
    label: 'Administrator',
    icon: ShieldCheck,
    tagline: 'Govern curriculum, assignments, and AI quality',
    summary:
      'Keep academic data accurate across cohorts, manage advisor workloads, and oversee AI performance.',
    capabilities: [
      'Configure majors, cohorts, curriculum versions, and course catalogs',
      'Maintain academic rules, attendance records, and user accounts',
      'Balance advisor-to-student and cohort assignments with history logs',
      'Tune AI configuration and inspect AI performance & advising reports',
    ],
    previewTitle: 'Admin Console Snapshot',
    previewBadge: 'Academic Operations',
    previewMetrics: [
      { label: 'Curriculums', value: 'Active' },
      { label: 'Academic Rules', value: 'Synced' },
      { label: 'AI System', value: 'Monitored' },
    ],
    previewItems: [
      { title: 'Curriculum & Courses', meta: 'Majors, cohorts, and prerequisites', status: 'Managed' },
      { title: 'Advisor Assignments', meta: 'Cohort mapping & transfer history', status: 'Balanced' },
      { title: 'AI Config & Reports', meta: 'Model settings and response analytics', status: 'Healthy' },
    ],
    ctaLabel: 'Sign in to Admin Console',
    portalPath: '/admin',
  },
];

export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: '01',
    title: 'Sign in with Google or Email',
    description:
      'Use your Google account for instant access—your first sign-in automatically sets up a Student profile.',
  },
  {
    step: '02',
    title: 'Select Major & Curriculum',
    description:
      'Choose your major and cohort curriculum version so FAAPS can map your required credits and courses.',
  },
  {
    step: '03',
    title: 'Plan Semesters with AI',
    description:
      'Explore your study plan, generate an AI semester roadmap, and ask questions about academic policies.',
  },
  {
    step: '04',
    title: 'Collaborate with Your Advisor',
    description:
      'Send advising requests or book a 1-on-1 appointment whenever you need official academic guidance.',
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I get a FAAPS account?',
    answer:
      'Students can register with email or sign in directly with Google—your first Google sign-in automatically creates a Student account. Advisor and Admin accounts are provisioned by the university administrator.',
  },
  {
    question: 'What is the difference between AI Chat and my Academic Advisor?',
    answer:
      'AI Chat and AI Study Roadmap are available 24/7 to help you look up academic regulations, understand course prerequisites, and draft semester timelines. Your assigned Academic Advisor handles official advising requests, study plan reviews, and 1-on-1 consultations.',
  },
  {
    question: 'What if I have not selected my major or curriculum yet?',
    answer:
      'After signing in, FAAPS guides you to complete your student profile by selecting your major and curriculum version. You can also update it later from your Profile page to unlock accurate graduation tracking.',
  },
  {
    question: 'How do I book an appointment with my advisor?',
    answer:
      'Open the Appointments section in the Student Portal to browse your advisor’s available time slots, pick a convenient time, and receive status updates directly in your dashboard notifications.',
  },
  {
    question: 'How does FAAPS calculate my graduation progress?',
    answer:
      'Your progress is calculated against the official curriculum version assigned to your cohort, comparing completed credits and passed courses with total required credits and academic rules.',
  },
];
