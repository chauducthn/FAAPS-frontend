import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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

describe('UserAccounts modals', () => {
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

  describe('password reset', () => {
    /** A list with one password account and one Google-only account. */
    const twoUsers = () =>
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
            userId: 'SE173099',
            fullName: 'Le Van B',
            email: 'b@fpt.edu.vn',
            role: 'STUDENT',
            status: 'ACTIVE',
            hasPassword: false,
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
      });

    it('disables the checkbox of a Google-only account', async () => {
      twoUsers();
      renderPage();
      await screen.findByText('Le Van B');

      expect(screen.getByLabelText('Select row 1')).not.toBeDisabled();
      expect(screen.getByLabelText('Select row 2')).toBeDisabled();
    });

    it('lists the accounts in the confirmation and gates the reset on the checkbox', async () => {
      const user = userEvent.setup();
      twoUsers();
      renderPage();
      await screen.findByText('Le Van B');

      await user.click(screen.getByLabelText('Select row 1'));
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      // The confirmation names the account that is about to be reset.
      const dialog = await screen.findByRole('dialog', { name: /reset this password/i });
      expect(within(dialog).getByText('a@fpt.edu.vn')).toBeInTheDocument();
      expect(within(dialog).getByText('Nguyen Van A')).toBeInTheDocument();

      const confirm = within(dialog).getByRole('button', { name: /^reset password$/i });
      expect(confirm).toBeDisabled();

      await user.click(within(dialog).getByRole('checkbox', { name: /Tôi hiểu password chỉ hiện 1 lần/i }));
      expect(confirm).toBeEnabled();
    });

    it('shows the issued passwords in the result modal', async () => {
      const user = userEvent.setup();
      twoUsers();
      resetUserPassword.mockResolvedValue({
        resetResults: [
          {
            userId: 'SE173012',
            email: 'a@fpt.edu.vn',
            status: 'SUCCESS',
            newPassword: 'Aa1!zzzz',
          },
        ],
      });
      renderPage();
      await screen.findByText('Le Van B');

      await user.click(screen.getByLabelText('Select row 1'));
      await user.click(screen.getByRole('button', { name: /reset password/i }));
      const confirm = within(await screen.findByRole('dialog', { name: /reset this password/i })).getByRole(
        'button',
        { name: /^reset password$/i },
      );
      await user.click(within(screen.getByRole('dialog')).getByRole('checkbox', { name: /Tôi hiểu/i }));
      await user.click(confirm);

      // The result dialog opens with the warning and the new password.
      const result = await screen.findByRole('dialog', { name: /password reset results/i });
      expect(within(result).getByText('Lưu ngay kẻo mất')).toBeInTheDocument();
      expect(resetUserPassword).toHaveBeenCalledWith('u1');

      await user.click(within(result).getByRole('button', { name: /show/i }));
      expect(within(result).getByText('Aa1!zzzz')).toBeInTheDocument();
    });

    it('does not close the result modal when the backdrop is clicked', async () => {
      const user = userEvent.setup();
      twoUsers();
      resetUserPassword.mockResolvedValue({
        resetResults: [
          { userId: 'SE173012', email: 'a@fpt.edu.vn', status: 'SUCCESS', newPassword: 'Aa1!zzzz' },
        ],
      });
      renderPage();
      await screen.findByText('Le Van B');

      await user.click(screen.getByLabelText('Select row 1'));
      await user.click(screen.getByRole('button', { name: /reset password/i }));
      const confirm = within(await screen.findByRole('dialog', { name: /reset this password/i })).getByRole(
        'button',
        { name: /^reset password$/i },
      );
      await user.click(within(screen.getByRole('dialog')).getByRole('checkbox', { name: /Tôi hiểu/i }));
      await user.click(confirm);

      const result = await screen.findByRole('dialog', { name: /password reset results/i });
      expect(within(result).getByText('Lưu ngay kẻo mất')).toBeInTheDocument();

      // The backdrop is the dim layer behind the dialog.
      const backdrop = document.querySelector('div.fixed.inset-0 > div.absolute');
      expect(backdrop).not.toBeNull();
      await user.click(backdrop!);

      expect(
        within(screen.getByRole('dialog', { name: /password reset results/i })).getByText('Lưu ngay kẻo mất'),
      ).toBeInTheDocument();
    });
  });

  describe('create user modal', () => {
    it('keeps the form free of helper paragraphs and validates required fields', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Nguyen Van A');

      await user.click(screen.getByRole('button', { name: /create user/i }));

      // The guidance paragraphs are gone: only the label and the placeholder carry the format.
      expect(screen.queryByText(/No password is set/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/The identity of the person/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Must be an @fpt\.edu\.vn address/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Optional\. A Vietnamese mobile number/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Two letters for the major/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/The major and cohort the student follows/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Suggested from the enrollment semester/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/From 1 to 9/i)).not.toBeInTheDocument();

      await user.click(screen.getAllByRole('button', { name: /^create user$/i }).at(-1)!);
      expect(await screen.findByText('Full name is required')).toBeInTheDocument();
      expect(createUser).not.toHaveBeenCalled();
    });

    it('rejects a phone number that is not a Vietnamese mobile number', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Nguyen Van A');

      await user.click(screen.getByRole('button', { name: /create user/i }));
      await user.type(await screen.findByLabelText('Phone'), '12345');
      await user.click(screen.getAllByRole('button', { name: /^create user$/i }).at(-1)!);

      expect(
        await screen.findByText(
          'Please enter a valid phone number (10 digits, starting with 03, 05, 07, 08, or 09).',
        ),
      ).toBeInTheDocument();
      expect(createUser).not.toHaveBeenCalled();
    });

    it('blocks the submit when the email does not fit the role', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Nguyen Van A');

      await user.click(screen.getByRole('button', { name: /create user/i }));
      await user.click(await screen.findByText('Advisor', { selector: 'label' }));
      await user.type(screen.getByLabelText('Email'), 'advisor@fpt.edu.vn');

      expect(await screen.findByText(/Advisor accounts must use an @fe\.edu\.vn/)).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /^create user$/i }).at(-1)!).toBeDisabled();
    });

    it('shows the student fields and hides the advisor ones', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Nguyen Van A');

      await user.click(screen.getByRole('button', { name: /create user/i }));

      expect(await screen.findByLabelText('Student ID')).toBeInTheDocument();
      expect(screen.getByLabelText('Curriculum')).toBeInTheDocument();
      expect(screen.getByLabelText('Enrollment semester')).toBeInTheDocument();
      expect(screen.getByLabelText('Current semester')).toBeInTheDocument();
      expect(screen.getByLabelText('Expected graduation semester')).toBeInTheDocument();
      expect(screen.queryByLabelText('Max advisees')).not.toBeInTheDocument();

      await user.click(await screen.findByText('Advisor', { selector: 'label' }));

      await waitFor(() => {
        expect(screen.queryByLabelText('Student ID')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Curriculum')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Current semester')).not.toBeInTheDocument();
      });
      expect(screen.getByLabelText('Max advisees')).toBeInTheDocument();
    });

    it('fills the major, cohort and curriculum from the Student ID', async () => {
      const user = userEvent.setup();
      semesters.items = [
        { id: 'sem-fa2023', code: 'FA2023', startDate: '2023-09-04' },
        { id: 'sem-sp2024', code: 'SP2024', startDate: '2024-01-08' },
        { id: 'sem-fa2024', code: 'FA2024', startDate: '2024-09-02' },
        { id: 'sem-sp2025', code: 'SP2025', startDate: '2025-01-06' },
        { id: 'sem-fa2025', code: 'FA2025', startDate: '2025-09-01' },
        { id: 'sem-sp2026', code: 'SP2026', startDate: '2026-01-05' },
        { id: 'sem-fa2026', code: 'FA2026', startDate: '2026-08-31' },
        { id: 'sem-sp2027', code: 'SP2027', startDate: '2027-01-04' },
        { id: 'sem-fa2027', code: 'FA2027', startDate: '2027-09-06' },
      ];
      curriculums.items = [
        {
          id: 'cv-se-k17',
          majorCode: 'SE',
          version: 'K17',
          name: 'Software Engineering K17',
          effectiveFromSemesterId: 'sem-fa2023',
        },
      ];
      renderPage();
      await screen.findByText('Nguyen Van A');

      await user.click(screen.getByRole('button', { name: /create user/i }));
      await user.type(await screen.findByLabelText('Student ID'), 'SE173012');

      await waitFor(() => {
        expect(screen.getByLabelText('Curriculum')).toHaveValue('cv-se-k17');
        expect(screen.getByLabelText('Enrollment semester')).toHaveValue('sem-fa2023');
        expect(screen.getByLabelText('Expected graduation semester')).toHaveValue('sem-fa2027');
      });
      expect(screen.getByText(/Major Software Engineering/)).toBeInTheDocument();
      expect(screen.getByText(/Cohort K17/)).toBeInTheDocument();
    });

    it.each(['SE17', 'SE990001', 'SE000001'])('rejects the Student ID %s (format and cohort 01 to 22)', async (code) => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Nguyen Van A');

      await user.click(screen.getByRole('button', { name: /create user/i }));
      await user.type(await screen.findByLabelText('Student ID'), code);
      await user.click(screen.getAllByRole('button', { name: /^create user$/i }).at(-1)!);

      expect(await screen.findByText(/Enter a valid Student ID/)).toBeInTheDocument();
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
      await user.type(screen.getByLabelText('Email'), 'advisor@fe.edu.vn');
      await user.type(screen.getByLabelText('Max advisees'), '12');
      await user.click(screen.getAllByRole('button', { name: /^create user$/i }).at(-1)!);

      await waitFor(() =>
        expect(createUser).toHaveBeenCalledWith(
          expect.objectContaining({
            role: 'ADVISOR',
            fullName: 'Tran Advisor',
            email: 'advisor@fe.edu.vn',
            maxAdvisees: 12,
          }),
        ),
      );
      expect(createUser.mock.calls[0][0]).not.toHaveProperty('advisorCode');
    });
  });
});
