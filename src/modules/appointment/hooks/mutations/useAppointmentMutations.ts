// src/hooks/mutations/useAppointmentMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { appointmentService } from '../../services/appointmentService';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import type {
  BookAppointmentDto,
  ConfigureAvailabilityDto,
  UpdateAppointmentStatusDto,
} from '../../types/appointment';
import { APPOINTMENT_QUERY_KEYS } from '../queries/useAppointmentQueries';

/**
 * Advisor đọc lịch hẹn qua hai hệ key khác nhau:
 *   - `['appointments', ...]`  → lịch hẹn tuần + lịch rảnh (trang Advisor Appointments)
 *   - `['advisor', 'appointments', ...]` → lịch hẹn trong Student 360 Modal
 * Nên mọi mutation phải invalidate cả hai để UI đều cập nhật ngay.
 */
const invalidateAppointments = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.all });
  qc.invalidateQueries({ queryKey: ['advisor', 'appointments'] });
};

export const useBookAppointmentMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: BookAppointmentDto) => appointmentService.bookAppointment(body),
    onSuccess: () => {
      toast.success('Appointment requested', {
        description: 'Your advisor will review the request shortly.',
      });
      // The chosen slot is no longer free.
      qc.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.all });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Could not book the appointment.'));
    },
  });
};

export const useConfigureAvailabilityMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: ConfigureAvailabilityDto) => appointmentService.configureAvailability(body),
    onSuccess: () => {
      toast.success('Availability updated', {
        description: 'Students can now book the slots you published.',
      });
      invalidateAppointments(qc);
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Could not save your availability.'));
    },
  });
};

export const useUpdateAppointmentStatusMutation = () => {
  const qc = useQueryClient();

  const STATUS_TOAST: Record<UpdateAppointmentStatusDto['status'], { title: string; description: string }> = {
    ACCEPTED: { title: 'Appointment accepted', description: 'The student has been notified.' },
    REJECTED: { title: 'Appointment rejected', description: 'The student has been notified.' },
    CANCELLED: { title: 'Appointment cancelled', description: 'The student has been notified.' },
    COMPLETED: { title: 'Appointment completed', description: 'Consultation summary has been saved.' },
    NO_SHOW: { title: 'Marked as no-show', description: 'The absence has been recorded.' },
  };

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAppointmentStatusDto }) =>
      appointmentService.updateAppointmentStatus(id, body),
    onSuccess: (_data, vars) => {
      const toastContent = STATUS_TOAST[vars.body.status] ?? {
        title: 'Appointment updated',
        description: 'The student has been notified.',
      };
      toast.success(toastContent.title, { description: toastContent.description });
      invalidateAppointments(qc);
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Could not update the appointment status.'));
    },
  });
};

/** The student (or advisor) cancels an appointment; the other side is notified by the backend. */
export const useCancelAppointmentMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => appointmentService.cancelAppointment(id, reason),
    onSuccess: () => {
      toast.success('Appointment cancelled', { description: 'Your advisor has been notified.' });
      invalidateAppointments(qc);
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Could not cancel the appointment.'));
    },
  });
};

/** Moves an open appointment to another free slot. */
export const useRescheduleAppointmentMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, startTime }: { id: string; startTime: string }) => appointmentService.rescheduleAppointment(id, startTime),
    onSuccess: () => {
      toast.success('Appointment rescheduled', { description: 'Your advisor has been notified of the new time.' });
      invalidateAppointments(qc);
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Could not reschedule the appointment.'));
    },
  });
};
