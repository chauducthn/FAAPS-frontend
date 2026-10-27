import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(),
}));

vi.mock('../../../shared/lib/apiClient', () => ({ apiClient: api }));

import { aiConfigService } from './ai-config.service';

describe('aiConfigService endpoint contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses POST for the write-only secret endpoint', async () => {
    api.post.mockResolvedValue({ data: {} });
    await aiConfigService.setSecret('config-1', { apiKey: 'secret-value' });
    expect(api.post).toHaveBeenCalledWith('/admin/ai-configurations/config-1/secret', { apiKey: 'secret-value' });
    expect(api.put).not.toHaveBeenCalled();
  });
});
