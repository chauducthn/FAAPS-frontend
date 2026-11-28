// Opens a ticket from a deep link (/advisor/advising-requests?id=<ticketId>), e.g. from a notification.

import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import type { AdvisingRequest } from '../types/advising';

/** A stand-in row: the detail modal loads the real ticket by id. */
function placeholderRequest(id: string): AdvisingRequest {
  return {
    id,
    studentId: '',
    studentName: null,
    studentCode: null,
    advisorId: null,
    advisorName: null,
    sameMajorGroup: false,
    participatedByMe: false,
    studyPlanId: null,
    linkedAppointmentId: null,
    requestType: 'OTHER',
    title: '',
    description: null,
    status: 'PENDING',
    resolvedAt: null,
    resolutionSummary: null,
    createdAt: '',
    updatedAt: '',
  };
}

/** Hands the linked ticket to `open`, then drops the param so a reload does not reopen it. */
export function useRequestDeepLink(open: (update: (current: AdvisingRequest | null) => AdvisingRequest) => void) {
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkId = searchParams.get('id');

  useEffect(() => {
    if (!deepLinkId) return;
    open((current) => (current?.id === deepLinkId ? current : placeholderRequest(deepLinkId)));
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('id');
        return next;
      },
      { replace: true },
    );
  }, [deepLinkId, open, setSearchParams]);
}
