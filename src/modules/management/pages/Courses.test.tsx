import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CoursesPage from './Courses';
import { buildXlsx } from '../../learning/utils/studyPlanXlsx';

const listCourses = vi.fn();
const listCategories = vi.fn();
const createCourse = vi.fn();
const updateCourse = vi.fn();
const previewImport = vi.fn();

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
      warning: vi.fn(),
    },
  ),
}));

vi.mock('../services/course.service', () => ({
  courseService: {
    list: (...args: unknown[]) => listCourses(...args),
    listCategories: (...args: unknown[]) => listCategories(...args),
    getById: vi.fn(),
    create: (...args: unknown[]) => createCourse(...args),
    update: (...args: unknown[]) => updateCourse(...args),
    remove: vi.fn(),
    bulkRemove: vi.fn(),
    previewImport: (...args: unknown[]) => previewImport(...args),
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
    credits: 10,
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
    // Filters by credits like the backend does.
    listCourses.mockImplementation(async (params?: { credits?: number }) => {
      const items = COURSES.filter((c) => params?.credits === undefined || c.credits === params.credits);
      return { items, page: 0, pageSize: 10, totalItems: items.length, totalPages: 1 };
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

    await user.selectOptions(screen.getByLabelText('Filter by credits'), '10');

    // Only the 10-credit course survives the filter.
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
    await user.selectOptions(screen.getByLabelText('Filter by credits'), '10');

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
  it('shows the category in its own column', async () => {
    renderPage();
    await screen.findByText('SE101');
    expect(screen.getByRole('columnheader', { name: /Category/i })).toBeInTheDocument();
    expect(screen.getAllByText('SE').length).toBeGreaterThanOrEqual(2);
  });

  it('sets the selected courses inactive, skipping ones that already are', async () => {
    const user = userEvent.setup();
    updateCourse.mockResolvedValue({});
    renderPage();
    await screen.findByText('SE101');

    await user.click(screen.getByLabelText('Select row 1'));
    await user.click(screen.getByLabelText('Select row 2'));
    await user.click(screen.getByRole('button', { name: /Set inactive/i }));
    const confirm = (await screen.findByText('Set selected courses inactive?')).closest('[role="dialog"]') as HTMLElement;
    await user.click(within(confirm).getByRole('button', { name: 'Set inactive' }));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith('1 course set to inactive'));
    expect(updateCourse).toHaveBeenCalledTimes(1);
    expect(updateCourse).toHaveBeenCalledWith('c1', { status: 'INACTIVE' });
  });

  it('does not upload an import file with credits outside 0/2/3/10', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('SE101');

    const file = new File(
      [buildXlsx([['Course code', 'Course name', 'Credits', 'Category'], ['ABC101', 'Big course', 5, 'SE']])],
      'courses.xlsx',
    );
    await user.upload(screen.getByLabelText('Import courses from Excel'), file);

    expect(await screen.findByText('The file was not uploaded')).toBeInTheDocument();
    expect(screen.getByText('Credits must be 0, 2, 3 or 10 (found 5).')).toBeInTheDocument();
    expect(previewImport).not.toHaveBeenCalled();
  });

  it('marks rows with other credit values as errors in the server preview', async () => {
    const user = userEvent.setup();
    previewImport.mockResolvedValue({
      totalRows: 1, validRows: 1, errorRows: 0,
      items: [{ rowNumber: 1, code: 'OLD101', name: 'Old', credits: 6, categoryId: 'cat1', categoryName: 'SE', description: '',
        prerequisites: '', objectives: '', learningOutcomes: '', status: 'VALID', errors: [] }],
    });
    renderPage();
    await screen.findByText('SE101');

    await user.upload(screen.getByLabelText('Import courses from Excel'), new File(['x'], 'old.xls'));

    expect(await screen.findByText('Credits must be 0, 2, 3 or 10')).toBeInTheDocument();
  });

  it('creates a course with status, material link and prerequisites, without syllabus fields', async () => {
    const user = userEvent.setup();
    createCourse.mockResolvedValue({ ...COURSES[0], id: 'new', code: 'ABC101', name: 'New course' });
    renderPage();
    await screen.findByText('SE101');

    await user.click(screen.getByRole('button', { name: /Create Course/i }));
    const dialog = await screen.findByRole('dialog', { name: 'Create course' });
    expect(screen.queryByLabelText('Description')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Objectives')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Course code'), 'ABC101');
    await user.type(screen.getByLabelText('Course name'), 'New course');
    // Credits start empty and are picked from the list.
    expect((within(dialog).getByLabelText('Credits') as HTMLSelectElement).value).toBe('');
    expect(within(dialog).getAllByRole('option').map((o) => o.textContent)).toEqual(expect.arrayContaining(['0', '2', '3', '10']));
    await user.selectOptions(within(dialog).getByLabelText('Credits'), '3');
    await user.selectOptions(screen.getByLabelText('Category'), 'cat1');
    await user.click(within(dialog).getByText('○ Inactive'));

    await user.type(screen.getByLabelText('Search prerequisite course'), 'SE1');
    await user.click(await screen.findByRole('option', { name: /SE101/ }));
    expect(screen.getByRole('list', { name: 'Selected prerequisites' })).toHaveTextContent('SE101');

    await user.type(screen.getByLabelText('Material link'), 'not a link');
    expect(await screen.findByText(/full link starting with http/)).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Material link'));
    await user.type(screen.getByLabelText('Material link'), 'https://drive.google.com/abc');

    await user.click(screen.getByRole('button', { name: 'Create course' }));

    await waitFor(() => expect(createCourse).toHaveBeenCalled());
    const body = createCourse.mock.calls[0][0];
    expect(body).toEqual({
      code: 'ABC101', name: 'New course', credits: 3, categoryId: 'cat1', status: 'INACTIVE',
      materialLink: 'https://drive.google.com/abc',
      prerequisites: [{ prerequisiteCourseId: 'c1', groupNo: 1, type: 'PREREQUISITE' }],
    });
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  });
  it('asks for credits when none is picked', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('SE101');

    await user.click(screen.getByRole('button', { name: /Create Course/i }));
    const dialog = await screen.findByRole('dialog', { name: 'Create course' });
    await user.type(screen.getByLabelText('Course code'), 'ABC101');
    await user.type(screen.getByLabelText('Course name'), 'New course');
    await user.selectOptions(screen.getByLabelText('Category'), 'cat1');
    await user.click(within(dialog).getByLabelText('Credits'));
    await user.tab();

    expect(await within(dialog).findByText('Select the number of credits')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Create course' })).toBeDisabled();
    expect(createCourse).not.toHaveBeenCalled();
  });
});
