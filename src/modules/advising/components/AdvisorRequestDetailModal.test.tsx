import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdvisorRequestDetailModal } from './AdvisorRequestDetailModal';
import type { AdvisingRequest } from '../types/advising';

const getRequestDetail = vi.fn();
const getStudentDetail = vi.fn();

vi.mock('../services/advisorService', () => ({
  advisorService: {
    getRequestDetail: (id: string) => getRequestDetail(id),
    getStudentDetail: (id: string) => getStudentDetail(id),
    claimRequest: vi.fn(),
    sendRequestMessage: vi.fn(),
    updateRequestStatus: vi.fn(),
  },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
// The 360 modal pulls the advisor's whole appointment list — not under test here.
vi.mock('../../appointment/services/appointmentService', () => ({
  appointmentService: { getAllAdvisorAppointments: vi.fn().mockResolvedValue([]) },
}));

const ticket: AdvisingRequest = {
  id: 'ticket-1',
  studentId: 's1',
  studentName: 'Student One',
  studentCode: 'SE123',
  advisorId: 'advisor-1',
  advisorName: 'Advisor A',
  studyPlanId: null,
  linkedAppointmentId: null,
  requestType: 'OTHER',
  title: 'Course selection help',
  description: 'Which courses should I pick?',
  status: 'IN_PROGRESS',
  resolvedAt: null,
  resolutionSummary: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

function renderModal() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AdvisorRequestDetailModal request={ticket} onClose={() => {}} />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('AdvisorRequestDetailModal — student profile & scheduling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestDetail.mockResolvedValue({ request: ticket, messages: [] });
    getStudentDetail.mockResolvedValue({
      profile: {
        id: 's1',
        fullName: 'Student One',
        studentCode: 'SE123',
        majorName: 'Software Engineering',
        cohort: 'K19',
        currentSemester: 5,
        academicStatus: 'ACTIVE',
      },
      progress: { currentGpa: 8.2, earnedCredits: 90, requiredCredits: 120 },
      transcript: [],
    });
  });

  it('offers a "View Student Profile" button', async () => {
    renderModal();

    expect(await screen.findByRole('button', { name: /view student profile/i })).toBeInTheDocument();
  });

  it('opens the Student 360 profile when the button is clicked', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(await screen.findByRole('button', { name: /view student profile/i }));

    expect(getStudentDetail).toHaveBeenCalledWith('s1');
    expect(await screen.findByText(/Student 360 Profile/i)).toBeInTheDocument();
  });

  it('offers a "Schedule Appointment" button that opens the scheduling form for the ticket', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(await screen.findByRole('button', { name: /schedule appointment/i }));

    // The form carries the ticket id so the appointment gets linked to it.
    expect(await screen.findByText(/linked to the advising request/i)).toBeInTheDocument();
  });
});
