// src/hooks/queries/useAppointmentQueries.ts
import { useQuery } from '@tanstack/react-query';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../stores/useAuth';

export const APPOINTMENT_QUERY_KEYS = {
  all: ['appointments'] as const,
  availableSlots: (date: string, advisorId?: string) =>
    [...APPOINTMENT_QUERY_KEYS.all, 'available-slots', date, advisorId ?? null] as const,
  advisorWeek: (from: string, to: string, advisorId?: string) =>
    [...APPOINTMENT_QUERY_KEYS.all, 'advisor-week', from, to, advisorId ?? null] as const,
  advisorAvailability: (advisorId?: string) =>
    [...APPOINTMENT_QUERY_KEYS.all, 'advisor-availability', advisorId ?? null] as const,
};

/**
 * Free 30-minute slots for one day. Disabled until a date is chosen.
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
