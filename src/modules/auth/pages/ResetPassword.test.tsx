import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import ResetPassword from './ResetPassword';

const validateResetToken = vi.fn();
const resetPassword = vi.fn();

vi.mock('../services/authService', () => ({
  authService: {
    validateResetToken: (...args: unknown[]) => validateResetToken(...args),
    resetPassword: (...args: unknown[]) => resetPassword(...args),
  },
}));

describe('ResetPassword', () => {
  beforeEach(() => {
    validateResetToken.mockReset();
    resetPassword.mockReset();
  });

  it('shows invalid state when token is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPassword />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('reset-password-invalid')).toBeInTheDocument();
    expect(validateResetToken).not.toHaveBeenCalled();
  });

  it('shows invalid state when backend reports expired token', async () => {
    validateResetToken.mockResolvedValue({ valid: false });
    render(
      <MemoryRouter initialEntries={['/reset-password?token=expired123']}>
        <ResetPassword />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('reset-password-invalid')).toBeInTheDocument();
  });

  it('validates password mismatch and resets password on valid submission', async () => {
    const user = userEvent.setup();
    validateResetToken.mockResolvedValue({ valid: true });
    resetPassword.mockResolvedValue({ success: true, message: 'Password has been reset successfully' });

    render(
      <MemoryRouter initialEntries={['/reset-password?token=validtoken123']}>
        <ResetPassword />
      </MemoryRouter>,
    );

    const newPwd = await screen.findByLabelText(/^new password$/i);
    const confirmPwd = screen.getByLabelText(/confirm new password/i);

    await user.type(newPwd, 'StrongPass1');
    await user.type(confirmPwd, 'DifferentPass1');
    await user.click(screen.getByRole('button', { name: /reset password/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();

    await user.clear(confirmPwd);
    await user.type(confirmPwd, 'StrongPass1');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => expect(resetPassword).toHaveBeenCalledWith('validtoken123', 'StrongPass1'));
    expect(await screen.findByTestId('reset-password-success')).toBeInTheDocument();
  });
});
