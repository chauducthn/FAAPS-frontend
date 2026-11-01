// src/hooks/queries/useAppointmentQueries.ts
import { useQuery } from '@tanstack/react-query';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../../auth/stores/useAuth';

export const APPOINTMENT_QUERY_KEYS = {
  all: ['appointments'] as const,
  availableSlots: (date: string, advisorId?: string) =>
    [...APPOINTMENT_QUERY_KEYS.all, 'available-slots', date, advisorId ?? null] as const,
  advisorWeek: (from: string, to: string, advisorId?: string) =>
    [...APPOINTMENT_QUERY_KEYS.all, 'advisor-week', from, to, advisorId ?? null] as const,
  advisorAll: (advisorId?: string) =>
    [...APPOINTMENT_QUERY_KEYS.all, 'advisor-all', advisorId ?? null] as const,
  advisorAvailability: (advisorId?: string) =>
    [...APPOINTMENT_QUERY_KEYS.all, 'advisor-availability', advisorId ?? null] as const,
  detail: (role: 'student' | 'advisor', id?: string) =>
    [...APPOINTMENT_QUERY_KEYS.all, role, 'detail', id ?? null] as const,
};

export const useStudentAppointmentDetail = (id: string | null) =>
  useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.detail('student', id ?? undefined),
    queryFn: () => appointmentService.getStudentAppointment(id as string),
    enabled: !!id,
  });

export const useAdvisorAppointmentDetail = (id: string | null) =>
  useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.detail('advisor', id ?? undefined),
    queryFn: () => appointmentService.getAdvisorAppointment(id as string),
    enabled: !!id,
  });

/**
 * Free slots for one day. Disabled until a date is chosen.
 * The advisor is optional: without it the backend falls back to the student's assigned advisor.
 */
export const useAvailableSlots = (date: string | null, advisorId?: string) =>
  useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.availableSlots(date ?? '', advisorId),
    queryFn: () => appointmentService.getAvailableSlots(date as string, advisorId),
    enabled: !!date,
    staleTime: 1000 * 30,
  });

/**
 * The advisor's own appointments for one week (Mon -> Sun), used by the weekly calendar.
 * The advisor id comes from the auth store.
 */
export const useAdvisorAppointments = (from: string | null, to: string | null) => {
  const user = useAuth((s) => s.user);

  return useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.advisorWeek(from ?? '', to ?? '', user?.id),
    queryFn: () => appointmentService.getAdvisorAppointments({ from: from as string, to: to as string }),
    // Chưa đăng nhập thì không gọi API (tránh spam 401).
    enabled: !!from && !!to && !!user?.id,
  });
};

/**
 * The advisor's published weekly availability template.
 */
export const useAdvisorAvailability = () => {
  const user = useAuth((s) => s.user);

  return useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.advisorAvailability(user?.id),
    queryFn: appointmentService.getAvailability,
    enabled: !!user?.id,
  });
};

/**
 * The advisor's full appointment history (not limited to one week),
 * powering the List view with Upcoming / History tabs.
 */
export const useAllAdvisorAppointments = () => {
  const user = useAuth((s) => s.user);

  return useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.advisorAll(user?.id),
    queryFn: appointmentService.getAllAdvisorAppointments,
    enabled: !!user?.id,
  });
};
