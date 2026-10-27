import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../shared/lib/apiClient';
import { advisorService } from './advisorService';

vi.mock('../../../shared/lib/apiClient', () => ({ apiClient: { get: vi.fn(), put: vi.fn() } }));
vi.mock('../../../shared/lib/csrf', () => ({ getCsrfHeaders: vi.fn().mockResolvedValue({ 'X-CSRF': 'token' }) }));

describe('advisor profile API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads the current advisor profile', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { id: 'a-1' } });
    await advisorService.getProfile();
    expect(apiClient.get).toHaveBeenCalledWith('/advisor/profile');
  });

  it('updates only the editable full name', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { id: 'a-1' } });
    await advisorService.updateProfile('Nguyen Van Binh');
    expect(apiClient.put).toHaveBeenCalledWith('/advisor/profile', { fullName: 'Nguyen Van Binh' },
      { headers: { 'X-CSRF': 'token' } });
  });
});
