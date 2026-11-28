import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../shared/lib/apiClient';
import { advisorService } from './advisorService';

vi.mock('../../../shared/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), put: vi.fn() },
}));
vi.mock('../../../shared/lib/csrf', () => ({
  getCsrfHeaders: vi.fn().mockResolvedValue({}),
}));

const ticket = (id: string, status: string, advisorId: string | null = null) => ({
  id,
  studentId: 's1',
  studentName: 'Student One',
  studentCode: 'SE123',
  advisorId,
  advisorName: advisorId ? 'Advisor A' : null,
  studyPlanId: null,
  requestType: 'OTHER' as const,
  title: `Ticket ${id}`,
  description: null,
  status: status as never,
  resolvedAt: null,
  resolutionSummary: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('advisorService — ticket status transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.patch).mockResolvedValue({ data: ticket('1', 'IN_PROGRESS', 'advisor-1') });
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
  });

  it('claims a ticket with ONLY { status: IN_PROGRESS } — no resolutionSummary', async () => {
    await advisorService.claimRequest('t1');

    expect(apiClient.patch).toHaveBeenCalledTimes(1);
    const [url, body] = vi.mocked(apiClient.patch).mock.calls[0];
    expect(url).toBe('/advisor/advising-requests/t1/status');
    expect(body).toEqual({ status: 'IN_PROGRESS' });
    expect(body).not.toHaveProperty('resolutionSummary');
  });

  it('sends the resolutionSummary when the ticket is closed (RESOLVED)', async () => {
    await advisorService.updateRequestStatus('t1', {
      status: 'RESOLVED',
      resolutionSummary: '  Your study plan is approved.  ',
    });

    const [, body] = vi.mocked(apiClient.patch).mock.calls[0];
    expect(body).toEqual({ status: 'RESOLVED', resolutionSummary: 'Your study plan is approved.' });
  });

  it('omits a blank resolutionSummary instead of sending an empty string', async () => {
    await advisorService.updateRequestStatus('t1', { status: 'RESOLVED', resolutionSummary: '   ' });

    const [, body] = vi.mocked(apiClient.patch).mock.calls[0];
    expect(body).not.toHaveProperty('resolutionSummary');
  });

  it('rejects a ticket with status REJECTED + the required resolutionSummary', async () => {
    await advisorService.updateRequestStatus('t1', {
      status: 'REJECTED',
      resolutionSummary: 'This needs the academic office.',
    });

    const [, body] = vi.mocked(apiClient.patch).mock.calls[0];
    expect(body).toEqual({
      status: 'REJECTED',
      resolutionSummary: 'This needs the academic office.',
    });
  });
});

describe('advisorService — ticket list filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [ticket('a', 'PENDING'), ticket('b', 'IN_PROGRESS', 'advisor-1'), ticket('c', 'IN_PROGRESS', 'advisor-2')],
    });
  });

  it('defaults to scope=ALL (shared queue) when no scope is given', async () => {
    await advisorService.getAdvisingRequests({ status: 'PENDING' });

    const [, config] = vi.mocked(apiClient.get).mock.calls[0];
    expect(config?.params).toEqual({ scope: 'ALL' });
  });

  it('sends scope=MINE for the "My Handled" filter', async () => {
    await advisorService.getAdvisingRequests({ status: 'IN_PROGRESS', scope: 'MINE' });

    const [, config] = vi.mocked(apiClient.get).mock.calls[0];
    expect(config?.params).toEqual({ scope: 'MINE' });
  });

  it('never sends the removed advisorId filter (Shared Multi-Advisor)', async () => {
    await advisorService.getAdvisingRequests({ status: 'IN_PROGRESS' });

    const [, config] = vi.mocked(apiClient.get).mock.calls[0];
    expect(config?.params).not.toHaveProperty('advisorId');
  });
});
