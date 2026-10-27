// src/services/appointmentService.ts
import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type {
  AdvisorAppointment,
  AvailabilitySlot,
  AvailableSlot,
  BookAppointmentDto,
  BookedAppointment,
  ConfigureAvailabilityDto,
  UpdateAppointmentStatusDto,
} from '../types/appointment';

const post = async <T>(url: string, body: unknown): Promise<T> =>
  (await apiClient.post<T>(url, body, { headers: await getCsrfHeaders() })).data;

export const appointmentService = {
  /** Advisor only: the current weekly availability template. */
  getAvailability: async (): Promise<AvailabilitySlot[]> => {
    const { data } = await apiClient.get<AvailabilitySlot[]>('/advisor/availability');
    return data ?? [];
  },

  /** Advisor only: replace the weekly availability template. */
  configureAvailability: async (body: ConfigureAvailabilityDto): Promise<void> => {
    await post<void>('/advisor/availability', body);
  },

  /** Student only: slots that are still free on the given date. */
  getAvailableSlots: async (date: string, advisorId?: string): Promise<AvailableSlot[]> => {
    const { data } = await apiClient.get<AvailableSlot[]>('/appointments/available-slots', {
      params: { date, ...(advisorId ? { advisorId } : {}) },
    });
    return data ?? [];
  },

  /** Student only: book one slot. */
  bookAppointment: async (body: BookAppointmentDto): Promise<BookedAppointment> =>
    post<BookedAppointment>('/student/appointments', body),

  /** Advisor only: accept or reject a pending appointment. */
  updateAppointmentStatus: async (id: string, body: UpdateAppointmentStatusDto): Promise<BookedAppointment> =>
    (
      await apiClient.put<BookedAppointment>(`/advisor/appointments/${id}/status`, body, {
        headers: await getCsrfHeaders(),
      })
    ).data,

  /** Advisor only: the advisor's own appointments, for the weekly calendar. */
  getAdvisorAppointments: async (params: { from: string; to: string }): Promise<AdvisorAppointment[]> => {
    const { data } = await apiClient.get<AdvisorAppointment[]>('/advisor/appointments', { params });
    return data ?? [];
  },
  getStudentAppointments: async (): Promise<BookedAppointment[]> =>
    (await apiClient.get<BookedAppointment[]>('/student/appointments')).data ?? [],
  cancelAppointment: async (id: string, reason: string): Promise<BookedAppointment> =>
    (await apiClient.put<BookedAppointment>(`/appointments/${id}/cancel`, { reason }, { headers: await getCsrfHeaders() })).data,
  rescheduleAppointment: async (id: string, startTime: string): Promise<BookedAppointment> =>
    (await apiClient.put<BookedAppointment>(`/appointments/${id}/reschedule`, { startTime }, { headers: await getCsrfHeaders() })).data,
};
