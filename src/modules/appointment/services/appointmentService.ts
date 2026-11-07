// src/services/appointmentService.ts
import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import { isAdvisorMockEnabled, mockDelay } from '../../../shared/lib/mockMode';
import type {
  AdvisorAppointment,
  AvailabilitySlot,
  AvailableSlot,
  BookAppointmentDto,
  BookedAppointment,
  ConfigureAvailabilityDto,
  UpdateAppointmentStatusDto,
} from '../types/appointment';
import {
  mockConfigureAvailability,
  mockGetAppointment,
  mockGetAppointments,
  mockGetAvailability,
  mockUpdateAppointmentStatus,
} from '../../advising/mocks/advisorMockApi';

const post = async <T>(url: string, body: unknown): Promise<T> =>
  (await apiClient.post<T>(url, body, { headers: await getCsrfHeaders() })).data;

/**
 * API lịch hẹn + lịch rảnh.
 *
 * Khi mock advisor bật, các hàm advisor-side (availability, danh sách lịch hẹn,
 * đổi trạng thái) chạy trên mock store in-memory — nên Accept / Reject / Cancel /
 * Completed / No-show và thêm-sửa-xóa slot rảnh đều cập nhật UI ngay lập tức.
 */
export const appointmentService = {
  /** Advisor only: the current weekly availability template. */
  getAvailability: async (): Promise<AvailabilitySlot[]> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockGetAvailability();
    }
    const { data } = await apiClient.get<AvailabilitySlot[]>('/advisor/availability');
    return data ?? [];
  },

  /** Advisor only: replace the weekly availability template. */
  configureAvailability: async (body: ConfigureAvailabilityDto): Promise<void> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      mockConfigureAvailability(body.slots ?? []);
      return;
    }
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
  bookAppointment: async (body: BookAppointmentDto): Promise<BookedAppointment> => {
    return post<BookedAppointment>('/student/appointments', body);
  },

  /** Advisor only: accept or reject a pending appointment. */
  updateAppointmentStatus: async (id: string, body: UpdateAppointmentStatusDto): Promise<BookedAppointment> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      const updated = mockUpdateAppointmentStatus(id, body);
      return toBookedAppointment(updated);
    }
    return (
      await apiClient.put<BookedAppointment>(`/advisor/appointments/${id}/status`, body, {
        headers: await getCsrfHeaders(),
      })
    ).data;
  },

  /** Advisor only: the advisor's own appointments, for the weekly calendar. */
  getAdvisorAppointments: async (params: { from: string; to: string }): Promise<AdvisorAppointment[]> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockGetAppointments(params);
    }
    const { data } = await apiClient.get<AdvisorAppointment[]>('/advisor/appointments', { params });
    return data ?? [];
  },

  getStudentAppointments: async (): Promise<BookedAppointment[]> => {
    const { data } = await apiClient.get<BookedAppointment[]>('/student/appointments');
    return data ?? [];
  },

  getStudentAppointment: async (id: string): Promise<BookedAppointment> => {
    return (await apiClient.get<BookedAppointment>(`/student/appointments/${id}`)).data;
  },

  getAdvisorAppointment: async (id: string): Promise<BookedAppointment> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return toBookedAppointment(mockGetAppointment(id));
    }
    return (await apiClient.get<BookedAppointment>(`/advisor/appointments/${id}`)).data;
  },

  cancelAppointment: async (id: string, reason: string): Promise<BookedAppointment> => {
    return (await apiClient.put<BookedAppointment>(`/appointments/${id}/cancel`, { reason }, { headers: await getCsrfHeaders() })).data;
  },

  /** Advisor only: full history for the List view (Upcoming / History tabs). */
  getAllAdvisorAppointments: async (): Promise<AdvisorAppointment[]> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockGetAppointments();
    }
    const { data } = await apiClient.get<AdvisorAppointment[]>('/advisor/appointments');
    return data ?? [];
  },

  rescheduleAppointment: async (id: string, startTime: string): Promise<BookedAppointment> => {
    return (await apiClient.put<BookedAppointment>(`/appointments/${id}/reschedule`, { startTime }, { headers: await getCsrfHeaders() })).data;
  },
};

/** Bản quyển advisor-side -> shape student-side (cùng field, chỉ khác tên advisor). */
const toBookedAppointment = (appointment: AdvisorAppointment): BookedAppointment => ({
  id: appointment.id,
  studentId: appointment.studentId,
  studentName: appointment.studentName,
  studentCode: appointment.studentCode,
  advisorId: 'adv-001',
  advisorName: 'Trần Minh Khoa',
  startTime: appointment.startTime,
  endTime: appointment.endTime,
  reason: appointment.reason,
  status: appointment.status,
  decisionNote: appointment.decisionNote,
  consultationSummary: appointment.consultationSummary,
  createdAt: appointment.createdAt,
});
