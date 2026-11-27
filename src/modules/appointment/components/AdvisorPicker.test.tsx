import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdvisorPicker } from './AdvisorPicker';
import type { AdvisorOption } from '../types/advisorOption';

const advisors: AdvisorOption[] = [
  { id: 'a1', fullName: 'Advisor Same Group', email: 'same@fpt.vn', sameMajorGroup: true },
  { id: 'a2', fullName: 'Advisor Other Group', email: 'other@fpt.vn', sameMajorGroup: false },
];

describe('AdvisorPicker', () => {
  it('lists every advisor that can be booked', () => {
    render(
      <AdvisorPicker
        advisors={advisors}
        value={null}
        onChange={() => {}}
        slotCounts={{ a1: 3, a2: 0 }}
      />,
    );

    expect(screen.getByText('Advisor Same Group')).toBeInTheDocument();
    expect(screen.getByText('Advisor Other Group')).toBeInTheDocument();
  });

  it('badges the advisor that shares the major group as recommended', () => {
    render(
      <AdvisorPicker advisors={advisors} value={null} onChange={() => {}} slotCounts={{ a1: 3, a2: 0 }} />,
    );

    expect(screen.getByText(/Recommended · Same Major Group/i)).toBeInTheDocument();
    // Only the advisor flagged by the backend gets the badge.
    expect(screen.getAllByText(/Recommended · Same Major Group/i)).toHaveLength(1);
  });

  it('shows how many free slots each advisor has on the selected day', () => {
    render(
      <AdvisorPicker advisors={advisors} value={null} onChange={() => {}} slotCounts={{ a1: 3, a2: 0 }} />,
    );

    expect(screen.getByText('3 free')).toBeInTheDocument();
    expect(screen.getByText('Full')).toBeInTheDocument();
  });

  it('reports the picked advisor', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AdvisorPicker advisors={advisors} value={null} onChange={onChange} />);

    await user.click(screen.getByText('Advisor Other Group'));

    expect(onChange).toHaveBeenCalledWith('a2');
  });

  it('shows an empty state when no advisor is bookable', () => {
    render(<AdvisorPicker advisors={[]} value={null} onChange={() => {}} />);

    expect(screen.getByText(/no advisors are available/i)).toBeInTheDocument();
  });
});
