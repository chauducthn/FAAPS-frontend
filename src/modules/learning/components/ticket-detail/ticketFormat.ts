// Shared formatting for the student ticket detail.

import type { AdvisingRequestStatus } from '../../../advising/types/advising';

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

/** A closed ticket accepts no messages and no new appointment. */
export const isClosedStatus = (status: AdvisingRequestStatus) =>
  status === 'RESOLVED' || status === 'REJECTED' || status === 'CANCELLED';
