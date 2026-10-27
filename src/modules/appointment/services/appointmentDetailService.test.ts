import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/lib/apiClient';
import { appointmentService } from './appointmentService';

vi.mock('@/shared/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}));
vi.mock('@/shared/lib/csrf', () => ({ getCsrfHeaders: vi.fn() }));

describe('appointment detail API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue({ data: { id: 'appointment-1' } });
  });

  it('loads the current student appointment', async () => {
    await appointmentService.getStudentAppointment('appointment-1');
    expect(apiClient.get).toHaveBeenCalledWith('/student/appointments/appointment-1');
  });

  it('loads the current advisor appointment', async () => {
    await appointmentService.getAdvisorAppointment('appointment-1');
    expect(apiClient.get).toHaveBeenCalledWith('/advisor/appointments/appointment-1');
  });
});
