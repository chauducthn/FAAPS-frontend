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

vi.mock('../../academic/hooks/queries/useCurriculumsQuery', () => ({
  useCurriculumsQuery: () => ({ data: { items: [] } }),
  useSemesterOptions: () => ({ data: [], isLoading: false }),
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

  it('resolves the cohort filter to the major of that cohort', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Nguyen Van A');

    await user.selectOptions(await screen.findByLabelText('Filter by cohort'), 'c1');

    await waitFor(() => {
      const call = listUsers.mock.calls.at(-1)?.[0];
      expect(call).toMatchObject({ majorId: 'm1' });
    });
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
      expect(screen.getByText('Use the format SE173012 or IA173012')).toBeInTheDocument();
      expect(createUser).not.toHaveBeenCalled();
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
