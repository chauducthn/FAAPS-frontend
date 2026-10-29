// src/services/management/appointment.service.ts
import { apiClient } from '../../../shared/lib/apiClient';
import type { AdminPage, Appointment, AppointmentStatus, AppointmentSummary } from '../types/admin';

/** Query parameters accepted by `GET /admin/appointments`. */
export interface AppointmentFilterParams {
  status?: AppointmentStatus;
  search?: string;
  /** Narrow the list to one advisor (uuid). */
  advisorId?: string;
  /** Inclusive lower bound of the scheduled slot (yyyy-MM-dd). */
  fromDate?: string;
  /** Inclusive upper bound of the scheduled slot (yyyy-MM-dd). */
  toDate?: string;
  page?: number;
  size?: number;
}

export const adminAppointmentService = {
  getAppointments: async (params: AppointmentFilterParams): Promise<AdminPage<Appointment>> =>
    (await apiClient.get<AdminPage<Appointment>>('/admin/appointments', { params })).data,

  getSummary: async (): Promise<AppointmentSummary> =>
    (await apiClient.get<AppointmentSummary>('/admin/appointments/summary')).data,

  getAppointment: async (id: string): Promise<Appointment> =>
    (await apiClient.get<Appointment>(`/admin/appointments/${id}`)).data,
};
