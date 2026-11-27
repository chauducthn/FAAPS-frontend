// src/modules/advising/utils/ticketStatus.ts
// Status labels for the TICKET (helpdesk) system.
//
// Advising Requests are NOT a 1-1 chat with an assigned advisor — they are a queue
// shared by EVERY advisor:
//
//   PENDING     : the student submitted a request, nobody has claimed it yet.
//   IN_PROGRESS : an advisor claimed it (advisor_id is set).
//   RESOLVED    : the advisor finished and closed it.
//   CANCELLED   : the student cancelled it.
//
// This module is the single source of the labels so the Advisor and Student portals
// never drift apart.

import type { AdvisingRequestStatus } from '../types/advising';

const TICKET_STATUS_LABELS: Record<AdvisingRequestStatus, string> = {
  PENDING: 'Waiting for an advisor',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

/** Short status label — e.g. "Waiting for an advisor". */
export function ticketStatusLabel(status: AdvisingRequestStatus): string {
  return TICKET_STATUS_LABELS[status] ?? TICKET_STATUS_LABELS.PENDING;
}

/**
 * Status line including the advisor's name (when known) for the student-facing list.
 *   PENDING     → "Waiting for an advisor"
 *   IN_PROGRESS → "Advisor Nguyễn Văn A is helping"
 *   RESOLVED    → "Resolved"
 */
export function ticketStatusLine(
  status: AdvisingRequestStatus,
  advisorName?: string | null,
): string {
  if (status === 'IN_PROGRESS') {
    const name = advisorName?.trim();
    return name ? `Advisor ${name} is helping` : 'An advisor is helping';
  }
  return ticketStatusLabel(status);
}
