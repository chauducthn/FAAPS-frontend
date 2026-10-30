import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import CompleteRegistration from './CompleteRegistration';
import { useAuth } from '../stores/useAuth';

const profile = vi.fn();
const curriculums = vi.fn();
const complete = vi.fn();

vi.mock('@/modules/academic/services/studentAcademicService', () => ({
  studentAcademicService: { profile: () => profile() },
}));
vi.mock('../services/onboardingService', () => ({
  onboardingService: { curriculums: () => curriculums(), complete: (b: unknown) => complete(b) },
}));

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/register/complete']}>
        <Routes>
          <Route path="/register/complete" element={<CompleteRegistration />} />
          <Route path="/student" element={<p>Student portal</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CompleteRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.getState().setUser({ id: 'u1', email: 'new@fpt.edu.vn', fullName: 'New Student', role: 'STUDENT', status: 'ACTIVE' });
    profile.mockResolvedValue({ studentCode: null });
    curriculums.mockResolvedValue([
      { id: 'c1', version: 'K19', name: 'SE K19', majorCode: 'SE', majorName: 'Software Engineering' },
      { id: 'c2', version: 'K18', name: 'AI K18', majorCode: 'AI', majorName: 'Artificial Intelligence' },
    ]);
  });

  it('shows the Google account and asks for the Student ID and curriculum', async () => {
    renderPage();
    expect(await screen.findByText('New Student')).toBeInTheDocument();
    expect(screen.getByText('new@fpt.edu.vn')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /complete registration/i }));
    expect(await screen.findByText(/two letters and six digits/i)).toBeInTheDocument();
    expect(screen.getByText('Select your curriculum')).toBeInTheDocument();
    expect(complete).not.toHaveBeenCalled();
  });

  it('submits the upper-cased Student ID with the chosen curriculum and opens the portal', async () => {
    complete.mockResolvedValue({ studentCode: 'SE190001' });
    renderPage();
    await screen.findByText('New Student');

    await userEvent.type(screen.getByLabelText(/student id/i), 'se190001');
    await userEvent.selectOptions(screen.getByLabelText('Day of birth'), '14');
    await userEvent.selectOptions(screen.getByLabelText('Month of birth'), '03');
    await userEvent.selectOptions(screen.getByLabelText('Year of birth'), '2005');
    await userEvent.selectOptions(await screen.findByLabelText(/curriculum/i), 'c1');
    await userEvent.click(screen.getByRole('button', { name: /complete registration/i }));

    await waitFor(() => expect(complete).toHaveBeenCalledWith({ studentCode: 'SE190001', curriculumVersionId: 'c1', dateOfBirth: '2005-03-14', phone: undefined }));
    expect(await screen.findByText('Student portal')).toBeInTheDocument();
  });

  it('shows the backend message inside the form when the Student ID is taken', async () => {
    complete.mockRejectedValue(Object.assign(new Error('x'), {
      isAxiosError: true,
      response: { status: 409, data: { message: 'This Student ID is already registered' } },
    }));
    renderPage();
    await screen.findByText('New Student');

    await userEvent.type(screen.getByLabelText(/student id/i), 'SE190001');
    await userEvent.selectOptions(screen.getByLabelText('Day of birth'), '14');
    await userEvent.selectOptions(screen.getByLabelText('Month of birth'), '03');
    await userEvent.selectOptions(screen.getByLabelText('Year of birth'), '2005');
    await userEvent.selectOptions(await screen.findByLabelText(/curriculum/i), 'c2');
    await userEvent.click(screen.getByRole('button', { name: /complete registration/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('This Student ID is already registered');
  });

  it('skips the form when the student is already registered', async () => {
    profile.mockResolvedValue({ studentCode: 'SE170001' });
    renderPage();
    expect(await screen.findByText('Student portal')).toBeInTheDocument();
  });
});
