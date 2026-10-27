import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../shared/lib/apiClient';
import { advisorStudyPlanService } from './advisorStudyPlanService';

vi.mock('../../../shared/lib/apiClient', () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../../../shared/lib/csrf', () => ({ getCsrfHeaders: vi.fn().mockResolvedValue({ 'X-CSRF': 'token' }) }));

describe('advisorStudyPlanService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads submitted plans with pagination', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 } });
    await advisorStudyPlanService.list('SUBMITTED');
    expect(apiClient.get).toHaveBeenCalledWith('/advisor/study-plans',
      { params: { status: 'SUBMITTED', page: 0, size: 20 } });
  });

  it('posts an advisor decision', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: {} });
    await advisorStudyPlanService.decide('plan-1', 'APPROVED', 'Looks good');
    expect(apiClient.post).toHaveBeenCalledWith('/advisor/study-plans/plan-1/decision',
      { decision: 'APPROVED', comment: 'Looks good' }, { headers: { 'X-CSRF': 'token' } });
  });
});
