import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdvisingRequestDetailModal } from './AdvisingRequestDetailModal';
import type { AdvisingRequest, AdvisingRequestStatus } from '../../advising/types/advising';

const getAdvisingRequestDetail = vi.fn();

vi.mock('../services/studentService', () => ({
  studentService: {
    getAdvisingRequestDetail: (id: string) => getAdvisingRequestDetail(id),
    sendAdvisingReply: vi.fn(),
    cancelAdvisingRequest: vi.fn(),
  },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const request = (
  id: string,
  status: AdvisingRequestStatus,
  linkedAppointmentId: string | null = null,
): AdvisingRequest => ({
  id,
  studentId: 's1',
  studentName: 'Student One',
  studentCode: 'SE123',
  advisorId: 'advisor-1',
  advisorName: 'Advisor A',
  studyPlanId: null,
  linkedAppointmentId,
  requestType: 'OTHER',
  title: 'Course selection help',
  description: 'Which courses should I pick?',
  status,
  resolvedAt: null,
  resolutionSummary: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
});

function renderModal() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AdvisingRequestDetailModal id="ticket-1" onClose={() => {}} />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('AdvisingRequestDetailModal — booking an appointment from a ticket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdvisingRequestDetail.mockResolvedValue({
      request: request('ticket-1', 'IN_PROGRESS'),
      messages: [],
    });
  });

  it('offers a "Book Appointment" link that carries the ticket id', async () => {
    renderModal();

    const link = await screen.findByRole('link', { name: /book appointment/i });
    expect(link).toHaveAttribute('href', '/student/appointments?advisingRequestId=ticket-1');
  });

  it('shows the "appointment booked" card instead of the button once the ticket is linked', async () => {
    getAdvisingRequestDetail.mockResolvedValue({
      request: request('ticket-1', 'IN_PROGRESS', 'appt-9'),
      messages: [],
    });

    renderModal();

    // The card announces the booking (the exact wording requested by the product).
    expect(await screen.findByText('Appointment booked')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /book appointment/i })).not.toBeInTheDocument();
    // The card links back to the appointments page.
    expect(screen.getByRole('link', { name: /go to appointments/i })).toHaveAttribute(
      'href',
      '/student/appointments',
    );
  });

  it('does not offer booking on a closed ticket', async () => {
    getAdvisingRequestDetail.mockResolvedValue({
      request: request('ticket-1', 'RESOLVED'),
      messages: [],
    });

    renderModal();

    await screen.findByText(/course selection help/i);
    expect(screen.queryByRole('link', { name: /book appointment/i })).not.toBeInTheDocument();
  });
});
