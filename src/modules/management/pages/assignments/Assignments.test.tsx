import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import AssignmentsOverview from './AssignmentsOverview';

const getUnassigned = vi.fn();
const getSummary = vi.fn();
const getAdvisors = vi.fn();
const getAdvisorCohorts = vi.fn();
const autoAssignStudents = vi.fn();
const previewAssign = vi.fn();
const assignStudents = vi.fn();

// The page talks to the shared assignment service; mocking it keeps the test
// independent of the request shape of every endpoint it uses.
vi.mock('../../../advising/services/assignmentService', () => ({
  assignmentService: {
    getUnassigned: (...args: unknown[]) => getUnassigned(...args),
    getSummary: (...args: unknown[]) => getSummary(...args),
    getAdvisors: (...args: unknown[]) => getAdvisors(...args),
    getAllAdvisorCohorts: (...args: unknown[]) => getAdvisorCohorts(...args),
    getCohortPool: vi.fn().mockResolvedValue([]),
    autoAssignStudents: (...args: unknown[]) => autoAssignStudents(...args),
    previewAssign: (...args: unknown[]) => previewAssign(...args),
    assign: (...args: unknown[]) => assignStudents(...args),
    previewUnassign: vi.fn(),
    unassign: vi.fn(),
    previewCohortAssign: vi.fn(),
    assignCohort: vi.fn(),
    previewAutoAssign: vi.fn(),
    confirmAutoAssign: vi.fn(),
    replaceCohortPool: vi.fn(),
    updateLimit: vi.fn(),
  },
  notificationService: {
    list: vi.fn(),
    unreadCount: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
  },
}));

// `sonner` renders into a <Toaster/> the page does not mount, so the toast
// calls are captured here and asserted directly.
const { toastError, toastSuccess } = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: Object.assign(
    (...args: unknown[]) => toastError(...args),
    {
      error: (...args: unknown[]) => toastError(...args),
      success: (...args: unknown[]) => toastSuccess(...args),
      warning: (...args: unknown[]) => toastSuccess(...args),
    },
  ),
}));

const STUDENTS = [
  {
    id: 's1',
    studentCode: 'SE173012',
    fullName: 'Nguyen Van A',
    cohortId: 'c1',
    cohort: 'K19',
    majorCode: 'SE',
    hasPendingRequest: true,
  },
  {
    id: 's2',
    studentCode: 'SE173013',
    fullName: 'Le Van B',
    cohortId: 'c1',
    cohort: 'K19',
    majorCode: 'SE',
    hasPendingRequest: false,
  },
];

const ADVISORS = [
  { id: 'ad1', email: 'advisor1@fpt.edu.vn', fullName: 'Tran Thi C', maxAdvisees: 30, activeStudents: 5 },
  { id: 'ad2', email: 'advisor2@fpt.edu.vn', fullName: 'Pham Van D', maxAdvisees: 30, activeStudents: 3 },
];

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/admin/assignments?tab=unassigned']}>
        <AssignmentsOverview />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Opens the "Unassigned students" tab and waits for its rows. */
async function openUnassignedTab() {
  const user = userEvent.setup();
  renderPage();
  await screen.findByRole('tab', { name: /Unassigned students/i });
  await user.click(screen.getByRole('tab', { name: /Unassigned students/i }));
  await screen.findByText('SE173012');
  return user;
}

describe('AssignmentsOverview — unassigned students', () => {
  beforeEach(() => {
    getUnassigned.mockResolvedValue({
      items: STUDENTS,
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1,
    });
    getSummary.mockResolvedValue({
      total: 42,
      assigned: 40,
      unassigned: 2,
      missingAcademicProfile: 0,
      pendingAdvisorRequests: 1,
      cohorts: [{ cohortId: 'c1', cohort: 'K19', majorCode: 'SE', total: 20, assigned: 18, unassigned: 2 }],
    });
    getAdvisors.mockResolvedValue(ADVISORS);
    getAdvisorCohorts.mockResolvedValue([]);
    autoAssignStudents.mockResolvedValue({ assigned: 2, allocation: {} });
    previewAssign.mockResolvedValue({ scheduledAppointments: [], appointmentCount: 0, warning: false });
    assignStudents.mockResolvedValue({ assigned: 1, overLimitBy: 0, warning: false });
  });

  it('renders the unassigned students in the DataTable with the configured columns', async () => {
    renderPage();

    expect(await screen.findByText('SE173012')).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(within(table).getByText('Nguyen Van A')).toBeInTheDocument();
    expect(within(table).getByText('SE173013')).toBeInTheDocument();
    expect(within(table).getByText('Le Van B')).toBeInTheDocument();
    // "SE" is the major of both students.
    expect(within(table).getAllByText('SE').length).toBeGreaterThan(0);
    expect(within(table).getAllByText('K19').length).toBeGreaterThan(0);

    expect(screen.getByRole('columnheader', { name: /Student ID/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Full Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Major/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Cohort/i })).toBeInTheDocument();
  });

  it('hides the bulk action bar until a student is selected', async () => {
    const user = await openUnassignedTab();

    expect(screen.queryByRole('region', { name: 'Bulk actions' })).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Select row 1'));

    expect(await screen.findByRole('region', { name: 'Bulk actions' })).toBeInTheDocument();
    expect(screen.getByText('1 row selected')).toBeInTheDocument();
  });

  it('offers both bulk actions once a student is selected', async () => {
    const user = await openUnassignedTab();

    await user.click(screen.getByLabelText('Select row 1'));

    expect(await screen.findByRole('button', { name: /Assign to Advisor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Auto Assign/i })).toBeInTheDocument();
  });

  it('opens the advisor dropdown modal from the bulk action bar', async () => {
    const user = await openUnassignedTab();

    await user.click(screen.getByLabelText('Select row 1'));
    await user.click(await screen.findByRole('button', { name: /Assign to Advisor/i }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    const select = (await screen.findByLabelText('Choose an advisor')) as HTMLSelectElement;
    expect(select.options.length).toBe(ADVISORS.length + 1);
    expect(screen.getByRole('option', { name: /Tran Thi C/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Pham Van D/ })).toBeInTheDocument();
  });

  it('assigns the selected students to the chosen advisor', async () => {
    const user = await openUnassignedTab();

    await user.click(screen.getByLabelText('Select row 1'));
    await user.click(await screen.findByRole('button', { name: /Assign to Advisor/i }));
    await user.selectOptions(await screen.findByLabelText('Choose an advisor'), 'ad1');

    await waitFor(() => expect(previewAssign).toHaveBeenCalledWith(['s1'], 'ad1'));

    await user.click(screen.getByRole('button', { name: /^Assign$/i }));

    await waitFor(() =>
      expect(assignStudents).toHaveBeenCalledWith(['s1'], 'ad1', false, undefined),
    );
    expect(toastSuccess).toHaveBeenCalledWith('1 student assigned to Tran Thi C.');
  });

  it('auto assigns every selected student', async () => {
    const user = await openUnassignedTab();

    await user.click(screen.getByLabelText('Select row 1'));
    await user.click(screen.getByLabelText('Select row 2'));

    await user.click(await screen.findByRole('button', { name: /Auto Assign/i }));

    await waitFor(() =>
      expect(autoAssignStudents).toHaveBeenCalledWith(['s1', 's2']),
    );
    expect(toastSuccess).toHaveBeenCalledWith('2 students assigned automatically.');
  });

  it('auto assigns only the ticked students', async () => {
    const user = await openUnassignedTab();

    await user.click(screen.getByLabelText('Select row 2'));
    await user.click(await screen.findByRole('button', { name: /Auto Assign/i }));

    await waitFor(() => expect(autoAssignStudents).toHaveBeenCalledWith(['s2']));
  });

  it('selects every row on the page from the header checkbox', async () => {
    const user = await openUnassignedTab();

    await user.click(screen.getByLabelText('Select all'));

    expect(await screen.findByText('2 rows selected')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Auto Assign/i }));

    await waitFor(() => expect(autoAssignStudents).toHaveBeenCalledWith(['s1', 's2']));
  });

  it('clears the selection from the bulk action bar', async () => {
    const user = await openUnassignedTab();

    await user.click(screen.getByLabelText('Select row 1'));
    expect(await screen.findByText('1 row selected')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Clear selection'));

    await waitFor(() =>
      expect(screen.queryByRole('region', { name: 'Bulk actions' })).not.toBeInTheDocument(),
    );
  });

  it('queries the API with the search term', async () => {
    const user = await openUnassignedTab();

    await user.type(screen.getByLabelText('Search'), 'nguyen');

    await waitFor(
      () => {
        const call = getUnassigned.mock.calls.at(-1)?.[0];
        expect(call).toMatchObject({ search: 'nguyen' });
      },
      { timeout: 2000 },
    );
  });

  it('queries the API with the selected cohort', async () => {
    const user = await openUnassignedTab();

    await user.selectOptions(await screen.findByLabelText('Filter by cohort'), 'c1');

    await waitFor(() => {
      const call = getUnassigned.mock.calls.at(-1)?.[0];
      expect(call).toMatchObject({ cohortId: 'c1' });
    });
  });
});
