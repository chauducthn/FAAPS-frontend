import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CoursesPage from './Courses';

const listCourses = vi.fn();
const listCategories = vi.fn();

// `sonner` renders into a <Toaster/> that the page does not mount, so the
// toast calls are captured here and asserted directly.
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
    },
  ),
}));

vi.mock('../services/course.service', () => ({
  courseService: {
    list: (...args: unknown[]) => listCourses(...args),
    listCategories: (...args: unknown[]) => listCategories(...args),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    bulkRemove: vi.fn(),
    previewImport: vi.fn(),
    confirmImport: vi.fn(),
    downloadImportErrors: vi.fn(),
    listRelations: vi.fn(),
    addRelation: vi.fn(),
    updateRelation: vi.fn(),
    removeRelation: vi.fn(),
  },
}));

const COURSES = [
  {
    id: 'c1',
    code: 'SE101',
    name: 'Introduction to Programming',
    credits: 3,
    categoryId: 'cat1',
    categoryCode: 'SE',
    categoryName: 'Software Engineering',
    status: 'ACTIVE',
    prerequisiteCount: 0,
    usedInCurriculumCount: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c2',
    code: 'SE102',
    name: 'Data Structures and Algorithms',
    credits: 4,
    categoryId: 'cat1',
    categoryCode: 'SE',
    categoryName: 'Software Engineering',
    status: 'INACTIVE',
    prerequisiteCount: 1,
    usedInCurriculumCount: 2,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
];

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <CoursesPage />
    </QueryClientProvider>,
  );
}

describe('Courses', () => {
  beforeEach(() => {
    listCourses.mockResolvedValue({
      items: COURSES,
      page: 0,
      pageSize: 10,
      totalItems: 2,
      totalPages: 1,
    });
    listCategories.mockResolvedValue([
      { id: 'cat1', code: 'SE', name: 'Software Engineering' },
    ]);
  });

  it('renders the courses in the DataTable with the configured columns', async () => {
    renderPage();

    expect(await screen.findByText('SE101')).toBeInTheDocument();
    expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
    expect(screen.getByText('SE102')).toBeInTheDocument();

    expect(screen.getByRole('columnheader', { name: /^Code$/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Course Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Credits/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Actions/i })).toBeInTheDocument();
  });

  it('shows the status of every course', async () => {
    renderPage();

    await screen.findByText('SE101');
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('offers the status, category and credits filters', async () => {
    renderPage();

    expect(await screen.findByLabelText('Filter by status')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by credits')).toBeInTheDocument();
  });

  it('filters the catalogue by credits', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('SE101');

    await user.selectOptions(screen.getByLabelText('Filter by credits'), '4');

    // Only the 4-credit course survives the filter.
    await waitFor(() => expect(screen.queryByText('SE101')).not.toBeInTheDocument());
    expect(screen.getByText('SE102')).toBeInTheDocument();
  });

  it('sends the selected credits and status to the API', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('SE101');

    await user.selectOptions(screen.getByLabelText('Filter by credits'), '3');
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'ACTIVE');

    await waitFor(() => {
      const call = listCourses.mock.calls.at(-1)?.[0];
      expect(call).toMatchObject({ credits: 3, status: 'ACTIVE', page: 0 });
    });
  });

  it('queries the API with the selected category', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('SE101');

    await user.selectOptions(await screen.findByLabelText('Filter by category'), 'cat1');

    await waitFor(() => {
      const call = listCourses.mock.calls.at(-1)?.[0];
      expect(call).toMatchObject({ categoryId: 'cat1', page: 0 });
    });
  });

  it('clears every filter with the clear button', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('SE101');
    await user.selectOptions(screen.getByLabelText('Filter by credits'), '4');

    await waitFor(() => expect(screen.queryByText('SE101')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /Clear filters/i }));

    expect(await screen.findByText('SE101')).toBeInTheDocument();
  });

  it('searches through the API instead of filtering client-side', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('SE101');

    await user.type(screen.getByRole('searchbox'), 'programming');

    await waitFor(
      () => {
        const call = listCourses.mock.calls.at(-1)?.[0];
        expect(call).toMatchObject({ search: 'programming' });
      },
      { timeout: 2000 },
    );
  });

  it('sorts by the requested column', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('SE101');

    const header = screen.getByRole('columnheader', { name: /^Code$/i });
    await user.click(header.querySelector('button') as HTMLButtonElement);

    await waitFor(() => {
      const call = listCourses.mock.calls.at(-1)?.[0];
      expect(call).toMatchObject({ sort: 'code,asc' });
    });
  });

  it('reveals the bulk delete action when a row is selected', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('SE101');

    expect(screen.queryByText(/row(s)? selected/)).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Select row 1'));

    expect(screen.getByText('1 row selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete selected/i })).toBeInTheDocument();
  });

  it('opens the delete confirmation from the row action menu', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('SE101');

    await user.click(screen.getByRole('button', { name: 'Actions for SE101' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete course' }));

    expect(await screen.findByText('Delete course?')).toBeInTheDocument();
    expect(screen.getByText(/Delete SE101 - Introduction to Programming/)).toBeInTheDocument();
  });

  it('refuses to delete a course that is still used in a curriculum', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('SE102');

    await user.click(screen.getByRole('button', { name: 'Actions for SE102' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete course' }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'SE102 is used in 2 curriculums. Remove it from them first.',
      ),
    );
    // The confirmation dialog is never opened.
    expect(screen.queryByText('Delete course?')).not.toBeInTheDocument();
  });
});
