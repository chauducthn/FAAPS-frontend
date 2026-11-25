import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SetRoleModal } from './SetRoleModal';
import { BulkSetRoleModal } from './BulkSetRoleModal';
import type { AdminUserSummary } from '../types/admin';

const checkEmailAvailability = vi.fn();
const changeUserRole = vi.fn();
const bulkChangeUserRole = vi.fn();

vi.mock('../services/adminService', () => ({
  adminService: {
    checkEmailAvailability: (...args: unknown[]) => checkEmailAvailability(...args),
    changeUserRole: (...args: unknown[]) => changeUserRole(...args),
    bulkChangeUserRole: (...args: unknown[]) => bulkChangeUserRole(...args),
  },
}));

vi.mock('../../academic/hooks/queries/useCurriculumsQuery', () => ({
  useCurriculumsQuery: () => ({ data: { items: [] }, isLoading: false }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

const studentA: AdminUserSummary = {
  id: 'u-1',
  userId: 'SE180001',
  fullName: 'Nguyen Van A',
  email: 'anv@fpt.edu.vn',
  role: 'STUDENT',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  hasPassword: true,
};

const studentB: AdminUserSummary = {
  id: 'u-2',
  userId: 'SE180002',
  fullName: 'Tran Thi B',
  email: 'btt@fpt.edu.vn',
  role: 'STUDENT',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  hasPassword: true,
};

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('SetRoleModal and BulkSetRoleModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkEmailAvailability.mockResolvedValue({});
  });

  it('auto-suggests swapped domain email, blocks when taken, and submits when available', async () => {
    checkEmailAvailability.mockResolvedValueOnce({ 'anv@fe.edu.vn': false });
    checkEmailAvailability.mockResolvedValueOnce({ 'anv.advisor@fe.edu.vn': true });
    changeUserRole.mockResolvedValue({ ...studentA, role: 'ADVISOR', email: 'anv.advisor@fe.edu.vn' });

    const onClose = vi.fn();
    const user = userEvent.setup();
    wrap(<SetRoleModal open user={studentA} onClose={onClose} />);

    const emailInput = screen.getByLabelText('Account email') as HTMLInputElement;
    expect(emailInput.value).toBe('anv@fe.edu.vn');

    await waitFor(() => {
      expect(screen.getByText(/already in use/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /confirm role change/i })).toBeDisabled();

    await user.clear(emailInput);
    await user.type(emailInput, 'anv.advisor@fe.edu.vn');

    await waitFor(() => {
      expect(screen.getByText(/email is available/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /confirm role change/i }));
    await waitFor(() => {
      expect(changeUserRole).toHaveBeenCalledWith('u-1', {
        role: 'ADVISOR',
        email: 'anv.advisor@fe.edu.vn',
      });
    });
  });

  it('previews suggested emails in bulk modal, catches duplicates, and applies updates', async () => {
    checkEmailAvailability.mockResolvedValue({
      'anv@fe.edu.vn': true,
      'btt@fe.edu.vn': true,
    });
    bulkChangeUserRole.mockResolvedValue({
      updated: 2,
      results: [
        { userId: 'u-1', email: 'anv@fe.edu.vn', fullName: 'Nguyen Van A', status: 'UPDATED', reason: null },
        { userId: 'u-2', email: 'btt@fe.edu.vn', fullName: 'Tran Thi B', status: 'UPDATED', reason: null },
      ],
    });

    const onClose = vi.fn();
    const onDone = vi.fn();
    const user = userEvent.setup();
    wrap(<BulkSetRoleModal targets={[studentA, studentB]} onClose={onClose} onDone={onDone} />);

    const inputA = screen.getByLabelText('Email for Nguyen Van A') as HTMLInputElement;
    const inputB = screen.getByLabelText('Email for Tran Thi B') as HTMLInputElement;
    expect(inputA.value).toBe('anv@fe.edu.vn');
    expect(inputB.value).toBe('btt@fe.edu.vn');

    await user.clear(inputB);
    await user.type(inputB, 'anv@fe.edu.vn');
    expect(screen.getAllByText(/duplicate in this batch/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /apply to 2 accounts/i })).toBeDisabled();

    await user.clear(inputB);
    await user.type(inputB, 'btt@fe.edu.vn');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /apply to 2 accounts/i })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: /apply to 2 accounts/i }));
    await waitFor(() => {
      expect(bulkChangeUserRole).toHaveBeenCalledWith('ADVISOR', [
        { userId: 'u-1', email: 'anv@fe.edu.vn' },
        { userId: 'u-2', email: 'btt@fe.edu.vn' },
      ]);
      expect(onDone).toHaveBeenCalled();
    });
  });
});
