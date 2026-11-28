// Advisor choice for the booking page: the bookable advisors, their free slots on a day, and the pick.

import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { APPOINTMENT_QUERY_KEYS, useBookableAdvisors } from '../../appointment/hooks/queries/useAppointmentQueries';
import { appointmentService } from '../../appointment/services/appointmentService';
import { isSameMajorGroup } from '../../appointment/types/advisorOption';

/**
 * Until the student picks someone, the default is the first advisor in the student's major group (the backend
 * lists them first), then the assigned advisor. When the advisor list endpoint fails, booking still works
 * without an advisor id: the backend falls back to the assigned advisor.
 */
export function useBookingAdvisor(date: string) {
  const advisorsQuery = useBookableAdvisors();
  const advisors = useMemo(() => advisorsQuery.data ?? [], [advisorsQuery.data]);
  const [picked, setPicked] = useState<string | null>(null);

  // One slot query per advisor (the list is short), so the picker can show "N free" or "Full".
  const slotQueries = useQueries({
    queries: advisors.map((advisor) => ({
      queryKey: APPOINTMENT_QUERY_KEYS.availableSlots(date, advisor.id),
      queryFn: () => appointmentService.getAvailableSlots(date, advisor.id),
      enabled: !!date,
      staleTime: 1000 * 30,
    })),
  });

  const slotCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    advisors.forEach((advisor, i) => {
      counts[advisor.id] = slotQueries[i]?.data?.length ?? 0;
    });
    return counts;
  }, [advisors, slotQueries]);

  const recommended = useMemo(
    () => advisors.find((a) => isSameMajorGroup(a)) ?? advisors.find((a) => a.assigned) ?? advisors[0] ?? null,
    [advisors],
  );

  const advisorId = picked ?? recommended?.id ?? null;
  return {
    advisorsQuery,
    advisors,
    slotCounts,
    advisorId,
    advisorName: advisors.find((a) => a.id === advisorId)?.fullName ?? null,
    listUnavailable: advisorsQuery.isError && advisors.length === 0,
    pick: setPicked,
  };
}
