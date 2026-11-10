// src/modules/advising/components/chat/format.ts
// Formatting helpers shared by the advising conversation components.
/** Human labels for the advising request types. */
export const TYPE_LABELS: Record<string, string> = {
  COURSE_SELECTION: 'Course selection',
  PLAN_REVIEW: 'Plan review',
  GRADUATION_CHECK: 'Graduation check',
  ACADEMIC_GUIDANCE: 'Academic guidance',
  OTHER: 'Other',
};

/** Up to two uppercase initials of a person's name. */
export function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/** "Nov 10, 09:26" style stamp. */
export function formatStamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Today → "09:26", otherwise → "Nov 10". */
export function formatDay(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Narrowing helper for the request type shown next to a badge. */
export function typeLabelOf(requestType: string) {
  return TYPE_LABELS[requestType] ?? requestType;
}
