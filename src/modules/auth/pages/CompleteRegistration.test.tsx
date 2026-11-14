import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import CompleteRegistration from './CompleteRegistration';
import { useAuth } from '../stores/useAuth';

const profile = vi.fn();
const complete = vi.fn();

vi.mock('@/modules/academic/services/studentAcademicService', () => ({
  studentAcademicService: { profile: () => profile() },
}));
vi.mock('../services/onboardingService', () => ({
  onboardingService: { curriculums: vi.fn(), complete: (b: unknown) => complete(b) },
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

describe('CompleteRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.getState().setUser({ id: 'u1', email: 'new@fpt.edu.vn', fullName: 'New Student', role: 'STUDENT', status: 'ACTIVE' });
    profile.mockResolvedValue({ studentCode: null, phone: null, dateOfBirth: null });
  });

  it('asks for the Student ID, birth date and phone, and not for a major', async () => {
    renderPage();
    expect(await screen.findByText('New Student')).toBeInTheDocument();
    expect(screen.getByText('new@fpt.edu.vn')).toBeInTheDocument();
    expect(screen.queryByLabelText(/curriculum|major/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /complete registration/i }));
    expect(await screen.findByText(/cohort from 01 to 22/i)).toBeInTheDocument();
    expect(screen.getByText('Enter your phone number')).toBeInTheDocument();
    expect(complete).not.toHaveBeenCalled();
  });

  it('submits the upper-cased Student ID, birth date and phone, then opens the portal', async () => {
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
        dateOfBirth: `${new Date().getFullYear() - 20}-03-14`,
        phone: '0901234567',
      }),
    );
    expect(await screen.findByText('Student portal')).toBeInTheDocument();
  });

  it('prefills the phone and birth date already on file', async () => {
    const year = new Date().getFullYear() - 20;
    profile.mockResolvedValue({ studentCode: null, phone: '0901234567', dateOfBirth: `${year}-03-14` });
    renderPage();

    expect(await screen.findByLabelText(/^phone/i)).toHaveValue('0901234567');
    expect(screen.getByLabelText('Year of birth')).toHaveValue(String(year));
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
