// Shared types, constants, and helpers for the advisor appointment action modal.
//
// Complete and No-show updates are temporarily disabled until the backend
// supports COMPLETED / NO_SHOW and consultationSummary on the status endpoint.
// Set APPOINTMENT_RESULT_UPDATE_ENABLED = true once the backend endpoint ships.

import type { AdvisorAppointment } from '../../types/appointment';

export const APPOINTMENT_RESULT_UPDATE_ENABLED = false;

export const FEATURE_PENDING_TOOLTIP = 'Tính năng đang cập nhật';

export interface AppointmentActionModalProps {
  appointment: AdvisorAppointment | null;
  onClose: () => void;
}

export type ActionMode = 'idle' | 'reject' | 'cancel' | 'complete' | 'noShow' | 'editSummary';

export function initialsOf(name: string | null | undefined) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
