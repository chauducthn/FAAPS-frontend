import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../modules/auth/stores/useAuth';

const renderRoute = () => render(
  <MemoryRouter initialEntries={['/admin']}>
    <Routes>
      <Route path="/login" element={<div>Login screen</div>} />
      <Route path="/advisor" element={<div>Advisor home</div>} />
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<div>Admin home</div>} />
      </Route>
    </Routes>
  </MemoryRouter>,
);

describe('ProtectedRoute', () => {
  beforeEach(() => useAuth.setState({ user: null, isAuthenticated: false, isCheckingAuth: false }));

  it('redirects unauthenticated visitors to login', () => {
    renderRoute();
    expect(screen.getByText('Login screen')).toBeInTheDocument();
  });

  it('renders content for an allowed role', () => {
    useAuth.getState().setUser({ id: '1', email: 'admin', fullName: 'Admin', role: 'ADMIN', status: 'ACTIVE' });
    renderRoute();
    expect(screen.getByText('Admin home')).toBeInTheDocument();
  });

  it('redirects authenticated users to their own portal', () => {
    useAuth.getState().setUser({ id: '2', email: 'advisor@fpt.edu.vn', fullName: 'Advisor', role: 'ADVISOR', status: 'ACTIVE' });
    renderRoute();
    expect(screen.getByText('Advisor home')).toBeInTheDocument();
  });
});
