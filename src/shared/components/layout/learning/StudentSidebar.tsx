// Student portal navigation sidebar organized around Study Setup/Plan and AI-assisted Advising.
import {
  Robot as BotMessageSquare,
  CalendarDot as CalendarClock,
  FileText,
  GraduationCap,
  SquaresFour as LayoutDashboard,
  ListChecks,
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
        label: 'Curriculum Courses',
        to: '/student/curriculum',
        icon: GraduationCap,
        description: 'Configure major, specialization & electives, import transcript, and view curriculum courses.',
      },
      {
        label: 'Study Journey',
        to: '/student/study-journey',
        icon: Target,
        description: 'Set your expected graduation semester, career orientation, and target GPA.',
      },
      {
        label: 'AI Study Roadmap',
        to: '/student/ai-roadmap',
        icon: Route,
        description: 'Generate a personalized semester-by-semester study roadmap with AI.',
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
  {
    title: 'RECORDS',
    items: [
      {
        label: 'Academic Transcript',
        to: '/student/transcript',
        icon: FileText,
        description: 'Review your GPA, semester summary, course grades, and import transcript versions.',
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
