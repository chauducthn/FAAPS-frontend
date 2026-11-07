// src/shared/components/layout/advising/AdvisorSidebar.test.tsx
// Xác minh sidebar Advisor được nhóm đúng như Admin: có label phân khu,
// thứ tự mục, icon đi kèm và trạng thái active giữ màu cam FPT.

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

  it('renders the four section labels in order', () => {
    renderSidebar('/advisor');
    const nav = screen.getByRole('navigation', { name: /portal navigation/i });

    const labels = Array.from(nav.querySelectorAll('p')).map((p) => p.textContent);
    expect(labels).toEqual(['WORKSPACE', 'ADVISING', 'APPOINTMENTS', 'RESOURCES']);
  });

  it('lists every navigation item under its section', () => {
    renderSidebar('/advisor');
    const nav = screen.getByRole('navigation', { name: /portal navigation/i });
    const links = Array.from(nav.querySelectorAll('a')).map((a) => a.textContent?.trim());

    expect(links).toEqual([
      'Overview',
      'My Students',
      'My Profile',
      'Advising Requests',
      'Advising Conversations',
      'Study Plan Reviews',
      'Appointments',
      'Academic Search',
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

  it('marks the current page active with the FPT orange treatment', () => {
    renderSidebar('/advisor/advising-requests');
    const nav = screen.getByRole('navigation', { name: /portal navigation/i });

    const active = nav.querySelector('a[aria-current="page"]');
    expect(active).not.toBeNull();
    expect(active?.textContent).toContain('Advising Requests');
    expect(active?.className).toContain('text-[#f37021]');
    expect(active?.className).toContain('bg-[#fff7ed]');
    expect(active?.className).toContain('border-[#f37021]');
  });

  it('keeps Overview inactive on a sub-route', () => {
    renderSidebar('/advisor/students');
    const nav = screen.getByRole('navigation', { name: /portal navigation/i });

    const active = nav.querySelector('a[aria-current="page"]');
    expect(active?.textContent).toContain('My Students');

    // Overview dùng `end` nên không được sáng ở sub-route.
    const overview = Array.from(nav.querySelectorAll('a')).find((a) =>
      a.textContent?.trim() === 'Overview',
    );
    expect(overview?.getAttribute('aria-current')).toBeNull();
    expect(overview?.className).not.toContain('text-[#f37021]');
  });

  it('renders the section labels in muted gray', () => {
    renderSidebar('/advisor');
    const nav = screen.getByRole('navigation', { name: /portal navigation/i });
    const label = within(nav).getByText('ADVISING');

    expect(label.className).toContain('text-[#98a2b3]');
    expect(label.className).toContain('uppercase');
  });
});
