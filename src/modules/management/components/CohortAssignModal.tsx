// Assign 1 major + 1 cohort to one or multiple advisors (without auto-assigning students).
import { useEffect, useMemo, useState } from 'react';
import { CaretDown as ChevronDown, FolderOpen } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { useBulkAssignAdvisorCohorts, useReplaceAdvisorCohorts } from '../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import type { AssignmentAdvisor, SummaryCohort } from '../types/admin';
import {
  AssignmentModalFooter,
  AssignmentModalHeader,
  assignmentCancelBtn,
  assignmentPrimaryBtn,
  assignmentSelectClass,
} from './AssignmentModalChrome';

interface CohortAssignModalProps {
  open: boolean;
  onClose: () => void;
  cohorts: SummaryCohort[];
  advisors: AssignmentAdvisor[];
  fixedCohortId?: string;
  fixedAdvisorId?: string;
  initialCohortIds?: string[];
  bulkAdvisors?: { id: string; name: string }[];
  onDone?: () => void;
}

export function CohortAssignModal({
  open,
  onClose,
  cohorts,
  advisors,
  fixedCohortId,
  fixedAdvisorId,
  initialCohortIds,
  bulkAdvisors,
  onDone,
}: CohortAssignModalProps) {
  const isBulk = !!bulkAdvisors && bulkAdvisors.length > 0;
  const [majorCode, setMajorCode] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const replaceOne = useReplaceAdvisorCohorts();
  const bulkAssign = useBulkAssignAdvisorCohorts();

  const initialId = fixedCohortId ?? initialCohortIds?.[0] ?? '';

  useEffect(() => {
    if (!open) return;
    const current = !isBulk && initialId ? cohorts.find((c) => c.cohortId === initialId) : undefined;
    setMajorCode(current?.majorCode ?? '');
    setCohortId(current?.cohortId ?? '');
    setError(null);
  }, [open, initialId, isBulk, cohorts]);

  const majors = useMemo(() => [...new Set(cohorts.map((c) => c.majorCode))].sort(), [cohorts]);
  const cohortOptions = useMemo(
    () => (majorCode ? cohorts.filter((c) => c.majorCode === majorCode) : []),
    [cohorts, majorCode],
  );
  const advisor = fixedAdvisorId ? advisors.find((a) => a.id === fixedAdvisorId) : undefined;
  const selectedCohort = cohorts.find((c) => c.cohortId === cohortId);
  const pending = replaceOne.isPending || bulkAssign.isPending;

  const handleMajorChange = (nextMajor: string) => {
    setMajorCode(nextMajor);
    setCohortId('');
    setError(null);
  };

  const save = async () => {
    setError(null);
    if (!cohortId && isBulk) return setError('Select a major and cohort.');
    try {
      const cohortIds = cohortId ? [cohortId] : [];
      const label = selectedCohort ? `${selectedCohort.majorCode} — ${selectedCohort.cohort}` : 'none';
      if (isBulk && bulkAdvisors) {
        await bulkAssign.mutateAsync({ advisorIds: bulkAdvisors.map((a) => a.id), cohortIds });
        toast.success(`Assigned ${label} to ${bulkAdvisors.length} advisor${bulkAdvisors.length === 1 ? '' : 's'}.`);
      } else if (fixedAdvisorId) {
        await replaceOne.mutateAsync({ advisorId: fixedAdvisorId, cohortIds });
        toast.success(
          cohortId
            ? `${advisor?.fullName ?? 'Advisor'} is now assigned to ${label}.`
            : `Removed cohort assignment for ${advisor?.fullName ?? 'advisor'}.`,
        );
      }
      onDone?.();
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const title = isBulk
    ? `Assign cohort to ${bulkAdvisors.length} advisor${bulkAdvisors.length === 1 ? '' : 's'}`
    : `Assign cohort${advisor ? ` — ${advisor.fullName}` : ''}`;

  return (
    <Modal open={open} onClose={() => !pending && onClose()} title="Assign cohort to advisor" className="max-w-lg">
      <AssignmentModalHeader
        icon={FolderOpen}
        title={title}
        subtitle="Each advisor manages 1 major and 1 cohort. Students are not automatically assigned."
        onClose={onClose}
      />
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Major</label>
            <div className="relative">
              <select
                value={majorCode}
                disabled={!!fixedCohortId}
                aria-label="Major"
                onChange={(e) => handleMajorChange(e.target.value)}
                className={assignmentSelectClass}
              >
                <option value="">Choose a major...</option>
                {majors.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Cohort</label>
            <div className="relative">
              <select
                value={cohortId}
                disabled={!!fixedCohortId || !majorCode}
                aria-label="Cohort"
                onChange={(e) => {
                  setCohortId(e.target.value);
                  setError(null);
                }}
                className={assignmentSelectClass}
              >
                <option value="">{majorCode ? 'Choose a cohort...' : 'Select a major first...'}</option>
                {cohortOptions.map((c) => (
                  <option key={c.cohortId} value={c.cohortId}>
                    {c.cohort} ({c.total} students)
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {isBulk && (
          <p className="rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2 text-xs text-gray-600">
            This will set the selected major and cohort for all {bulkAdvisors.length} selected advisor{bulkAdvisors.length === 1 ? '' : 's'}, replacing any previous cohort assignment.
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </p>
        )}
      </div>
      <AssignmentModalFooter>
        <button type="button" disabled={pending} onClick={onClose} className={assignmentCancelBtn}>
          Cancel
        </button>
        <button
          type="button"
          disabled={pending || (isBulk && !cohortId) || (!!majorCode && !cohortId)}
          onClick={() => void save()}
          className={assignmentPrimaryBtn}
        >
          {pending ? 'Saving...' : cohortId ? 'Save assignment' : 'Clear cohort'}
        </button>
      </AssignmentModalFooter>
    </Modal>
  );
}
