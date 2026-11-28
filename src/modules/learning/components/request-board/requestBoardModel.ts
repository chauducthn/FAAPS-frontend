// Column model, status styling and formatting helpers for the student ticket board.

import type { Icon } from '@phosphor-icons/react';
import { ChatCircleText, Clock, Lifebuoy, Ticket, Tray } from '@phosphor-icons/react';
import type { AdvisingRequest, AdvisingRequestStatus } from '../../../advising/types/advising';

export type ColumnKey = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export interface BoardColumn {
  key: ColumnKey;
  title: string;
  hint: string;
  empty: string;
  icon: Icon;
  emptyIcon: Icon;
  headerClass: string;
  iconClass: string;
}

export const COLUMNS: BoardColumn[] = [
  {
    key: 'PENDING',
    title: 'Pending',
    hint: 'Waiting for an advisor to claim',
    empty: 'Requests you send will appear here while they wait for an advisor.',
    icon: Tray,
    emptyIcon: Clock,
    headerClass: 'border-amber-200 bg-amber-50/80',
    iconClass: 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200',
  },
  {
    key: 'IN_PROGRESS',
    title: 'In Progress',
    hint: 'An advisor is handling it',
    empty: 'Once an advisor claims your request, the conversation shows up here.',
    icon: Lifebuoy,
    emptyIcon: ChatCircleText,
    headerClass: 'border-blue-200 bg-blue-50/80',
    iconClass: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200',
  },
  {
    key: 'RESOLVED',
    title: 'Resolved',
    hint: 'Handled and closed',
    empty: 'Finished requests are archived here.',
    icon: Ticket,
    emptyIcon: Ticket,
    headerClass: 'border-emerald-200 bg-emerald-50/80',
    iconClass: 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  },
];

export const STATUS_TONES: Record<AdvisingRequestStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-300',
  RESOLVED: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-300',
  REJECTED: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-300',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300',
};

export const STATUS_LABELS: Record<AdvisingRequestStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

/** Rejected and cancelled tickets are closed too, so they share the Resolved column. Newest first. */
export function groupByColumn(requests: AdvisingRequest[]): Record<ColumnKey, AdvisingRequest[]> {
  const buckets: Record<ColumnKey, AdvisingRequest[]> = { PENDING: [], IN_PROGRESS: [], RESOLVED: [] };
  for (const request of requests) {
    if (request.status === 'PENDING') buckets.PENDING.push(request);
    else if (request.status === 'IN_PROGRESS') buckets.IN_PROGRESS.push(request);
    else buckets.RESOLVED.push(request);
  }
  for (const key of Object.keys(buckets) as ColumnKey[]) {
    buckets[key].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return buckets;
}

/** "just now", "5 min ago", "3 h ago", "2 days ago", then a short date. */
export function relativeTime(iso: string): string {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return '';
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function initialsOf(name: string | null | undefined): string {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
