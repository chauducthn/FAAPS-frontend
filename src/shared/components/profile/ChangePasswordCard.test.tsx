import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangePasswordCard } from './ChangePasswordCard';
import { profileService } from '@/shared/services/profileService';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('ChangePasswordCard', () => {
  it('shows Google notice for Google-authenticated accounts', () => {
    render(<ChangePasswordCard authProvider="GOOGLE" />);
    expect(screen.getByText(/signs in through Google/i)).toBeInTheDocument();
  });

  it('validates password length and confirmation before submitting', async () => {
    const spy = vi.spyOn(profileService, 'changePassword').mockResolvedValue({ success: true, message: 'OK' });
    const user = userEvent.setup();
    render(<ChangePasswordCard authProvider="LOCAL" />);

    const currentInput = screen.getByLabelText('Current password');
    const newInput = screen.getByLabelText('New password');
    const confirmInput = screen.getByLabelText('Confirm new password');

    await user.type(currentInput, 'OldPass123');
    await user.type(newInput, 'short');
    await user.type(confirmInput, 'mismatch');

    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/do not match/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeDisabled();

    await user.clear(newInput);
    await user.clear(confirmInput);
    await user.type(newInput, 'NewPass1234');
    await user.type(confirmInput, 'NewPass1234');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(spy).toHaveBeenCalledWith({ currentPassword: 'OldPass123', newPassword: 'NewPass1234' });
  });
});
