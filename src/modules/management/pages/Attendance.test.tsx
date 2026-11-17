import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import Attendance from './Attendance';
import { parseAttendanceCsv, resetAttendanceMock } from '../services/attendance.service';
import { attendanceResult, maxAbsentSessions } from '../types/attendance';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }));

const listCourses = vi.fn();
vi.mock('../services/course.service', () => ({
  courseService: { list: (...args: unknown[]) => listCourses(...args) },
}));

const course = (id: string, code: string, name: string) => ({
  id,
  code,
  name,
  credits: 3,
  categoryId: 'cat',
  categoryCode: 'CAT',
  categoryName: 'Category',
  status: 'ACTIVE',
  prerequisiteCount: 0,
  usedInCurriculumCount: 0,
  createdAt: '',
  updatedAt: '',
});

function renderAt(path = '/admin/attendance') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Attendance />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const csv = (body: string) =>
  new File([`Student ID,Semester,Course code,Total sessions,Absent sessions\n${body}`], 'attendance.csv', { type: 'text/csv' });

beforeEach(() => {
  resetAttendanceMock();
  listCourses.mockReset();
  listCourses.mockResolvedValue({
    items: [course('c1', 'PRF192', 'Programming Fundamentals'), course('c2', 'SWP391', 'Software Project')],
    page: 0,
    pageSize: 10,
    totalItems: 2,
    totalPages: 1,
  });
});

describe('attendance rules', () => {
  it('works out the allowed absences and the result', () => {
    const rule = { totalSessions: 20, minAttendancePercent: 80, warnAbsentSessions: 3 };
    expect(maxAbsentSessions(rule)).toBe(4);
    expect(attendanceResult(rule, 2)).toBe('OK');
    expect(attendanceResult(rule, 3)).toBe('WARNING');
    expect(attendanceResult(rule, 4)).toBe('WARNING');
    expect(attendanceResult(rule, 5)).toBe('FAIL');
  });

  it('flags invalid and duplicate rows when reading a CSV', () => {
    const rows = parseAttendanceCsv(
      'Student ID,Semester,Course code,Total sessions,Absent sessions\nSE1,FA25,PRF192,20,6\nSE1,FA25,PRF192,20,1\nSE2,FA25,PRF192,20,25\n,FA25,PRF192,20,1\n',
    );
    expect(rows.map((r) => r.result)).toEqual(['FAIL', null, null, null]);
    expect(rows[1].error).toMatch(/Duplicate/);
    expect(rows[2].error).toMatch(/cannot be more/);
    expect(rows[3].error).toMatch(/required/);
  });

  it('rejects a file with the wrong columns', () => {
    expect(() => parseAttendanceCsv('Name,Score\nA,1')).toThrow(/must start with the columns/);
  });
});

describe('Attendance page', () => {
  it('previews an upload, then imports the valid rows into the history', async () => {
    const user = userEvent.setup();
    renderAt();
    expect(screen.getByRole('tab', { name: 'Import' })).toHaveAttribute('aria-selected', 'true');

    await user.upload(screen.getByLabelText('Upload attendance file'), csv('SE1,FA25,PRF192,20,1\nSE2,FA25,PRF192,20,3\nSE3,FA25,PRF192,20,9\nSE4,FA25,PRF192,x,1\n'));

    expect(await screen.findByText('Valid: 3')).toBeInTheDocument();
    expect(screen.getByText('Errors: 1')).toBeInTheDocument();
    expect(screen.getByText('Warning: 1')).toBeInTheDocument();
    expect(screen.getByText('Attendance fail: 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Import 3 valid rows' }));
    const history = screen.getByRole('region', { name: 'Import history' });
    expect(await within(history).findByText('attendance.csv')).toBeInTheDocument();
  });

  it('asks for the CSV template when an Excel file is uploaded', async () => {
    const user = userEvent.setup();
    renderAt();
    await user.upload(screen.getByLabelText('Upload attendance file'), new File(['x'], 'attendance.xlsx'));
    expect(await screen.findByRole('alert')).toHaveTextContent(/upload the CSV template/);
  });

  it('gives a course its own condition and can reset it to the default', async () => {
    const user = userEvent.setup();
    renderAt('/admin/attendance?tab=config');

    const table = await screen.findByRole('table');
    const row = (await within(table).findByText('SWP391')).closest('tr') as HTMLElement;
    expect(within(row).getByText('Default')).toBeInTheDocument();

    await user.click(within(row).getByRole('button', { name: 'Edit SWP391' }));
    const dialog = screen.getByRole('dialog');
    const sessions = within(dialog).getByLabelText('Total sessions');
    await user.clear(sessions);
    await user.type(sessions, '30');
    expect(within(dialog).getByText(/miss up to/)).toHaveTextContent('6 sessions');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const updated = within(screen.getByRole('table')).getByText('SWP391').closest('tr') as HTMLElement;
    expect(within(updated).getByText('Custom')).toBeInTheDocument();
    expect(within(updated).getByText('30')).toBeInTheDocument();

    await user.click(within(updated).getByRole('button', { name: 'Use default for SWP391' }));
    await waitFor(() => expect(within(within(screen.getByRole('table')).getByText('SWP391').closest('tr') as HTMLElement).getByText('Default')).toBeInTheDocument());
  });

  it('rejects a default condition that warns after more sessions than the course has', async () => {
    const user = userEvent.setup();
    renderAt('/admin/attendance?tab=config');
    const card = await screen.findByRole('region', { name: 'Default condition' });
    const warn = await within(card).findByLabelText('Warn at (absences)');
    await user.clear(warn);
    await user.type(warn, '25');
    await user.click(within(card).getByRole('button', { name: 'Save default' }));
    expect(within(card).getByRole('alert')).toHaveTextContent(/cannot be more than the total sessions/);
  });
});
