import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import Register from './Register';

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<p>Login page</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Register', () => {
  it('explains how registration works and has no password field', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /create your student account/i })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it('starts the Google sign-up when the button is pressed', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /sign up with google/i }));
    expect(assign).toHaveBeenCalledWith('/oauth2/authorization/google');
    vi.unstubAllGlobals();
  });

  it('links back to the sign-in page', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('link', { name: /^sign in$/i }));
    expect(await screen.findByText('Login page')).toBeInTheDocument();
  });
});
