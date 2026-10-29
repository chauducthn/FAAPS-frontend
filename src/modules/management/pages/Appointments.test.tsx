import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Appointments from './Appointments';

const getAppointments = vi.fn();
const getSummary = vi.fn();
const getAppointment = vi.fn();

vi.mock('../services/appointment.service', () => ({
  adminAppointmentService: {
    getAppointments: (...args: unknown[]) => getAppointments(...args),
    getSummary: (...args: unknown[]) => getSummary(...args),
    getAppointment: (...args: unknown[]) => getAppointment(...args),
  },
}));

const getAdvisors = vi.fn();

// The advisor dropdown is fed by the assignments API; mocking the hook keeps
// the test independent of that service's request shape.
vi.mock('../hooks/queries/useAdminAssignments', () => ({
  useAssignmentAdvisors: () => ({ data: getAdvisors() }),
}));

const APPOINTMENTS = [
  {
    id: 'a1',
    studentId: 's1',
    studentName: 'Nguyen Van A',
    advisorId: 'ad1',
    advisorName: 'Tran Thi B',
    scheduledAt: '2026-10-12T09:00:00Z',
    endedAt: '2026-10-12T09:30:00Z',
    location: 'Room A1',
    agenda: 'Study plan review',
    status: 'SCHEDULED',
  },
  {
    id: 'a2',
    studentId: 's2',
    studentName: 'Le Van C',
    advisorId: 'ad2',
    advisorName: 'Pham Van D',
    scheduledAt: '2026-11-05T14:00:00Z',
    endedAt: '2026-11-05T14:30:00Z',
    location: null,
    agenda: null,
    status: 'COMPLETED',
  },
];

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <Appointments />
    </QueryClientProvider>,
  );
}

describe('Appointments', () => {
  beforeEach(() => {
    getAppointments.mockResolvedValue({
      items: APPOINTMENTS,
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1,
    });
    getSummary.mockResolvedValue({
      total: 2,
      scheduled: 1,
      completed: 1,
      cancelled: 0,
      noShow: 0,
    });
    getAdvisors.mockReturnValue([
      { id: 'ad1', email: 'b@fpt.edu.vn', fullName: 'Tran Thi B', maxAdvisees: 30, activeStudents: 5 },
      { id: 'ad2', email: 'd@fpt.edu.vn', fullName: 'Pham Van D', maxAdvisees: 30, activeStudents: 3 },
    ]);
    getAppointment.mockResolvedValue(APPOINTMENTS[0]);
  });

  it('renders the appointments in the DataTable with the configured columns', async () => {
    renderPage();

    expect(await screen.findByText('Nguyen Van A')).toBeInTheDocument();

    // The advisor names also appear in the filter dropdown, so the row
    // assertions are scoped to the table.
    const table = screen.getByRole('table');
    expect(within(table).getByText('Tran Thi B')).toBeInTheDocument();
    expect(within(table).getByText('Le Van C')).toBeInTheDocument();
    expect(within(table).getByText('Pham Van D')).toBeInTheDocument();

    expect(screen.getByRole('columnheader', { name: /Student/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Advisor/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Date & Time/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Actions/i })).toBeInTheDocument();
  });

  it('formats the scheduled slot as a date and a time range', async () => {
    renderPage();

    await screen.findByText('Nguyen Van A');
    const table = screen.getByRole('table');
    const firstRow = within(table).getAllByRole('row')[1];
    // The slot is split over two lines — the day, then the time range — and
    // rendered in the local timezone, so only the shape is asserted here.
    expect(within(firstRow).getByText('Oct 12, 2026')).toBeInTheDocument();
    expect(within(firstRow).getByText(/\d{2}:\d{2} – \d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('shows the status badge of every appointment', async () => {
    renderPage();

    await screen.findByText('Nguyen Van A');
    // The summary cards also carry a "Scheduled" label, so scope to the rows.
    const table = screen.getByRole('table');
    expect(within(table).getByText('Scheduled')).toBeInTheDocument();
    expect(within(table).getByText('Completed')).toBeInTheDocument();
  });

  it('offers the status, advisor and date range filters', async () => {
    renderPage();

    expect(await screen.findByLabelText('Filter by status')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by advisor')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by date range')).toBeInTheDocument();
  });

  it('lists every advisor in the advisor dropdown', async () => {
    renderPage();

    const select = (await screen.findByLabelText('Filter by advisor')) as HTMLSelectElement;
    await waitFor(() => expect(select.options.length).toBe(3));

    expect(select.options[0].textContent).toBe('All advisors');
    expect(screen.getByRole('option', { name: 'Tran Thi B' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pham Van D' })).toBeInTheDocument();
  });

  it('queries the API with the selected advisor', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Nguyen Van A');

    await user.selectOptions(await screen.findByLabelText('Filter by advisor'), 'ad1');

    await waitFor(() => {
      const call = getAppointments.mock.calls.at(-1)?.[0];
      expect(call).toMatchObject({ advisorId: 'ad1', page: 0 });
    });
  });

  it('queries the API with the selected date range', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Nguyen Van A');

    await user.click(screen.getByLabelText('Filter by date range'));
    await user.type(screen.getByLabelText('Filter by start date'), '2026-10-01');
    await user.type(screen.getByLabelText('Filter by end date'), '2026-10-31');

    await waitFor(() => {
      const call = getAppointments.mock.calls.at(-1)?.[0];
      expect(call).toMatchObject({ fromDate: '2026-10-01', toDate: '2026-10-31' });
    });
  });

  it('queries the API with the selected status', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Nguyen Van A');

    await user.selectOptions(await screen.findByLabelText('Filter by status'), 'COMPLETED');

    await waitFor(() => {
      const call = getAppointments.mock.calls.at(-1)?.[0];
      expect(call).toMatchObject({ status: 'COMPLETED' });
    });
  });

  it('clears every filter with the clear button', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Nguyen Van A');
    await user.selectOptions(screen.getByLabelText('Filter by advisor'), 'ad1');

    await waitFor(() => {
      const call = getAppointments.mock.calls.at(-1)?.[0];
      expect(call).toMatchObject({ advisorId: 'ad1' });
    });

    await user.click(screen.getByRole('button', { name: /Reset/i }));

    await waitFor(() => {
      const call = getAppointments.mock.calls.at(-1)?.[0];
      expect(call).not.toMatchObject({ advisorId: 'ad1' });
    });
  });

  it('searches through the API instead of filtering client-side', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Nguyen Van A');

    await user.type(screen.getByRole('searchbox'), 'nguyen');

    await waitFor(
      () => {
        const call = getAppointments.mock.calls.at(-1)?.[0];
        expect(call).toMatchObject({ search: 'nguyen' });
      },
      { timeout: 2000 },
    );
  });

  it('opens the detail modal from the row action', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Nguyen Van A');

    await user.click(screen.getAllByRole('button', { name: /View details for/i })[0]);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('switches between the table and the timeline view', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Nguyen Van A');

    await user.click(screen.getByRole('button', { name: /^Timeline$/i }));

    // The table is replaced by the timeline, which groups the sessions by day.
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(await screen.findByText('Nguyen Van A')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Table$/i }));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
