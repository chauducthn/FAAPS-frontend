import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AtRiskStudentsWidget } from './AtRiskStudentsWidget';
import type { AtRiskStudent } from '../types/at-risk';

const getAtRiskStudents = vi.fn();

vi.mock('../services/advisorAtRiskApi', () => ({
  advisorAtRiskApi: { getAtRiskStudents: () => getAtRiskStudents() },
}));

const baseStudent: AtRiskStudent = {
  id: 's1',
  studentCode: 'SE123',
  fullName: 'Student One',
  majorCode: 'SE',
  majorName: 'Software Engineering',
  currentSemester: 5,
  currentGpa: 4.2,
  riskLevel: 'HIGH',
  reasons: ['LOW_GPA'],
  reasonDetails: 'GPA 4.20 < 5.00',
  totalCreditsEarned: 60,
  detectedAt: null,
};

function renderWidget(students: AtRiskStudent[]) {
  getAtRiskStudents.mockResolvedValue({ data: students, total: students.length });
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <AtRiskStudentsWidget onViewDetail={() => {}} />
    </QueryClientProvider>,
  );
}

describe('AtRiskStudentsWidget — advising status badges', () => {
  it('shows "Appointment scheduled" when the student has an open appointment', async () => {
    renderWidget([{ ...baseStudent, hasOpenAppointment: true, hasOpenRequest: false }]);

    expect(await screen.findByText('Appointment scheduled')).toBeInTheDocument();
    expect(screen.queryByText('In advising')).not.toBeInTheDocument();
  });

  it('shows "In advising" when the student has an open request but no appointment', async () => {
    renderWidget([{ ...baseStudent, hasOpenAppointment: false, hasOpenRequest: true }]);

    expect(await screen.findByText('In advising')).toBeInTheDocument();
    expect(screen.queryByText('Appointment scheduled')).not.toBeInTheDocument();
  });

  it('prefers the appointment badge when both flags are set', async () => {
    renderWidget([{ ...baseStudent, hasOpenAppointment: true, hasOpenRequest: true }]);

    expect(await screen.findByText('Appointment scheduled')).toBeInTheDocument();
    expect(screen.queryByText('In advising')).not.toBeInTheDocument();
  });

  it('shows no status badge when the backend reports neither flag', async () => {
    renderWidget([baseStudent]);

    expect(await screen.findByText('Student One')).toBeInTheDocument();
    expect(screen.queryByText('Appointment scheduled')).not.toBeInTheDocument();
    expect(screen.queryByText('In advising')).not.toBeInTheDocument();
  });
});
