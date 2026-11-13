import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import Register from './Register';

const register = vi.fn();

vi.mock('@/modules/auth/services/authService', () => ({
  authService: {
    register: (b: unknown) => register(b),
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

async function fillValidForm(overrides: { password?: string; phone?: string; studentCode?: string } = {}) {
  const user = userEvent.setup();
  const password = overrides.password ?? 'Secret@123';
  await user.type(screen.getByLabelText(/full name/i), 'Nguyen Van A');
  await user.type(screen.getByLabelText(/student id/i), overrides.studentCode ?? 'se190001');
  await user.selectOptions(screen.getByLabelText('Day of birth'), '14');
  await user.selectOptions(screen.getByLabelText('Month of birth'), '03');
  await user.selectOptions(screen.getByLabelText('Year of birth'), String(new Date().getFullYear() - 20));
  await user.type(screen.getByLabelText(/^email/i), 'a@fpt.edu.vn');
  await user.type(screen.getByLabelText(/^phone/i), overrides.phone ?? '0901234567');
  await user.type(screen.getByLabelText(/^password/i), password);
  await user.type(screen.getByLabelText(/confirm password/i), password);
  return user;
}

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('offers both Google sign-up and manual registration on the same page', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: /sign up with google/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('no longer asks for a major: it is chosen after the account exists', () => {
    renderPage();
    expect(screen.queryByLabelText(/curriculum|major/i)).not.toBeInTheDocument();
  });

  it('shows an error for every missing field', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByText(/cohort from 01 to 22/i)).toBeInTheDocument();
    expect(screen.getByText(/day, month and year of birth/i)).toBeInTheDocument();
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Enter your phone number')).toBeInTheDocument();
    expect(screen.getByText('Use at least 8 characters')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('rejects a Student ID whose cohort is outside 01-22 and a phone that is not a Vietnamese mobile number', async () => {
    renderPage();
    const user = await fillValidForm({ studentCode: 'SE990001', phone: '0123456789' });
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/cohort from 01 to 22/i)).toBeInTheDocument();
    expect(screen.getByText(/10-digit Vietnamese number/i)).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('rejects a password without a special character or with the Student ID inside', async () => {
    renderPage();
    const user = await fillValidForm({ password: 'Secret123' });
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Include a special character, for example @ # $ !')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('rejects a password that contains the Student ID', async () => {
    renderPage();
    const user = await fillValidForm({ password: 'Xx@SE190001' });
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Password must not contain your Student ID, name or email')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('does not offer a birth year that makes the student too young', () => {
    renderPage();
    const years = Array.from(screen.getByLabelText('Year of birth').querySelectorAll('option')).map((o) => o.value);
    expect(years).not.toContain(String(new Date().getFullYear() - 10));
    expect(years).toContain(String(new Date().getFullYear() - 20));
  });

  it('rejects a password that does not match its confirmation', async () => {
    renderPage();
    const user = await fillValidForm();
    await user.clear(screen.getByLabelText(/confirm password/i));
    await user.type(screen.getByLabelText(/confirm password/i), 'Different@1');
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
      phone: '0901234567',
      password: 'Secret@123',
    });
    expect(register.mock.calls[0][0]).not.toHaveProperty('curriculumVersionId');
    expect(register.mock.calls[0][0].dateOfBirth).toMatch(/^\d{4}-03-14$/);
    expect(await screen.findByRole('alert')).toHaveTextContent('An account with this email already exists');
  });

  it('links back to the sign-in page', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('link', { name: /^sign in$/i }));
    expect(await screen.findByText('Login page')).toBeInTheDocument();
  });
});
