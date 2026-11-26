import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { useAuth } from '@/modules/auth/stores/useAuth';
import LandingPage from './index';

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
}

describe('LandingPage', () => {
  beforeEach(() => {
    useAuth.setState({ user: null, isAuthenticated: false, isCheckingAuth: false });
  });

  it('renders core landing sections and guest CTAs', () => {
    renderLanding();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/plan every semester/i);
    expect(screen.getByText(/everything you need for academic planning and advising/i)).toBeInTheDocument();
    expect(screen.getByText(/three dedicated portals, one shared academic truth/i)).toBeInTheDocument();
    expect(screen.getByText(/get started in four simple steps/i)).toBeInTheDocument();
    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();

    expect(screen.getAllByRole('link', { name: /get started/i }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole('link', { name: /sign in/i }).length).toBeGreaterThanOrEqual(2);
  });

  it('switches between Student, Academic Advisor, and Administrator role showcases', async () => {
    const user = userEvent.setup();
    renderLanding();

    expect(screen.getByText(/student portal snapshot/i)).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /academic advisor/i }));
    expect(screen.getByText(/advisor workspace snapshot/i)).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /administrator/i }));
    expect(screen.getByText(/admin console snapshot/i)).toBeInTheDocument();
  });

  it('toggles FAQ accordion items', async () => {
    const user = userEvent.setup();
    renderLanding();

    const secondQuestion = screen.getByRole('button', {
      name: /what is the difference between ai chat and my academic advisor/i,
    });
    expect(secondQuestion).toHaveAttribute('aria-expanded', 'false');

    await user.click(secondQuestion);
    expect(secondQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/available 24\/7 to help you look up academic regulations/i)).toBeInTheDocument();
  });

  it('allows switching between the 4 campus hero background slides', async () => {
    const user = userEvent.setup();
    renderLanding();

    const slideButtons = screen.getAllByRole('button', { name: /show background \d:/i });
    expect(slideButtons).toHaveLength(4);
    expect(slideButtons[0]).toHaveAttribute('aria-pressed', 'true');

    await user.click(slideButtons[2]);
    expect(slideButtons[2]).toHaveAttribute('aria-pressed', 'true');
    expect(slideButtons[0]).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows direct portal CTA when the user is already authenticated', () => {
    useAuth.setState({
      user: {
        id: 'adv-1',
        email: 'advisor@fpt.edu.vn',
        fullName: 'Nguyen Advisor',
        role: 'ADVISOR',
        status: 'ACTIVE',
      },
      isAuthenticated: true,
      isCheckingAuth: false,
    });

    renderLanding();

    const portalLinks = screen.getAllByRole('link', { name: /open advisor portal/i });
    expect(portalLinks.length).toBeGreaterThanOrEqual(2);
    portalLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/advisor');
    });
  });
});
