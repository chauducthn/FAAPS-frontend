import { BookOpen, Bot, CalendarCheck, GraduationCap, LineChart, MessageSquare, type LucideIcon } from 'lucide-react';

export const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Get started', href: '#start' },
];

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: LineChart,
    title: 'Transcript & progress',
    description: 'Track your academic results and the credits you still need to graduate.',
  },
  {
    icon: BookOpen,
    title: 'Study Plan',
    description: 'Plan each semester in line with your curriculum.',
  },
  {
    icon: MessageSquare,
    title: 'Advising Request',
    description: 'Send advising requests and get replies from your academic advisor.',
  },
  {
    icon: CalendarCheck,
    title: 'Appointment booking',
    description: 'Book a meeting with an Advisor in an open time slot and get reminders.',
  },
  {
    icon: Bot,
    title: 'AI Chat',
    description: 'Ask quick questions about regulations, courses and your study roadmap.',
  },
  {
    icon: GraduationCap,
    title: 'Role-based access',
    description: 'Dedicated experiences for Student, Advisor and Admin.',
  },
];
