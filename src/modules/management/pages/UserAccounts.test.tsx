import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import UserAccounts from './UserAccounts';

const listUsers = vi.fn();
const getCohortOptions = vi.fn();
const getMajorOptions = vi.fn();
const getCurriculums = vi.fn();
const createUser = vi.fn();

vi.mock('../services/adminService', () => ({
  adminService: {
    getUsers: (...args: unknown[]) => listUsers(...args),
    getCohortOptions: (...args: unknown[]) => getCohortOptions(...args),
    getMajorOptions: (...args: unknown[]) => getMajorOptions(...args),
    createUser: (...args: unknown[]) => createUser(...args),
    changeUserStatus: vi.fn(),
    changeUserRole: vi.fn(),
    bulkChangeUserStatus: vi.fn(),
    getUser: vi.fn(),
  },
}));

const curriculumItems = [
  { id: 'c-se19', majorCode: 'SE', version: 'K19', name: 'SE K19', effectiveFromSemesterId: 's1' },
  { id: 'c-se18', majorCode: 'SE', version: 'K18', name: 'SE K18', effectiveFromSemesterId: 's1' },
  { id: 'c-ai19', majorCode: 'AI', version: 'K19', name: 'AI K19', effectiveFromSemesterId: 's1' },
];

vi.mock('../../academic/hooks/queries/useCurriculumsQuery', () => ({
  useCurriculumsQuery: () => ({ data: { items: curriculumItems } }),
  useSemesterOptions: () => ({ data: [{ id: 's1', code: 'FA2026', startDate: '2026-09-07' }], isLoading: false }),
  useCurriculumCourses: (id: string | null) => ({
    data: id ? Array.from({ length: 9 }, (_, i) => ({ semesterNumber: i + 1 })) : undefined,
  }),
}));

vi.mock('../hooks/queries/useAdminAssignments', () => ({
  useAssignmentAdvisors: () => ({ data: [{ id: 'a1', fullName: 'Advisor One', email: 'a1@fpt.edu.vn', activeStudents: 2, maxAdvisees: 30 }] }),
  usePreviewAssign: () => ({ mutateAsync: vi.fn().mockResolvedValue({ appointmentCount: 0, scheduledAppointments: [] }), isPending: false }),
  useAssignStudents: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/admin/users']}>
        <UserAccounts />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('UserAccounts', () => {
  beforeEach(() => {
    listUsers.mockResolvedValue({
      items: [
        {
          id: 'u1',
          userId: 'SE173012',
          fullName: 'Nguyen Van A',
          email: 'a@fpt.edu.vn',
          role: 'STUDENT',
          status: 'ACTIVE',
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

  it('has no Student / Advisor tabs: the role is a column filter', async () => {
    renderPage();
    await screen.findByText('Nguyen Van A');
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Filter by role')).toBeInTheDocument();
  });

  it('puts the role, major, cohort and status filters in the table header', async () => {
    renderPage();
    await screen.findByText('Nguyen Van A');
    const headerFilters = screen.getByTestId('header-filters');
    for (const label of ['Filter by role', 'Filter by major', 'Filter by cohort', 'Filter by status']) {
      expect(headerFilters).toContainElement(screen.getByLabelText(label));
    }
  });

  it('lists accounts of every role until a role is chosen', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Nguyen Van A');
    expect(listUsers.mock.calls.at(-1)?.[0].role).toBeUndefined();

    await user.selectOptions(screen.getByLabelText('Filter by role'), 'ADVISOR');
    await waitFor(() => expect(listUsers.mock.calls.at(-1)?.[0]).toMatchObject({ role: 'ADVISOR', page: 0 }));
  });

  it('shows the major and cohort of a student', async () => {
    listUsers.mockResolvedValue({
      items: [{ id: 'u1', userId: 'SE190001', fullName: 'Nguyen Van A', email: 'a@fpt.edu.vn', role: 'STUDENT', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z', majorCode: 'SE', cohort: 'K19' }],
      page: 0, size: 10, totalElements: 1, totalPages: 1,
    });
    renderPage();
    const row = (await screen.findByText('Nguyen Van A')).closest('tr')!;
    expect(row).toHaveTextContent('SE');
    expect(row).toHaveTextContent('K19');
  });

  it('has no rows-per-page picker but lets the admin jump to a page', async () => {
    listUsers.mockResolvedValue({ items: [], page: 0, size: 10, totalElements: 95, totalPages: 10 });
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Page 1 of 10');
    expect(screen.queryByLabelText('Rows per page')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Go to page'), '7');
    await user.click(screen.getByRole('button', { name: 'Go' }));
    await waitFor(() => expect(listUsers.mock.calls.at(-1)?.[0]).toMatchObject({ page: 6 }));
  });

  it('offers "Set advisor" in the bulk actions for the selected students', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Nguyen Van A');

    await user.click(screen.getByLabelText('Select row 1'));
    await user.click(await screen.findByRole('button', { name: /set advisor/i }));
    expect(await screen.findByText('Assign to Advisor')).toBeInTheDocument();
    expect(screen.getByText(/1 student selected: Nguyen Van A/)).toBeInTheDocument();
  });

  it('offers the major and cohort filters', async () => {
    renderPage();
    expect(await screen.findByLabelText('Filter by major')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by cohort')).toBeInTheDocument();
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

  it('filters by the exact cohort, not just its major', async () => {
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

  it('only lists the cohorts of the chosen major', async () => {
    getCohortOptions.mockResolvedValue([
      { cohortId: 'c1', cohort: 'K19', majorCode: 'SE', students: 42 },
      { cohortId: 'c2', cohort: 'K19', majorCode: 'AI', students: 10 },
    ]);
    getMajorOptions.mockResolvedValue([
      { id: 'm1', code: 'SE', name: 'Software Engineering' },
      { id: 'm2', code: 'AI', name: 'Artificial Intelligence' },
    ]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Nguyen Van A');
    await screen.findByRole('option', { name: 'AI K19' });

    await user.selectOptions(screen.getByLabelText('Filter by major'), 'm1');

    await waitFor(() => expect(screen.queryByRole('option', { name: 'AI K19' })).not.toBeInTheDocument());
    expect(screen.getByRole('option', { name: 'SE K19' })).toBeInTheDocument();
  });

  it('searches through the API instead of filtering client-side', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Nguyen Van A');

    await user.type(screen.getByRole('searchbox'), 'nguyen');

    await waitFor(
      () => {
        const call = listUsers.mock.calls.at(-1)?.[0];
        expect(call).toMatchObject({ search: 'nguyen' });
      },
      { timeout: 2000 },
    );
  });
  describe('create user modal', () => {
    it('explains that accounts have no password and validates required fields', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Nguyen Van A');

      await user.click(screen.getByRole('button', { name: /create user/i }));
      expect(await screen.findByText(/No password is set/i)).toBeInTheDocument();

      await user.click(screen.getAllByRole('button', { name: /^create user$/i }).at(-1)!);
      expect(await screen.findByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText(/cohort from 01 to 22/i)).toBeInTheDocument();
      expect(createUser).not.toHaveBeenCalled();
    });

    it('rejects a phone that is not a Vietnamese mobile number', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Nguyen Van A');

      await user.click(screen.getByRole('button', { name: /create user/i }));
      await user.type(await screen.findByLabelText('Phone'), '+84901234567');
      await user.click(screen.getAllByRole('button', { name: /^create user$/i }).at(-1)!);
      expect(await screen.findByText(/10-digit Vietnamese number/i)).toBeInTheDocument();
    });

    it('suggests the curriculum from the Student ID and calculates the expected graduation', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Nguyen Van A');

      await user.click(screen.getByRole('button', { name: /create user/i }));
      await user.type(await screen.findByLabelText('Student ID'), 'se190001');

      const curriculum = screen.getByLabelText('Curriculum') as HTMLSelectElement;
      await waitFor(() => expect(curriculum).toHaveValue('c-se19'));
      const offered = Array.from(curriculum.options).map((o) => o.value);
      expect(offered).toEqual(['', 'c-se19', 'c-se18']);

      // 9 semesters starting in FA2026 end in SU2029; the admin cannot type another one.
      await waitFor(() => expect(screen.getByLabelText('Expected graduation semester')).toHaveTextContent('SU2029'));
      expect(screen.getByLabelText('Expected graduation semester').tagName).toBe('OUTPUT');
    });

    it('creates an advisor from the advisor fields', async () => {
      const user = userEvent.setup();
      createUser.mockResolvedValue({});
      renderPage();
      await screen.findByText('Nguyen Van A');

      await user.click(screen.getByRole('button', { name: /create user/i }));
      await user.click(await screen.findByText('Advisor', { selector: 'label' }));
      await user.type(screen.getByLabelText('Full name'), 'Tran Advisor');
      await user.type(screen.getByLabelText('Email'), 'advisor@fpt.edu.vn');
      await user.clear(screen.getByLabelText('Maximum advisees'));
      await user.type(screen.getByLabelText('Maximum advisees'), '12');
      await user.click(screen.getAllByRole('button', { name: /^create user$/i }).at(-1)!);

      await waitFor(() =>
        expect(createUser).toHaveBeenCalledWith(
          expect.objectContaining({ role: 'ADVISOR', fullName: 'Tran Advisor', email: 'advisor@fpt.edu.vn', maxAdvisees: 12 }),
        ),
      );
    });
  });
});
