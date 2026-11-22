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

  it('reads one server page and maps the Spring page to PaginatedData', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { items: [{ id: 'c21' }], page: 1, size: 20, totalElements: 69, totalPages: 4 },
    });

    const result = await studentAcademicService.courses('se', 1, 20);

    expect(result).toEqual({ items: [{ id: 'c21' }], page: 1, pageSize: 20, totalItems: 69, totalPages: 4 });
    expect(apiClient.get).toHaveBeenCalledWith('/student/courses/paged', { params: { search: 'se', page: 1, size: 20 } });
  });
});
