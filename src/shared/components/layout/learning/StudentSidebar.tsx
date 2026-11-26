// Student portal navigation sidebar organized around Study Setup/Plan and AI-assisted Advising.
import {
  BookOpenText as BookOpenCheck,
  Robot as BotMessageSquare,
  CalendarDot as CalendarClock,
  FileText,
  SquaresFour as LayoutDashboard,
  ListChecks,
  MapTrifold as Map,
  ChatCircleText as MessageSquareText,
  Path as Route,
  Target,
} from '@phosphor-icons/react';
import {
  PortalSidebar,
  type PortalNavSection,
} from '@/shared/components/layout/portal/PortalLayout';

export const STUDENT_NAV_SECTIONS: PortalNavSection[] = [
  {
    items: [
      {
        label: 'Home',
        to: '/student',
        icon: LayoutDashboard,
        end: true,
        description: 'Track your academic standing, GPA progress, and upcoming advising tasks.',
      },
      {
        label: 'Advisor Assistant',
        to: '/student/ai-chat',
        icon: BotMessageSquare,
        description: 'Get personalized study advice, strengths & weaknesses analysis, and course guidance.',
      },
    ],
  },
  {
    title: 'STUDY SETUP & PLAN',
    items: [
      {
        label: 'Curriculum & Goals',
        to: '/student/curriculum-goals',
        icon: Target,
        description: 'Configure your major, curriculum version, and graduation targets.',
      },
      {
        label: 'Transcript & Import',
        to: '/student/transcript',
        icon: FileText,
        description: 'Upload your FPTU transcript and review completed courses and grades.',
      },
      {
        label: 'AI Study Roadmap',
        to: '/student/ai-roadmap',
        icon: Route,
        description: 'Generate a personalized semester-by-semester study roadmap with AI.',
      },
      {
        label: 'Study Plan Board',
        to: '/student/study-plan',
        icon: Map,
        description: 'Organize and track your planned courses across upcoming semesters.',
      },
      {
        label: 'Courses',
        to: '/student/courses',
        icon: BookOpenCheck,
        description: 'Browse course details, credits, and prerequisite chains.',
      },
      {
        label: 'Learning Tasks',
        to: '/student/learning-plan',
        icon: ListChecks,
        description: 'Manage your study tasks, milestones, and action items.',
      },
    ],
  },
  {
    title: 'ADVISING',
    items: [
      {
        label: 'Book Appointment',
        to: '/student/appointments',
        icon: CalendarClock,
        description: 'Schedule and manage 1-on-1 advising sessions with your academic advisor.',
      },
      {
        label: 'Advising Requests',
        to: '/student/advising-requests',
        icon: MessageSquareText,
        description: 'Send academic questions and follow up on responses from your advisor.',
      },
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
