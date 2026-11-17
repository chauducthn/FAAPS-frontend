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

  it('updates editable profile fields', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { id: 'a-1' } });
    const input = { fullName: 'Nguyen Van Binh', phone: '+84 901 234 567', specialization: 'AI' };
    await advisorService.updateProfile(input);
    expect(apiClient.put).toHaveBeenCalledWith('/advisor/profile', input,
      { headers: { 'X-CSRF': 'token' } });
  });
});
