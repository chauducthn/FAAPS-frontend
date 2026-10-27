// src/services/management/appointment.service.ts
import { apiClient } from '../../../shared/lib/apiClient';
import type { AdminPage, Appointment, AppointmentStatus, AppointmentSummary } from '../types/admin';

export const adminAppointmentService = {
  getAppointments: async (params: {
    status?: AppointmentStatus;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<AdminPage<Appointment>> =>
    (await apiClient.get<AdminPage<Appointment>>('/admin/appointments', { params })).data,

  getSummary: async (): Promise<AppointmentSummary> =>
    (await apiClient.get<AppointmentSummary>('/admin/appointments/summary')).data,

  getAppointment: async (id: string): Promise<Appointment> =>
    (await apiClient.get<Appointment>(`/admin/appointments/${id}`)).data,
};
