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
    items: [{ label: 'Home', to: '/student', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'STUDY SETUP & PLAN',
    items: [
      { label: 'Curriculum & Goals', to: '/student/curriculum-goals', icon: Target },
      { label: 'Transcript & Import', to: '/student/transcript', icon: FileText },
      { label: 'AI Study Roadmap', to: '/student/ai-roadmap', icon: Route },
      { label: 'Study Plan Board', to: '/student/study-plan', icon: Map },
      { label: 'Courses', to: '/student/courses', icon: BookOpenCheck },
      { label: 'Learning Tasks', to: '/student/learning-plan', icon: ListChecks },
    ],
  },
  {
    title: 'AI & ADVISING',
    items: [
      { label: 'AI Advisor Chat', to: '/student/ai-chat', icon: BotMessageSquare },
      { label: 'Book Appointment', to: '/student/appointments', icon: CalendarClock },
      { label: 'Advising Requests', to: '/student/advising-requests', icon: MessageSquareText },
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
