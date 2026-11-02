import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../shared/lib/apiClient';
import { assignmentService } from './assignmentService';

vi.mock('../../../shared/lib/apiClient', () => ({
  apiClient: { post: vi.fn() },
}));
vi.mock('../../../shared/lib/csrf', () => ({
  getCsrfHeaders: vi.fn().mockResolvedValue({}),
}));

describe('bulk auto assignment API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.post).mockResolvedValue({ data: { assigned: 1 } });
  });

  it('sends selected student IDs to each cohort endpoint', async () => {
    const result = await assignmentService.autoAssignStudents([
      { id: 'student-a', cohortId: 'cohort-1' },
      { id: 'student-b', cohortId: 'cohort-1' },
      { id: 'student-c', cohortId: 'cohort-2' },
    ]);

    expect(apiClient.post).toHaveBeenCalledTimes(2);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/admin/assignments/auto-assign/cohort/confirm',
      { cohortId: 'cohort-1', studentIds: ['student-a', 'student-b'] },
      { headers: {} },
    );
    expect(apiClient.post).toHaveBeenCalledWith(
      '/admin/assignments/auto-assign/cohort/confirm',
      { cohortId: 'cohort-2', studentIds: ['student-c'] },
      { headers: {} },
    );
    expect(result.assigned).toBe(2);
  });
});
