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
      qc.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.all });
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
      qc.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.all });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Could not update the appointment status.'));
    },
  });
};
