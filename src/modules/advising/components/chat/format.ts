// src/modules/advising/components/chat/format.ts
// Formatting helpers shared by the Advisor ticket detail screen.

import { REQUEST_TYPE_LABELS } from '../RequestTypeLabel';
import type { AdvisingRequestType } from '../../types/advising';

/** Up to two uppercase initials of a person's name. */
export function initialsOf(name: string | null | undefined) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/** "Nov 26, 06:09" style stamp (English locale, month name abbreviated). */
export function formatStamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Request type label — shared with RequestTypeLabel so the labels never drift. */
export function typeLabelOf(requestType: string) {
  return REQUEST_TYPE_LABELS[requestType as AdvisingRequestType] ?? requestType;
}
