import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import ForgotPassword from './ForgotPassword';

const forgotPassword = vi.fn();

vi.mock('../services/authService', () => ({
  authService: {
    forgotPassword: (...args: unknown[]) => forgotPassword(...args),
  },
}));

describe('ForgotPassword', () => {
  beforeEach(() => {
    forgotPassword.mockReset();
  });

  it('validates email before submitting', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /send reset link/i }));
    expect(await screen.findByText(/enter your email/i)).toBeInTheDocument();
    expect(forgotPassword).not.toHaveBeenCalled();
  });

  it('submits email and shows confirmation screen', async () => {
    const user = userEvent.setup();
    forgotPassword.mockResolvedValue({
      success: true,
      message: 'If an active account with that email exists, password reset instructions have been sent.',
    });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/email address/i), 'student@fpt.edu.vn');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => expect(forgotPassword).toHaveBeenCalledWith('student@fpt.edu.vn'));
    expect(await screen.findByTestId('forgot-password-success')).toBeInTheDocument();
    expect(screen.getByText('student@fpt.edu.vn')).toBeInTheDocument();
  });

  it('shows server error message when rate limited', async () => {
    const user = userEvent.setup();
    forgotPassword.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Too many password reset requests for this email.' } },
    });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/email address/i), 'student@fpt.edu.vn');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Too many password reset requests');
  });
});
