import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminAppointmentService, type AppointmentFilterParams } from '../../services/appointment.service';
import type { AppointmentStatus } from '../../types/admin';

export const useAppointments = (params: AppointmentFilterParams) =>
  useQuery({
    queryKey: ['admin', 'appointments', 'list', params],
    queryFn: () => adminAppointmentService.getAppointments(params),
    placeholderData: keepPreviousData,
  });

export const useAppointmentSummary = () =>
  useQuery({
    queryKey: ['admin', 'appointments', 'summary'],
    queryFn: () => adminAppointmentService.getSummary(),
  });

export const useAppointment = (id: string | null) =>
  useQuery({
    queryKey: ['admin', 'appointments', 'detail', id],
    queryFn: () => adminAppointmentService.getAppointment(id as string),
    enabled: !!id,
  });

export type { AppointmentStatus };
