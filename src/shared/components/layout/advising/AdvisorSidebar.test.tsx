// src/shared/components/layout/advising/AdvisorSidebar.test.tsx
// Checks the Advisor sidebar is grouped like the Admin one: section labels,
// item order, an icon per item and the brand-orange active state.

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdvisorSidebar } from './AdvisorSidebar';

vi.mock('@/modules/advising/hooks/queries/useAdvisorQueries', () => ({
  useAdvisorAdvisingRequests: () => ({ data: [] }),
}));

vi.mock('@/modules/appointment/hooks/queries/useAppointmentQueries', () => ({
  useAllAdvisorAppointments: () => ({ data: [] }),
}));

function renderSidebar(path: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <AdvisorSidebar />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AdvisorSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the section labels in order', () => {
    renderSidebar('/advisor');
    const nav = screen.getByRole('navigation', { name: /portal navigation/i });

    // The "RESOURCES" section is hidden until the backend exposes /advisor/academic/*.
    const labels = Array.from(nav.querySelectorAll('p')).map((p) => p.textContent);
    expect(labels).toEqual(['WORKSPACE', 'ADVISING', 'APPOINTMENTS', 'INSIGHTS']);
  });

  it('lists every navigation item under its section', () => {
    renderSidebar('/advisor');
    const nav = screen.getByRole('navigation', { name: /portal navigation/i });
    const links = Array.from(nav.querySelectorAll('a')).map((a) => a.textContent?.trim());

    // "Academic Search" is hidden until the backend exposes /advisor/academic/*.
    // My Profile opens from the header avatar; My Students and Conversations were folded into the ticket queue.
    expect(links).toEqual([
      'Overview',
      'Advising Requests',
      'Study Plan Reviews',
      'Appointments',
      'Notifications',
      'Reports & Analytics',
    ]);
  });

  it('gives every item an icon', () => {
    renderSidebar('/advisor');
    const nav = screen.getByRole('navigation', { name: /portal navigation/i });
    const links = Array.from(nav.querySelectorAll('a'));

    links.forEach((link) => {
      const icon = link.querySelector('svg');
      expect(icon).not.toBeNull();
    });
  });

  it('marks the current page active with the FPT orange indicator', () => {
    renderSidebar('/advisor/advising-requests');
    const nav = screen.getByRole('navigation', { name: /portal navigation/i });

    const active = nav.querySelector('a[aria-current="page"]');
    expect(active).not.toBeNull();
    expect(active?.textContent).toContain('Advising Requests');
    expect(active?.className).toContain('text-ink-primary');
    expect(active?.className).toContain('bg-line-soft');
    expect(active?.className).toContain('[&>svg]:!text-brand');
    expect(active?.className).toContain('before:bg-brand');
  });

  it('keeps Overview inactive on a sub-route', () => {
    renderSidebar('/advisor/study-plans/plan-1');
    const nav = screen.getByRole('navigation', { name: /portal navigation/i });

    const active = nav.querySelector('a[aria-current="page"]');
    expect(active?.textContent).toContain('Study Plan Reviews');

    // Overview uses `end`, so it stays inactive on a sub-route.
    const overview = Array.from(nav.querySelectorAll('a')).find((a) =>
      a.textContent?.trim() === 'Overview',
    );
    expect(overview?.getAttribute('aria-current')).toBeNull();
    expect(overview?.className).not.toContain('text-[var(--brand)]');
  });

  it('renders the section labels in muted gray', () => {
    renderSidebar('/advisor');
    const nav = screen.getByRole('navigation', { name: /portal navigation/i });
    const label = within(nav).getByText('ADVISING');

    expect(label.className).toContain('text-ink-subtle');
    expect(label.className).toContain('uppercase');
  });
});
