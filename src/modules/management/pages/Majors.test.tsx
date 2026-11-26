import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MajorsPage from './Majors';

const getMajors = vi.fn();
const bulkRemove = vi.fn();

vi.mock('../services/major.service', () => ({
  majorService: {
    getMajors: (...args: unknown[]) => getMajors(...args),
    bulkRemove: (...args: unknown[]) => bulkRemove(...args),
    deleteMajor: vi.fn(),
    createMajor: vi.fn(),
    updateMajor: vi.fn(),
    getMajorById: vi.fn(),
  },
}));

const ALL_MAJORS = [
  { id: 'm1', code: 'SE', name: 'Software Engineering', cohort: 'K18', status: 'ACTIVE', totalCredits: 144, durationYears: 3.5 },
  { id: 'm2', code: 'AI', name: 'Artificial Intelligence', cohort: 'K19', status: 'DRAFT', totalCredits: 144, durationYears: 3.5 },
];

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MajorsPage />
    </QueryClientProvider>,
  );
}

describe('MajorsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMajors.mockImplementation(async (params?: { cohort?: string; status?: string; search?: string }) => {
      let items = ALL_MAJORS;
      if (params?.cohort && params.cohort !== 'ALL') {
        items = items.filter((m) => m.cohort === params.cohort);
      }
      if (params?.status && params.status !== 'ALL') {
        items = items.filter((m) => m.status === params.status);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        items = items.filter((m) => m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
      }
      return { items, page: 0, size: 20, totalItems: items.length, totalPages: 1 };
    });
  });

  it('keeps all cohort options available after filtering by one cohort', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Software Engineering')).toBeInTheDocument();
    const cohortSelect = screen.getByLabelText('Filter by cohort') as HTMLSelectElement;

    await user.selectOptions(cohortSelect, 'K18');
    await waitFor(() => expect(screen.queryByText('Artificial Intelligence')).not.toBeInTheDocument());

    const optionValues = Array.from(cohortSelect.options).map((o) => o.value);
    expect(optionValues).toEqual(['ALL', 'K18', 'K19']);
  });

  it('clears row selection when filters change so hidden rows cannot be bulk-deleted', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Software Engineering')).toBeInTheDocument();
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);
    expect(screen.getByText('1 selected')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Filter by status'), 'DRAFT');
    await waitFor(() => expect(screen.queryByText('1 selected')).not.toBeInTheDocument());
  });

  it('filters by status when clicking stat tiles and resets via Reset button', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Software Engineering')).toBeInTheDocument();
    await user.click(screen.getByText('Draft on page'));

    await waitFor(() => {
      expect(screen.queryByText('Software Engineering')).not.toBeInTheDocument();
      expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Reset/i }));
    expect(await screen.findByText('Software Engineering')).toBeInTheDocument();
  });
});
