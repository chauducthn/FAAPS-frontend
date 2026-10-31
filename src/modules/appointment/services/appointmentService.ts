// src/services/appointmentService.ts
import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import { IS_MOCK_MODE } from '../../../config/mockConfig';
import type {
  AdvisorAppointment,
  AvailabilitySlot,
  AvailableSlot,
  BookAppointmentDto,
  BookedAppointment,
  ConfigureAvailabilityDto,
  UpdateAppointmentStatusDto,
} from '../types/appointment';
import { mockAdvisorAppointments, mockAvailability, mockDelay } from '../../../mocks/advisorMockData';

const post = async <T>(url: string, body: unknown): Promise<T> =>
  (await apiClient.post<T>(url, body, { headers: await getCsrfHeaders() })).data;

export const appointmentService = {
  /** Advisor only: the current weekly availability template. */
  getAvailability: async (): Promise<AvailabilitySlot[]> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return mockAvailability.map((slot) => ({ ...slot }));
    }
    const { data } = await apiClient.get<AvailabilitySlot[]>('/advisor/availability');
    return data ?? [];
  },

  /** Advisor only: replace the weekly availability template. */
  configureAvailability: async (body: ConfigureAvailabilityDto): Promise<void> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      mockAvailability.splice(0, mockAvailability.length, ...body.slots.map((slot) => ({ ...slot })));
      return;
    }
    await post<void>('/advisor/availability', body);
  },

  /** Student only: slots that are still free on the given date. */
  getAvailableSlots: async (date: string, advisorId?: string): Promise<AvailableSlot[]> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return [];
    }
    const { data } = await apiClient.get<AvailableSlot[]>('/appointments/available-slots', {
      params: { date, ...(advisorId ? { advisorId } : {}) },
    });
    return data ?? [];
  },

  /** Student only: book one slot. */
  bookAppointment: async (body: BookAppointmentDto): Promise<BookedAppointment> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return {
        id: `apt-mock-${Date.now()}`,
        studentId: 'stu-001',
        studentName: 'Nguyễn Thị Hoa',
        studentCode: 'SE2021001',
        advisorId: 'adv-001',
        advisorName: 'Trần Minh Khoa',
        startTime: body.startTime,
        endTime: body.startTime,
        reason: body.reason,
        status: 'PENDING',
        decisionNote: null,
        consultationSummary: null,
        createdAt: new Date().toISOString(),
      };
    }
    return post<BookedAppointment>('/student/appointments', body);
  },

  /** Advisor only: accept or reject a pending appointment. */
  updateAppointmentStatus: async (id: string, body: UpdateAppointmentStatusDto): Promise<BookedAppointment> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const target = mockAdvisorAppointments.find((appointment) => appointment.id === id);
      if (!target) throw new Error(`Appointment ${id} not found`);
      target.status = body.status;
      target.decisionNote = body.reason ?? target.decisionNote ?? null;
      if (body.consultationSummary !== undefined) {
        target.consultationSummary = body.consultationSummary;
      }
      return { ...target, advisorId: 'adv-001', advisorName: 'Trần Minh Khoa' };
    }
    return (
      await apiClient.put<BookedAppointment>(`/advisor/appointments/${id}/status`, body, {
        headers: await getCsrfHeaders(),
      })
    ).data;
  },

  /** Advisor only: the advisor's own appointments, for the weekly calendar. */
  getAdvisorAppointments: async (params: { from: string; to: string }): Promise<AdvisorAppointment[]> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return mockAdvisorAppointments
        .filter((appointment) => {
          const day = appointment.startTime.slice(0, 10);
          return day >= params.from && day <= params.to;
        })
        .map((appointment) => ({ ...appointment }));
    }
    const { data } = await apiClient.get<AdvisorAppointment[]>('/advisor/appointments', { params });
    return data ?? [];
  },

  getStudentAppointments: async (): Promise<BookedAppointment[]> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return [];
    }
    return (await apiClient.get<BookedAppointment[]>('/student/appointments')).data ?? [];
  },

  getStudentAppointment: async (id: string): Promise<BookedAppointment> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const target = mockAdvisorAppointments.find((appointment) => appointment.id === id);
      if (!target) throw new Error(`Appointment ${id} not found`);
      return { ...target, advisorId: 'adv-001', advisorName: 'Trần Minh Khoa' };
    }
    return (await apiClient.get<BookedAppointment>(`/student/appointments/${id}`)).data;
  },

  getAdvisorAppointment: async (id: string): Promise<BookedAppointment> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const target = mockAdvisorAppointments.find((appointment) => appointment.id === id);
      if (!target) throw new Error(`Appointment ${id} not found`);
      return { ...target, advisorId: 'adv-001', advisorName: 'Trần Minh Khoa' };
    }
    return (await apiClient.get<BookedAppointment>(`/advisor/appointments/${id}`)).data;
  },

  cancelAppointment: async (id: string, reason: string): Promise<BookedAppointment> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const target = mockAdvisorAppointments.find((appointment) => appointment.id === id);
      if (!target) throw new Error(`Appointment ${id} not found`);
      target.status = 'CANCELLED';
      target.decisionNote = reason;
      return { ...target, advisorId: 'adv-001', advisorName: 'Trần Minh Khoa' };
    }
    return (await apiClient.put<BookedAppointment>(`/appointments/${id}/cancel`, { reason }, { headers: await getCsrfHeaders() })).data;
  },

  /** Advisor only: full history for the List view (Upcoming / History tabs). */
  getAllAdvisorAppointments: async (): Promise<AdvisorAppointment[]> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return mockAdvisorAppointments.map((appointment) => ({ ...appointment }));
    }
    const { data } = await apiClient.get<AdvisorAppointment[]>('/advisor/appointments');
    return data ?? [];
  },

  rescheduleAppointment: async (id: string, startTime: string): Promise<BookedAppointment> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const target = mockAdvisorAppointments.find((appointment) => appointment.id === id);
      if (!target) throw new Error(`Appointment ${id} not found`);
      const duration = new Date(target.endTime).getTime() - new Date(target.startTime).getTime();
      target.startTime = startTime;
      target.endTime = new Date(new Date(startTime).getTime() + duration).toISOString();
      return { ...target, advisorId: 'adv-001', advisorName: 'Trần Minh Khoa' };
    }
    return (await apiClient.put<BookedAppointment>(`/appointments/${id}/reschedule`, { startTime }, { headers: await getCsrfHeaders() })).data;
  },
};
