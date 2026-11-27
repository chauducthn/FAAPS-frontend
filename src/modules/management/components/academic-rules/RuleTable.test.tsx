import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AcademicRule } from '../../../academic/types/academic-rule';
import RuleTable from './RuleTable';
import RuleFormModal from './RuleFormModal';

const RULES: AcademicRule[] = [
  {
    id: 'r1',
    ruleName: 'Semester GPA warning',
    policyType: 'GPA_WARNING',
    status: 'ACTIVE',
    condition: { min_gpa: 5, operator: '<', scope: 'semester_gpa' },
    restriction: {},
    approvalRequired: false,
    priority: 10,
    description: 'Warn students below 5.0',
    grade: 5,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'r2',
    ruleName: 'Credit cap per semester',
    policyType: 'MAX_CREDITS_PER_SEMESTER',
    status: 'DRAFT',
    condition: { max_credits: 24 },
    restriction: {},
    approvalRequired: true,
    priority: 5,
    description: null,
    grade: 24,
    isActive: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const pagination = { pageIndex: 0, pageSize: 10 };

describe('Academic Rules table', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderTable = () =>
    render(
      <RuleTable
        data={RULES}
        totalRowCount={RULES.length}
        pagination={pagination}
        onPaginationChange={vi.fn()}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onPublish={vi.fn()}
        onArchive={vi.fn()}
        onReopen={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

  it('shows the rule name, policy type, trigger/threshold, status and actions columns', async () => {
    renderTable();

    expect(await screen.findByText('Semester GPA warning')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Rule name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Policy type/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Trigger \/ Threshold/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Actions/i })).toBeInTheDocument();
  });

  it('drops the curriculum and display message columns', async () => {
    renderTable();

    await screen.findByText('Semester GPA warning');
    expect(screen.queryByRole('columnheader', { name: /Curriculum/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /Display Message/i })).not.toBeInTheDocument();
  });

  it('renders a human-readable threshold and scope for each rule', async () => {
    renderTable();

    await screen.findByText('Semester GPA warning');
    expect(screen.getByText('GPA < 5')).toBeInTheDocument();
    expect(screen.getByText('Semester GPA')).toBeInTheDocument();
    expect(screen.getByText('Max 24 credits')).toBeInTheDocument();
    expect(screen.getByText('Per semester')).toBeInTheDocument();
  });
});

describe('Academic Rules form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (
    mode: 'create' | 'edit' | 'view',
    initial: AcademicRule | null = null,
    onSubmit = vi.fn(),
  ) => {
    render(
      <RuleFormModal open mode={mode} initial={initial} onClose={vi.fn()} onSubmit={onSubmit} />,
    );
    return onSubmit;
  };

  it('asks for a rule name and offers a policy type', async () => {
    renderForm('create');

    expect(await screen.findByLabelText(/Rule name/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Policy type')).toBeInTheDocument();
  });

  it('has no curriculum picker and no display message field', async () => {
    renderForm('create');

    await screen.findByLabelText(/Rule name/i);
    expect(screen.queryByLabelText('Curriculum')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Display message')).not.toBeInTheDocument();
  });

  it('labels the numeric boundary as Grade', async () => {
    renderForm('create');

    await screen.findByLabelText(/Rule name/i);
    expect(screen.getByText('Grade', { exact: true })).toBeInTheDocument();
    expect(screen.queryByText('Threshold', { exact: true })).not.toBeInTheDocument();
  });

  it('requires a rule name before the form can be submitted', async () => {
    const onSubmit = vi.fn();
    renderForm('create', null, onSubmit);

    await screen.findByLabelText(/Rule name/i);

    const submit = screen.getByRole('button', { name: /Create rule/i });
    await waitFor(() => expect(submit).toBeEnabled());

    await userEvent.click(submit);

    // The rule name is required, so nothing is submitted.
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(await screen.findByText('Rule name is required')).toBeInTheDocument();
  });

  it('submits the rule name and grade without a curriculum', async () => {
    const onSubmit = vi.fn();
    renderForm('create', null, onSubmit);

    await screen.findByLabelText(/Rule name/i);
    await userEvent.type(screen.getByLabelText(/Rule name/i), 'My rule');

    const submit = screen.getByRole('button', { name: /Create rule/i });
    await waitFor(() => expect(submit).toBeEnabled());
    await userEvent.click(submit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const payload = onSubmit.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).toMatchObject({ ruleName: 'My rule', grade: 5 });
    expect(payload).not.toHaveProperty('curriculumVersionId');
    expect(payload).not.toHaveProperty('displayMessage');
  });
});
