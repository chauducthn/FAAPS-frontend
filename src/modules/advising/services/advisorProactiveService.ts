import { apiClient } from '@/shared/lib/apiClient';
import { getCsrfHeaders } from '@/shared/lib/csrf';

export interface ProactiveAppointmentBody {
  studentId: string;
  sessionType: 'VIRTUAL' | 'SCHEDULED' | 'WALK_IN';
  scheduledAt: string;
  location?: string;
  meetingLink?: string;
  agenda: string;
}

export interface EmailAdvisingBody {
  studentId: string;
  subject: string;
  message: string;
}

export interface ProactiveSessionResult {
  sessionId: string;
  studentId: string;
  sessionType: string;
  status: string;
  scheduledAt: string;
}

export interface CopilotResult {
  content: string;
  fallback: boolean;
}

export const advisorProactiveService = {
  createAppointment: async (body: ProactiveAppointmentBody): Promise<ProactiveSessionResult> => {
    const { data } = await apiClient.post<ProactiveSessionResult>('/advisor/appointments', body, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },

  sendEmailAdvising: async (body: EmailAdvisingBody): Promise<ProactiveSessionResult> => {
    const { data } = await apiClient.post<ProactiveSessionResult>('/advisor/appointments/email', body, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },

  generateStudentBrief: async (studentId: string): Promise<CopilotResult> => {
    const { data } = await apiClient.post<CopilotResult>(`/advisor/ai/students/${studentId}/brief`, null, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },

  draftSessionSummary: async (sessionId: string, rawNotes: string): Promise<CopilotResult> => {
    const { data } = await apiClient.post<CopilotResult>(
      `/advisor/ai/sessions/${sessionId}/draft-summary`,
      { rawNotes },
      { headers: await getCsrfHeaders() },
    );
    return data;
  },
};
