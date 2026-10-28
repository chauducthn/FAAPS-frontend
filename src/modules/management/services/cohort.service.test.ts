import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import { cohortService } from './cohort.service';
import { semesterService } from '../../academic/services/semesterService';
import type { CurriculumInput } from '../../academic/types/curriculum';

vi.mock('../../../shared/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('../../../shared/lib/csrf', () => ({ getCsrfHeaders: vi.fn() }));

const cohort: CurriculumInput = {
  majorId: 'major-1', version: 'K19', name: 'Software Engineering K19',
  effectiveFromSemesterId: 'semester-1', effectiveToSemesterId: null,
  description: null, isCurrent: false, status: 'ACTIVE',
};

describe('Cohort editing contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCsrfHeaders).mockResolvedValue({ 'X-XSRF-TOKEN': 'token' });
    vi.mocked(apiClient.post).mockResolvedValue({ data: { data: cohort } });
    vi.mocked(apiClient.put).mockResolvedValue({ data: { data: cohort } });
  });

  it('sends the chosen K19 version and CSRF token on create and edit', async () => {
    await cohortService.create(cohort);
    await cohortService.update('cohort-1', cohort);
    expect(apiClient.post).toHaveBeenCalledWith('/admin/cohorts', cohort,
      { headers: { 'X-XSRF-TOKEN': 'token' } });
    expect(apiClient.put).toHaveBeenCalledWith('/admin/cohorts/cohort-1', cohort,
      { headers: { 'X-XSRF-TOKEN': 'token' } });
  });

  it('loads every semester and creates a new one', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [{ id: 'semester-1', code: 'FA2026' }] } });
    expect((await semesterService.list())[0].code).toBe('FA2026');
    const input = { code: 'FA2026', name: 'Fall 2026', startDate: '2026-09-01', endDate: '2026-12-31' };
    vi.mocked(apiClient.post).mockResolvedValue({ data: { data: { id: 'semester-1', ...input } } });
    await semesterService.create(input);
    expect(apiClient.post).toHaveBeenCalledWith('/admin/semesters', input,
      { headers: { 'X-XSRF-TOKEN': 'token' } });
  });
});
