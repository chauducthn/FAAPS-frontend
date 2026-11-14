import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MajorCurriculumCard } from './MajorCurriculumCard';
import type { StudentProfile } from '../../advising/types/advising';

const changeCurriculum = vi.fn();
const curriculums = vi.fn();

vi.mock('@/modules/academic/services/studentAcademicService', () => ({
  studentAcademicService: { changeCurriculum: (id: string) => changeCurriculum(id), profile: vi.fn() },
}));
vi.mock('@/modules/auth/services/onboardingService', () => ({
  onboardingService: { curriculums: () => curriculums() },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const profileWith = (curriculumVersionId: string | null) =>
  ({ studentCode: 'SE190001', curriculumVersionId }) as StudentProfile;

function renderCard(profile: StudentProfile) {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MajorCurriculumCard profile={profile} />
    </QueryClientProvider>,
  );
}

const waitForOptions = () => screen.findByRole('option', { name: /AI K19/ });

describe('MajorCurriculumCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    curriculums.mockResolvedValue([
      { id: 'c-ai19', version: 'K19', name: 'AI K19', majorCode: 'AI', majorName: 'Artificial Intelligence' },
      { id: 'c-se19', version: 'K19', name: 'SE K19', majorCode: 'SE', majorName: 'Software Engineering' },
      { id: 'c-se18', version: 'K18', name: 'SE K18', majorCode: 'SE', majorName: 'Software Engineering' },
    ]);
  });

  it('offers every curriculum and selects nothing for a student who has not chosen yet', async () => {
    renderCard(profileWith(null));
    await waitForOptions();

    const select = screen.getByLabelText(/major \/ curriculum/i) as HTMLSelectElement;
    // The Student ID is SE..., yet the AI curriculum is still offered, and nothing is picked for the student.
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['', 'c-ai19', 'c-se19', 'c-se18']);
    expect(select).toHaveValue('');
    expect(screen.getByRole('note')).toHaveTextContent(/have not chosen your major yet/i);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('saves the chosen curriculum', async () => {
    changeCurriculum.mockResolvedValue({});
    const user = userEvent.setup();
    renderCard(profileWith(null));
    await waitForOptions();

    await user.selectOptions(screen.getByLabelText(/major \/ curriculum/i), 'c-ai19');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(changeCurriculum).toHaveBeenCalledWith('c-ai19'));
  });

  it('shows the current choice and lets the student change it', async () => {
    changeCurriculum.mockResolvedValue({});
    const user = userEvent.setup();
    renderCard(profileWith('c-se19'));
    await waitForOptions();

    const select = screen.getByLabelText(/major \/ curriculum/i);
    await waitFor(() => expect(select).toHaveValue('c-se19'));
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();

    await user.selectOptions(select, 'c-se18');
    await user.click(screen.getByRole('button', { name: 'Update' }));
    await waitFor(() => expect(changeCurriculum).toHaveBeenCalledWith('c-se18'));
  });

  it('shows the backend reason when the change is refused', async () => {
    changeCurriculum.mockRejectedValue(
      Object.assign(new Error('x'), {
        isAxiosError: true,
        response: { status: 409, data: { message: 'Your transcript already has grades, so the curriculum can only be changed by the Academic Office' } },
      }),
    );
    const user = userEvent.setup();
    renderCard(profileWith('c-se19'));
    await waitForOptions();

    await user.selectOptions(screen.getByLabelText(/major \/ curriculum/i), 'c-ai19');
    await user.click(screen.getByRole('button', { name: 'Update' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/only be changed by the Academic Office/);
  });

  it.each([
    [409, /only the Academic Office can change your curriculum/],
    [404, /no longer available/],
  ])('explains a %s refusal that comes without a message', async (status, text) => {
    changeCurriculum.mockRejectedValue(
      Object.assign(new Error('x'), {
        isAxiosError: true,
        response: { status, data: { status, error: status === 404 ? 'Not Found' : 'Conflict', path: '/api/student/profile/curriculum' } },
      }),
    );
    const user = userEvent.setup();
    renderCard(profileWith('c-se19'));
    await waitForOptions();

    await user.selectOptions(screen.getByLabelText(/major \/ curriculum/i), 'c-ai19');
    await user.click(screen.getByRole('button', { name: 'Update' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(text);
  });
});
