// Opens the schedule form from a ticket deep link: /advisor/appointments?advisingRequestId=<id>.

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import { advisorService } from '../services/advisorService';
import { advisingRequestIdFromParams } from '../utils/appointmentLink';

export interface RequestScheduleContext {
  studentId: string;
  studentName: string | null;
  advisingRequestId: string;
}

/**
 * Looks up the linked ticket to learn its student, so the new appointment is booked against that ticket.
 * Closing clears the query param, so a reload does not reopen the form.
 */
export function useRequestScheduleDeepLink() {
  const [searchParams, setSearchParams] = useSearchParams();
  const linkedRequestId = advisingRequestIdFromParams(searchParams);
  const [context, setContext] = useState<RequestScheduleContext | null>(null);

  useEffect(() => {
    if (!linkedRequestId) return;
    let cancelled = false;
    advisorService
      .getRequestDetail(linkedRequestId)
      .then((detail) => {
        const studentId = detail.request?.studentId;
        if (cancelled || !studentId) return;
        setContext({ studentId, studentName: detail.request.studentName ?? null, advisingRequestId: linkedRequestId });
      })
      .catch((error) => {
        if (!cancelled) toast.error(apiMessage(error));
      });
    return () => {
      cancelled = true;
    };
  }, [linkedRequestId]);

  const close = () => {
    setContext(null);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('advisingRequestId');
        return next;
      },
      { replace: true },
    );
  };

  return { context, close };
}
