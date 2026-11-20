import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import Attendance from './Attendance';
import { attendanceResult, maxAbsentSessions, type AttendanceImportPreview, type AttendanceRule, type CourseAttendanceOverride } from '../types/attendance';

// A stand-in for the backend, so the page can be driven end to end.
const api = vi.hoisted(() => ({
  defaultRule: { totalSessions: 20, minAttendancePercent: 80, warnAbsentSessions: 3 } as AttendanceRule,
  overrides: new Map<string, CourseAttendanceOverride>(),
  history: [] as { id: string; fileName: string; rowCount: number; warningCount: number; failCount: number; confirmedAt: string }[],
  nextPreview: null as AttendanceImportPreview | null,
  previewError: null as Error | null,
}));
vi.mock('../services/attendance.service', async (importActual) => {
  const actual = await importActual<typeof import('../services/attendance.service')>();
  const names: Record<string, [string, string]> = { c1: ['PRF192', 'Programming Fundamentals'], c2: ['SWP391', 'Software Project'] };
  return {
    ...actual,
    attendanceService: {
      getDefaultRule: async () => ({ ...api.defaultRule }),
      saveDefaultRule: async (rule: AttendanceRule) => (api.defaultRule = { ...rule }),
      listOverrides: async () => [...api.overrides.values()],
      saveOverride: async (courseId: string, rule: AttendanceRule) => {
        const [courseCode, courseName] = names[courseId];
        const saved = { ...rule, courseId, courseCode, courseName, updatedAt: '' };
        api.overrides.set(courseId, saved);
        return saved;
      },
      removeOverride: async (courseId: string) => void api.overrides.delete(courseId),
      previewImport: async () => {
        if (api.previewError) throw api.previewError;
        return api.nextPreview as AttendanceImportPreview;
      },
      confirmImport: async (id: string) => {
        const p = api.nextPreview as AttendanceImportPreview;
        const valid = p.rows.filter((r) => !r.error);
        const item = { id, fileName: p.fileName, rowCount: valid.length, warningCount: valid.filter((r) => r.result === 'WARNING').length,
          failCount: valid.filter((r) => r.result === 'FAIL').length, confirmedAt: '2026-11-20T00:00:00Z' };
        api.history.unshift(item);
        return item;
      },
      listImports: async () => [...api.history],
    },
  };
});

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

const previewRow = (lineNumber: number, studentCode: string, absentSessions: number, result: 'OK' | 'WARNING' | 'FAIL' | null, error: string | null = null) =>
  ({ lineNumber, studentCode, semesterCode: 'FA25', courseCode: 'PRF192', totalSessions: 20, absentSessions, error, result });

beforeEach(() => {
  api.defaultRule = { totalSessions: 20, minAttendancePercent: 80, warnAbsentSessions: 3 };
  api.overrides.clear();
  api.history.length = 0;
  api.nextPreview = null;
  api.previewError = null;
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
});

describe('Attendance page', () => {
  it('previews an upload, then imports the valid rows into the history', async () => {
    const user = userEvent.setup();
    renderAt();
    expect(screen.getByRole('tab', { name: 'Import' })).toHaveAttribute('aria-selected', 'true');

    api.nextPreview = {
      importId: 'imp-1',
      fileName: 'attendance.csv',
      rows: [previewRow(2, 'SE1', 1, 'OK'), previewRow(3, 'SE2', 3, 'WARNING'), previewRow(4, 'SE3', 9, 'FAIL'), previewRow(5, 'SE4', 1, null, 'Student not found')],
      validRows: 3,
      errorRows: 1,
    };
    await user.upload(screen.getByLabelText('Upload attendance file'), new File(['x'], 'attendance.csv'));

    expect(await screen.findByText('Valid: 3')).toBeInTheDocument();
    expect(screen.getByText('Errors: 1')).toBeInTheDocument();
    expect(screen.getByText('Warning: 1')).toBeInTheDocument();
    expect(screen.getByText('Attendance fail: 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Import 3 valid rows' }));
    const history = screen.getByRole('region', { name: 'Import history' });
    expect(await within(history).findByText('attendance.csv')).toBeInTheDocument();
  });

  it('shows why the server refused the file', async () => {
    const user = userEvent.setup();
    api.previewError = new Error('The file must start with the columns: Student ID, Semester, Course code, Total sessions, Absent sessions.');
    renderAt();
    await user.upload(screen.getByLabelText('Upload attendance file'), new File(['x'], 'attendance.xlsx'));
    expect(await screen.findByRole('alert')).toHaveTextContent(/must start with the columns/);
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
