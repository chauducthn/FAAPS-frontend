import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import UserAccounts from './UserAccounts';

const listUsers = vi.fn();
const getCohortOptions = vi.fn();
const getMajorOptions = vi.fn();
const createUser = vi.fn();
const getAdvisors = vi.fn();
const previewAssign = vi.fn();
const assignStudents = vi.fn();
const resetUserPassword = vi.fn();
const bulkResetUserPassword = vi.fn();
const semesters = { items: [] as { id: string; code: string; startDate: string | null }[] };
const curriculums = {
  items: [] as {
    id: string;
    majorCode: string;
    version: string;
    name: string;
    effectiveFromSemesterId: string | null;
  }[],
};

vi.mock('../services/adminService', () => ({
  adminService: {
    getUsers: (...args: unknown[]) => listUsers(...args),
    getCohortOptions: (...args: unknown[]) => getCohortOptions(...args),
    getMajorOptions: (...args: unknown[]) => getMajorOptions(...args),
    createUser: (...args: unknown[]) => createUser(...args),
    changeUserStatus: vi.fn(),
    changeUserRole: vi.fn(),
    bulkChangeUserStatus: vi.fn(),
    resetUserPassword: (...args: unknown[]) => resetUserPassword(...args),
    bulkResetUserPassword: (...args: unknown[]) => bulkResetUserPassword(...args),
    getUser: vi.fn(),
  },
}));

vi.mock('../../academic/hooks/queries/useCurriculumsQuery', () => ({
  useCurriculumsQuery: () => ({ data: curriculums }),
  useSemesterOptions: () => ({ data: semesters.items, isLoading: false }),
}));

vi.mock('../hooks/queries/useAdminAssignments', () => ({
  useAssignmentAdvisors: () => ({ data: [] }),
  usePreviewAssign: () => ({ mutateAsync: previewAssign, isPending: false }),
  useAssignStudents: () => ({ mutateAsync: assignStudents, isPending: false }),
}));

function renderPage(path = '/admin/users') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <UserAccounts />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('UserAccounts', () => {
  beforeEach(() => {
    semesters.items = [];
    curriculums.items = [];
    listUsers.mockResolvedValue({
      items: [
        {
          id: 'u1',
          userId: 'SE173012',
          fullName: 'Nguyen Van A',
          email: 'a@fpt.edu.vn',
          role: 'STUDENT',
          status: 'ACTIVE',
          hasPassword: true,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    getCohortOptions.mockResolvedValue([
      { cohortId: 'c1', cohort: 'K19', majorCode: 'SE', students: 42 },
    ]);
    getMajorOptions.mockResolvedValue([
      { id: 'm1', code: 'SE', name: 'Software Engineering' },
    ]);
    getAdvisors.mockResolvedValue([]);
  });

  it('renders the accounts in the DataTable', async () => {
    renderPage();
    expect(await screen.findByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('a@fpt.edu.vn')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Full Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Email/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Role/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Major/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Cohort/i })).toBeInTheDocument();
  });

  it('shows the major and cohort of a student and a dash for an advisor', async () => {
    listUsers.mockResolvedValue({
      items: [
        { id: 'u1', userId: 'SE173012', fullName: 'Nguyen Van A', email: 'a@fpt.edu.vn', role: 'STUDENT', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z', majorCode: 'SE', cohort: 'K17' },
        { id: 'u2', userId: 'b@fe.edu.vn', fullName: 'Tran Advisor', email: 'b@fe.edu.vn', role: 'ADVISOR', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z', majorCode: null, cohort: null },
      ],
      page: 0, size: 10, totalElements: 2, totalPages: 1,
    });
    renderPage();
    const student = (await screen.findByText('Nguyen Van A')).closest('tr')!;
    expect(student).toHaveTextContent('SE');
    expect(student).toHaveTextContent('K17');
    const advisor = screen.getByText('Tran Advisor').closest('tr')!;
    expect(advisor).toHaveTextContent('—');
  });

  it('starts with the role from the link (?role=ADVISOR)', async () => {
    renderPage('/admin/users?role=ADVISOR');
    await waitFor(() => expect(listUsers.mock.calls.at(-1)?.[0]).toMatchObject({ role: 'ADVISOR' }));
    expect(screen.getByLabelText('Filter by role')).toHaveValue('ADVISOR');
  });

  it('offers the role, status, major and cohort filters', async () => {
    renderPage();
    expect(await screen.findByLabelText('Filter by role')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by major')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by cohort')).toBeInTheDocument();
  });

  it('no longer offers the Student / Advisor tabs', async () => {
    renderPage();
    await screen.findByText('Nguyen Van A');
    expect(screen.queryByRole('tab', { name: /Student/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Advisor/i })).not.toBeInTheDocument();
  });

  it('queries the API with the selected role', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Nguyen Van A');

    await user.selectOptions(await screen.findByLabelText('Filter by role'), 'ADVISOR');

    await waitFor(() => {
      const call = listUsers.mock.calls.at(-1)?.[0];
      expect(call).toMatchObject({ role: 'ADVISOR', page: 0 });
    });
  });

  it('queries the API with the selected major', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Nguyen Van A');

    await user.selectOptions(await screen.findByLabelText('Filter by major'), 'm1');

    await waitFor(() => {
      const call = listUsers.mock.calls.at(-1)?.[0];
      expect(call).toMatchObject({ majorId: 'm1', page: 0 });
    });
  });

  it('filters by the exact cohort, not by the whole major', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Nguyen Van A');

    await user.selectOptions(await screen.findByLabelText('Filter by cohort'), 'c1');

    await waitFor(() => {
      const call = listUsers.mock.calls.at(-1)?.[0];
      expect(call).toMatchObject({ curriculumVersionId: 'c1' });
      expect(call.majorId).toBeUndefined();
    });
  });

  it('searches through the API instead of filtering client-side', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Nguyen Van A');

    await user.type(screen.getByLabelText('Search accounts'), 'nguyen');

    await waitFor(
      () => {
        const call = listUsers.mock.calls.at(-1)?.[0];
        expect(call).toMatchObject({ search: 'nguyen' });
      },
      { timeout: 2000 },
    );
  });

  it('hides the rows-per-page selector and offers a go-to-page field', async () => {
    renderPage();
    await screen.findByText('Nguyen Van A');
    expect(screen.queryByLabelText('Rows per page')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Go to page')).toBeInTheDocument();
  });

  it('jumps to the page the admin types', async () => {
    const user = userEvent.setup();
    listUsers.mockResolvedValue({
      items: [],
      page: 0,
      size: 10,
      totalElements: 42,
      totalPages: 5,
    });
    renderPage();
    await screen.findByLabelText('Go to page');

    const field = screen.getByLabelText('Go to page');
    await user.clear(field);
    await user.type(field, '5');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      const call = listUsers.mock.calls.at(-1)?.[0];
      expect(call).toMatchObject({ page: 4 });
    });
  });

  describe('bulk actions', () => {
    it('offers Reset password, Suspend and Activate for the selected rows', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Nguyen Van A');

      await user.click(screen.getByLabelText('Select row 1'));

      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /suspend/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /activate/i })).toBeInTheDocument();
    });

    it('offers the same bulk actions when the selection mixes roles', async () => {
      const user = userEvent.setup();
      listUsers.mockResolvedValue({
        items: [
          {
            id: 'u1',
            userId: 'SE173012',
            fullName: 'Nguyen Van A',
            email: 'a@fpt.edu.vn',
            role: 'STUDENT',
            status: 'ACTIVE',
            hasPassword: true,
            createdAt: '2026-01-01T00:00:00Z',
          },
          {
            id: 'u2',
            userId: 'ADV001',
            fullName: 'Tran Advisor',
            email: 'b@fe.edu.vn',
            role: 'ADVISOR',
            status: 'ACTIVE',
            hasPassword: true,
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
      });
      renderPage();
      await screen.findByText('Tran Advisor');

      await user.click(screen.getByLabelText('Select row 1'));
      await user.click(screen.getByLabelText('Select row 2'));

      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });

  describe('row actions', () => {
    it('offers Reset password in the three-dot menu', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Nguyen Van A');

      await user.click(screen.getByLabelText('Actions for Nguyen Van A'));

      expect(await screen.findByRole('menuitem', { name: /reset password/i })).toBeInTheDocument();
    });

    it('disables Reset password for a Google-only account', async () => {
      const user = userEvent.setup();
      listUsers.mockResolvedValue({
        items: [
          {
            id: 'u1',
            userId: 'SE173012',
            fullName: 'Nguyen Van A',
            email: 'a@fpt.edu.vn',
            role: 'STUDENT',
            status: 'ACTIVE',
            hasPassword: false,
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      });
      renderPage();
      await screen.findByText('Nguyen Van A');

      await user.click(screen.getByLabelText('Actions for Nguyen Van A'));

      const item = await screen.findByRole('menuitem', { name: /reset password/i });
      expect(item).toBeDisabled();
      expect(item).toHaveAttribute('title', expect.stringContaining('Google'));
    });
  });
});
