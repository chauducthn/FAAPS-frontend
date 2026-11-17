import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../shared/lib/apiClient';
import { studentAcademicService } from './studentAcademicService';

vi.mock('../../../shared/lib/apiClient', () => ({ apiClient: { patch: vi.fn(), get: vi.fn() } }));
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

describe('student course catalogue', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reads every page, so courses past the first page are listed', async () => {
    const course = (n: number) => ({ id: `c${n}` });
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: Array.from({ length: 100 }, (_, i) => course(i)) })
      .mockResolvedValueOnce({ data: [course(100), course(101)] });

    const all = await studentAcademicService.allCourses('se');

    expect(all).toHaveLength(102);
    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/student/courses', { params: { search: 'se', page: 0, size: 100 } });
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/student/courses', { params: { search: 'se', page: 1, size: 100 } });
  });
});
