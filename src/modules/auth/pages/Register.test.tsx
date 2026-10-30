import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import Register from './Register';

const register = vi.fn();
const registerCurriculums = vi.fn();

vi.mock('@/modules/auth/services/authService', () => ({
  authService: {
    register: (b: unknown) => register(b),
    registerCurriculums: () => registerCurriculums(),
  },
}));

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<p>Login page</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function fillValidForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/full name/i), 'Nguyen Van A');
  await user.type(screen.getByLabelText(/student id/i), 'se190001');
  await user.selectOptions(screen.getByLabelText('Day of birth'), '14');
  await user.selectOptions(screen.getByLabelText('Month of birth'), '03');
  await user.selectOptions(screen.getByLabelText('Year of birth'), String(new Date().getFullYear() - 20));
  await user.selectOptions(await screen.findByLabelText(/curriculum/i), 'c1');
  await user.type(screen.getByLabelText(/^email/i), 'a@fpt.edu.vn');
  await user.type(screen.getByLabelText(/^password/i), 'Secret123');
  await user.type(screen.getByLabelText(/confirm password/i), 'Secret123');
  return user;
}

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerCurriculums.mockResolvedValue([
      { id: 'c1', version: 'K19', name: 'SE K19', majorCode: 'SE', majorName: 'Software Engineering' },
    ]);
  });

  it('offers manual registration and Google sign-up as two options', async () => {
    renderPage();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(['Create an account', 'Sign up with Google']);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();

    await userEvent.click(tabs[1]);
    expect(screen.getByRole('button', { name: /sign up with google/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/^password/i)).not.toBeInTheDocument();
  });

  it('shows an error for every missing field', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByText(/two letters and six digits/i)).toBeInTheDocument();
    expect(screen.getByText(/day, month and year of birth/i)).toBeInTheDocument();
    expect(screen.getByText('Select your curriculum')).toBeInTheDocument();
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Use at least 8 characters')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('rejects a password that does not match its confirmation', async () => {
    renderPage();
    const user = await fillValidForm();
    await user.clear(screen.getByLabelText(/confirm password/i));
    await user.type(screen.getByLabelText(/confirm password/i), 'Different1');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('sends the registration and shows the backend message when it fails', async () => {
    register.mockRejectedValue(Object.assign(new Error('x'), {
      isAxiosError: true,
      response: { status: 409, data: { message: 'An account with this email already exists' } },
    }));
    renderPage();
    const user = await fillValidForm();
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(register).toHaveBeenCalled());
    expect(register.mock.calls[0][0]).toMatchObject({
      fullName: 'Nguyen Van A',
      studentCode: 'SE190001',
      email: 'a@fpt.edu.vn',
      password: 'Secret123',
      curriculumVersionId: 'c1',
    });
    expect(register.mock.calls[0][0].dateOfBirth).toMatch(/^\d{4}-03-14$/);
    expect(await screen.findByRole('alert')).toHaveTextContent('An account with this email already exists');
  });

  it('links back to the sign-in page', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('link', { name: /^sign in$/i }));
    expect(await screen.findByText('Login page')).toBeInTheDocument();
  });
});
