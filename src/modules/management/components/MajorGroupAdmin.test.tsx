// Admin forms that pick a Major Group: Advisor accounts (create / edit) and Majors.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CreateUserModal } from './CreateUserModal';
import CreateMajorModal from './majors/CreateMajorModal';
import type { AdminUserSummary } from '../types/admin';

const listGroups = vi.fn();
const createUser = vi.fn();
const changeUserRole = vi.fn();

vi.mock('../../academic/services/majorGroupService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../academic/services/majorGroupService')>()),
  majorGroupService: { list: () => listGroups() },
}));
vi.mock('../services/adminService', () => ({
  adminService: {
    createUser: (body: unknown) => createUser(body),
    changeUserRole: (id: string, body: unknown) => changeUserRole(id, body),
  },
}));
vi.mock('../../academic/hooks/queries/useCurriculumsQuery', () => ({
  useCurriculumsQuery: () => ({ data: { items: [] } }),
  useSemesterOptions: () => ({ data: [] }),
}));
vi.mock('../hooks/queries/useAdminDashboard', () => ({ useMajorOptions: () => ({ data: [] }) }));

const GROUPS = [
  { id: 'g-bit', code: 'BIT', name: 'Information Technology' },
  { id: 'g-bba', code: 'BBA', name: 'Business Administration' },
];

const wrap = (ui: ReactNode) =>
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>);

const waitForGroups = () => screen.findByRole('option', { name: 'BIT · Information Technology' });

describe('Major Group in Admin forms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listGroups.mockResolvedValue(GROUPS);
  });

  it('creates an Advisor with the chosen Major Group', async () => {
    createUser.mockResolvedValue({});
    const user = userEvent.setup();
    wrap(<CreateUserModal open defaultRole="ADVISOR" onClose={vi.fn()} onCreated={vi.fn()} />);
    await waitForGroups();

    await user.type(screen.getByLabelText('Full name'), 'Tran Thi Lan');
    await user.type(screen.getByLabelText('Email'), 'lantt@fe.edu.vn');
    await user.selectOptions(screen.getByLabelText('Major group'), 'g-bba');
    await user.type(screen.getByLabelText('Max advisees'), '30');
    await user.click(screen.getByRole('button', { name: 'Create user' }));

    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({ role: 'ADVISOR', majorGroupId: 'g-bba', maxAdvisees: 30 }));
  });

  it('shows the Major Group only for Advisors', async () => {
    wrap(<CreateUserModal open defaultRole="STUDENT" onClose={vi.fn()} onCreated={vi.fn()} />);
    expect(screen.queryByLabelText('Major group')).not.toBeInTheDocument();
  });

  it('keeps the advisor’s current Major Group when editing', async () => {
    const advisor = { id: 'u-9', userId: 'ADV009', fullName: 'Tran Thi Lan', email: 'lantt@fe.edu.vn', role: 'ADVISOR', status: 'ACTIVE', createdAt: '', majorGroupId: 'g-bit' } as AdminUserSummary;
    wrap(<CreateUserModal open defaultRole="ADVISOR" user={advisor} onClose={vi.fn()} onCreated={vi.fn()} />);
    await waitForGroups();
    expect(screen.getByLabelText('Major group')).toHaveValue('g-bit');
  });

  it('disables the dropdown when the list cannot be loaded', async () => {
    listGroups.mockRejectedValue(new Error('404'));
    wrap(<CreateUserModal open defaultRole="ADVISOR" onClose={vi.fn()} onCreated={vi.fn()} />);
    const select = screen.getByLabelText('Major group');
    expect(await within(select).findByRole('option', { name: 'Major groups could not be loaded' })).toBeInTheDocument();
    expect(select).toBeDisabled();
  });

  it('saves the Major Group of a major, and keeps it when editing', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const initial = { code: 'SE', name: 'Software Engineering', totalCredits: 144, durationYears: 3.5, cohort: 'K19', status: 'ACTIVE' as const, majorGroupId: 'g-bit' };
    wrap(<CreateMajorModal isOpen onClose={vi.fn()} onSubmit={onSubmit} initialData={initial} />);
    await waitForGroups();
    expect(screen.getByLabelText('Major group')).toHaveValue('g-bit');

    await user.selectOptions(screen.getByLabelText('Major group'), 'g-bba');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ code: 'SE', majorGroupId: 'g-bba' }));
  });

  it('sends no Major Group for a major when none is chosen', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    wrap(<CreateMajorModal isOpen onClose={vi.fn()} onSubmit={onSubmit} existingCodes={['AI']} />);
    await waitForGroups();
    await user.selectOptions(screen.getByLabelText(/Major code/), 'AI');
    await user.type(screen.getByLabelText(/Major name/), 'Artificial Intelligence');
    await user.click(screen.getByRole('button', { name: 'Create major' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ code: 'AI', majorGroupId: null }));
  });
});
