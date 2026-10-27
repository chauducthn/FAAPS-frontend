import { beforeEach, describe, expect, it } from 'vitest';
import { useAuth } from './useAuth';

const user = {
  id: 'e84a9496-23f6-4ab7-a8af-f95b9f4023b4',
  email: 'advisor@fpt.edu.vn',
  fullName: 'Nguyen Van An',
  role: 'ADVISOR' as const,
  status: 'ACTIVE' as const,
};

describe('auth store', () => {
  beforeEach(() => useAuth.setState({ user: null, isAuthenticated: false, isCheckingAuth: true }));

  it('marks a valid user as authenticated', () => {
    useAuth.getState().setUser(user);
    expect(useAuth.getState()).toMatchObject({ user, isAuthenticated: true, isCheckingAuth: false });
  });

  it('clears the session on logout', () => {
    useAuth.getState().setUser(user);
    useAuth.getState().logout();
    expect(useAuth.getState()).toMatchObject({ user: null, isAuthenticated: false, isCheckingAuth: false });
  });
});
