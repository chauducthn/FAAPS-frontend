import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkloadBadge } from './WorkloadBadge';
import { CourseWorkloadCard } from './CourseWorkloadCard';
import type { CourseWorkload } from '../types/course';

const sampleWorkload: CourseWorkload = {
  level: 'HEAVY',
  score: 82,
  source: 'DATA_ADJUSTED',
  manualLevel: null,
  ruleLevel: 'MEDIUM',
  ruleScore: 62,
  ruleReasons: ['Core / major specialization', 'Both Practical Exam (PE) and Final Exam (FE)'],
  stats: {
    sampleSize: 45,
    failRate: 31.1,
    avgScore: 6.15,
    sufficientSample: true,
    dataAdjustment: 20,
  },
};

describe('WorkloadBadge & CourseWorkloadCard', () => {
  it('renders workload level badge and optional source label', () => {
    const { rerender } = render(<WorkloadBadge workload={sampleWorkload} />);
    expect(screen.getByText('Heavy')).toBeInTheDocument();

    rerender(<WorkloadBadge workload={sampleWorkload} showSource />);
    expect(screen.getByText(/Data/)).toBeInTheDocument();

    rerender(<WorkloadBadge workload={null} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('displays Layer 1 rule reasons, Layer 3 historical stats, and Layer 2 override buttons', () => {
    const onOverride = vi.fn();
    render(<CourseWorkloadCard workload={sampleWorkload} onOverride={onOverride} />);

    expect(screen.getByText('82/100')).toBeInTheDocument();
    expect(screen.getByText('Core / major specialization')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('31.1%')).toBeInTheDocument();
    expect(screen.getByText('6.15')).toBeInTheDocument();
    expect(screen.getByText(/Active data adjustment: \+20 pts/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Light' }));
    expect(onOverride).toHaveBeenCalledWith('LIGHT');

    // Auto is already active when manualLevel is null -> clicking it is a no-op
    expect(screen.getByRole('button', { name: 'Auto' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
    expect(onOverride).toHaveBeenCalledTimes(1);
  });

  it('allows resetting to Auto when a manual override is active', () => {
    const onOverride = vi.fn();
    render(
      <CourseWorkloadCard
        workload={{ ...sampleWorkload, source: 'MANUAL', manualLevel: 'HEAVY' }}
        onOverride={onOverride}
      />,
    );

    expect(screen.getByRole('button', { name: 'Heavy' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
    expect(onOverride).toHaveBeenCalledWith('AUTO');
  });

  it('shows sample threshold progress when sample size is below 30 and hides override when readOnly', () => {
    const ruleOnly: CourseWorkload = {
      ...sampleWorkload,
      level: 'LIGHT',
      score: 28,
      source: 'RULE_BASED',
      ruleLevel: 'LIGHT',
      ruleScore: 28,
      stats: {
        sampleSize: 12,
        failRate: 8.3,
        avgScore: 8.1,
        sufficientSample: false,
        dataAdjustment: 0,
      },
    };

    render(<CourseWorkloadCard workload={ruleOnly} />);
    expect(screen.getByText(/Needs 30\+ graded attempts to adjust score \(12\/30\)/)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Workload override' })).not.toBeInTheDocument();
  });
});
