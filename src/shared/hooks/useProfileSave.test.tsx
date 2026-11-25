import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useProfileSave } from './useProfileSave';
import { profileService } from '@/shared/services/profileService';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/modules/auth/stores/useAuth', () => ({
  useAuth: (selector: (state: unknown) => unknown) =>
    selector({ user: { id: 'u-1', fullName: 'Old Name' }, setUser: vi.fn() }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('useProfileSave', () => {
  beforeEach(() => vi.clearAllMocks());

  it('writes the identity fields through the shared profile endpoint', async () => {
    const update = vi.spyOn(profileService, 'updateProfile').mockResolvedValue({
      id: 'u-1', email: 'a@fpt.edu.vn', fullName: 'New Name', phone: '0901234567', dateOfBirth: null,
      role: 'ADMIN', status: 'ACTIVE', authProvider: 'LOCAL', lastLoginAt: null, createdAt: null,
    });

    const { result } = renderHook(() => useProfileSave(), { wrapper });
    result.current.mutate({ fullName: '  New Name  ', phone: ' 0901234567 ' });

    await waitFor(() => expect(update).toHaveBeenCalledWith({ fullName: 'New Name', phone: '0901234567' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('sends an empty phone as null so the field can be cleared', async () => {
    const update = vi.spyOn(profileService, 'updateProfile').mockResolvedValue({
      id: 'u-1', email: 'a@fpt.edu.vn', fullName: 'New Name', phone: null, dateOfBirth: null,
      role: 'ADMIN', status: 'ACTIVE', authProvider: 'LOCAL', lastLoginAt: null, createdAt: null,
    });

    const { result } = renderHook(() => useProfileSave(), { wrapper });
    result.current.mutate({ fullName: 'New Name', phone: '   ' });

    await waitFor(() => expect(update).toHaveBeenCalledWith({ fullName: 'New Name', phone: null }));
  });

  it('writes the role-specific field after the identity fields', async () => {
    const order: string[] = [];
    vi.spyOn(profileService, 'updateProfile').mockImplementation(async () => {
      order.push('identity');
      return {
        id: 'u-1', email: 'a@fpt.edu.vn', fullName: 'New Name', phone: null, dateOfBirth: null,
        role: 'ADVISOR', status: 'ACTIVE', authProvider: 'LOCAL', lastLoginAt: null, createdAt: null,
      };
    });

    const { result } = renderHook(
      () => useProfileSave({ saveRoleFields: async () => { order.push('role'); } }),
      { wrapper },
    );
    result.current.mutate({ fullName: 'New Name', phone: '', specialization: 'AI' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(order).toEqual(['identity', 'role']);
  });
});
