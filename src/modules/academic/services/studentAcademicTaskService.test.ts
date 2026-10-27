import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../shared/lib/apiClient';
import { studentAcademicService } from './studentAcademicService';

vi.mock('../../../shared/lib/apiClient', () => ({ apiClient: { patch: vi.fn() } }));
vi.mock('../../../shared/lib/csrf', () => ({ getCsrfHeaders: vi.fn().mockResolvedValue({ 'X-CSRF': 'token' }) }));

describe('course learning task progress API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates a task within its owning plan', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: {} });
    await studentAcademicService.updateTask('plan-1', 'task-1', true);
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/student/course-learning-plans/plan-1/tasks/task-1', { completed: true },
      { headers: { 'X-CSRF': 'token' } });
  });
});
