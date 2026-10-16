import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { appointmentService } from '../../services/appointmentService';
import type { AppointmentStatus } from '../../types/admin';

export const useAppointments = (params: {
  status?: AppointmentStatus;
  search?: string;
  page?: number;
  size?: number;
}) =>
  useQuery({
    queryKey: ['admin', 'appointments', 'list', params],
    queryFn: () => appointmentService.getAppointments(params),
    placeholderData: keepPreviousData,
  });

export const useAppointmentSummary = () =>
  useQuery({ queryKey: ['admin', 'appointments', 'summary'], queryFn: appointmentService.getSummary });

export const useAppointment = (id: string | null) =>
  useQuery({
    queryKey: ['admin', 'appointments', 'detail', id],
    queryFn: () => appointmentService.getAppointment(id as string),
    enabled: !!id,
  });
