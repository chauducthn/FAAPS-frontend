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

async function fillBirthDate() {
  await userEvent.selectOptions(screen.getByLabelText('Day of birth'), '14');
  await userEvent.selectOptions(screen.getByLabelText('Month of birth'), '03');
  await userEvent.selectOptions(screen.getByLabelText('Year of birth'), String(new Date().getFullYear() - 20));
}

const optionValues = () =>
  Array.from(screen.getByLabelText(/major \/ curriculum/i).querySelectorAll('option')).map((o) => o.getAttribute('value'));

describe('CompleteRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    useAuth.getState().setUser({ id: 'u1', email: 'new@fpt.edu.vn', fullName: 'New Student', role: 'STUDENT', status: 'ACTIVE' });
    profile.mockResolvedValue({ studentCode: null, phone: null, dateOfBirth: null });
    curriculums.mockResolvedValue([
      { id: 'c1', version: 'K19', name: 'SE K19', majorCode: 'SE', majorName: 'Software Engineering' },
      { id: 'c2', version: 'K18', name: 'AI K18', majorCode: 'AI', majorName: 'Artificial Intelligence' },
    ]);
  });

  it('shows the signed-in account and asks for the Student ID and curriculum', async () => {
    renderPage();
    expect(await screen.findByText('New Student')).toBeInTheDocument();
    expect(screen.getByText('new@fpt.edu.vn')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /complete registration/i }));
    expect(await screen.findByText(/cohort from 01 to 22/i)).toBeInTheDocument();
    expect(screen.getByText('Select your curriculum')).toBeInTheDocument();
    expect(screen.getByText('Enter your phone number')).toBeInTheDocument();
    expect(complete).not.toHaveBeenCalled();
  });

  it('only offers the curriculums of the major in the Student ID and picks the matching cohort', async () => {
    renderPage();
    await screen.findByText('New Student');

    await userEvent.type(screen.getByLabelText(/student id/i), 'se190001');
    await waitFor(() => expect(optionValues()).toEqual(['', 'c1']));
    await waitFor(() => expect(screen.getByLabelText(/major \/ curriculum/i)).toHaveValue('c1'));

    await userEvent.clear(screen.getByLabelText(/student id/i));
    await userEvent.type(screen.getByLabelText(/student id/i), 'AI180001');
    await waitFor(() => expect(optionValues()).toEqual(['', 'c2']));
    await waitFor(() => expect(screen.getByLabelText(/major \/ curriculum/i)).toHaveValue('c2'));
  });

  it('shows every curriculum when no major matches the Student ID prefix', async () => {
    renderPage();
    await screen.findByText('New Student');
    await userEvent.type(screen.getByLabelText(/student id/i), 'SS190001');
    await waitFor(() => expect(optionValues()).toEqual(['', 'c1', 'c2']));
    expect(screen.getByText(/no major matches this student id/i)).toBeInTheDocument();
  });

  it('prefills the Student ID from the registration page and the phone and birth date already on file', async () => {
    sessionStorage.setItem('faaps.pendingStudentCode', 'SE190001');
    const year = new Date().getFullYear() - 20;
    profile.mockResolvedValue({ studentCode: null, phone: '0901234567', dateOfBirth: `${year}-03-14` });
    complete.mockResolvedValue({ studentCode: 'SE190001' });
    renderPage();

    expect(await screen.findByDisplayValue('SE190001')).toBeInTheDocument();
    expect(screen.getByLabelText(/^phone/i)).toHaveValue('0901234567');
    await waitFor(() => expect(screen.getByLabelText(/major \/ curriculum/i)).toHaveValue('c1'));

    await userEvent.click(screen.getByRole('button', { name: /complete registration/i }));
    await waitFor(() =>
      expect(complete).toHaveBeenCalledWith({
        studentCode: 'SE190001',
        curriculumVersionId: 'c1',
        dateOfBirth: `${year}-03-14`,
        phone: '0901234567',
      }),
    );
    expect(await screen.findByText('Student portal')).toBeInTheDocument();
    expect(sessionStorage.getItem('faaps.pendingStudentCode')).toBeNull();
  });

  it('submits the upper-cased Student ID with the chosen curriculum and opens the portal', async () => {
    complete.mockResolvedValue({ studentCode: 'SE190001' });
    renderPage();
    await screen.findByText('New Student');

    await userEvent.type(screen.getByLabelText(/student id/i), 'se190001');
    await fillBirthDate();
    await userEvent.type(screen.getByLabelText(/^phone/i), '0901234567');
    await userEvent.click(screen.getByRole('button', { name: /complete registration/i }));

    await waitFor(() =>
      expect(complete).toHaveBeenCalledWith({
        studentCode: 'SE190001',
        curriculumVersionId: 'c1',
        dateOfBirth: `${new Date().getFullYear() - 20}-03-14`,
        phone: '0901234567',
      }),
    );
    expect(await screen.findByText('Student portal')).toBeInTheDocument();
  });

  it('shows the backend message inside the form when the Student ID is taken', async () => {
    complete.mockRejectedValue(Object.assign(new Error('x'), {
      isAxiosError: true,
      response: { status: 409, data: { message: 'This Student ID is already registered' } },
    }));
    renderPage();
    await screen.findByText('New Student');

    await userEvent.type(screen.getByLabelText(/student id/i), 'AI180001');
    await fillBirthDate();
    await userEvent.type(screen.getByLabelText(/^phone/i), '0901234567');
    await userEvent.click(screen.getByRole('button', { name: /complete registration/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('This Student ID is already registered');
  });

  it('skips the form when the student is already registered', async () => {
    profile.mockResolvedValue({ studentCode: 'SE170001' });
    renderPage();
    expect(await screen.findByText('Student portal')).toBeInTheDocument();
  });
});
