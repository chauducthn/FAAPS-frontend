// Assign 1 major + 1 cohort to one or multiple advisors (manual or auto-distribute, without assigning students).
import { useEffect, useMemo, useState } from 'react';
import { FolderOpen } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import {
  useAutoAssignAdvisorCohorts,
  useBulkAssignAdvisorCohorts,
  useReplaceAdvisorCohorts,
} from '../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import type { AssignmentAdvisor, SummaryCohort } from '../types/admin';
import {
  AssignmentModalFooter,
  AssignmentModalHeader,
  assignmentCancelBtn,
  assignmentPrimaryBtn,
} from './AssignmentModalChrome';
import { CohortAssignModalBody } from './CohortAssignModalBody';

interface CohortAssignModalProps {
  open: boolean;
  onClose: () => void;
  cohorts: SummaryCohort[];
  advisors: AssignmentAdvisor[];
  fixedCohortId?: string;
  fixedAdvisorId?: string;
  initialCohortIds?: string[];
  bulkAdvisors?: { id: string; name: string }[];
  assignedAdvisorIds?: Set<string>;
  onDone?: () => void;
}

export function CohortAssignModal({
  open, onClose, cohorts, advisors, fixedCohortId, fixedAdvisorId, initialCohortIds, bulkAdvisors, assignedAdvisorIds, onDone,
}: CohortAssignModalProps) {
  const isBulk = !!bulkAdvisors && bulkAdvisors.length > 0;
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [majorCode, setMajorCode] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const replaceOne = useReplaceAdvisorCohorts();
  const bulkAssign = useBulkAssignAdvisorCohorts();
  const autoAssign = useAutoAssignAdvisorCohorts();

  const initialId = fixedCohortId ?? initialCohortIds?.[0] ?? '';

  useEffect(() => {
    if (!open) return;
    const current = !isBulk && initialId ? cohorts.find((c) => c.cohortId === initialId) : undefined;
    setMode('manual');
    setMajorCode(current?.majorCode ?? '');
    setCohortId(current?.cohortId ?? '');
    setError(null);
  }, [open, initialId, isBulk, cohorts]);

  const majors = useMemo(() => [...new Set(cohorts.map((c) => c.majorCode))].sort(), [cohorts]);
  const cohortOptions = useMemo(() => (majorCode ? cohorts.filter((c) => c.majorCode === majorCode) : []), [cohorts, majorCode]);
  const advisor = fixedAdvisorId ? advisors.find((a) => a.id === fixedAdvisorId) : undefined;
  const selectedCohort = cohorts.find((c) => c.cohortId === cohortId);
  const pending = replaceOne.isPending || bulkAssign.isPending || autoAssign.isPending;

  const alreadyAssignedCount = useMemo(
    () => (isBulk && bulkAdvisors && assignedAdvisorIds ? bulkAdvisors.filter((a) => assignedAdvisorIds.has(a.id)).length : 0),
    [isBulk, bulkAdvisors, assignedAdvisorIds],
  );
  const idleCount = isBulk && bulkAdvisors ? bulkAdvisors.length - alreadyAssignedCount : 0;
  const cohortsNeedingPool = useMemo(() => cohorts.filter((c) => c.unassigned > 0).length, [cohorts]);

  const save = async () => {
    setError(null);
    if (isBulk && mode === 'auto' && bulkAdvisors) {
      try {
        const res = await autoAssign.mutateAsync({ advisorIds: bulkAdvisors.map((a) => a.id) });
        if (res.assigned === 0) {
          toast.info(res.skippedNoNeed > 0 ? 'All cohorts with unassigned students already have enough capacity.' : 'All selected advisors already have a cohort assigned.');
        } else {
          const extra = res.skippedAlreadyAssigned > 0 ? ` (${res.skippedAlreadyAssigned} skipped)` : '';
          toast.success(`Assigned ${res.assigned} advisor${res.assigned === 1 ? '' : 's'} across ${res.cohortsConfigured} cohort${res.cohortsConfigured === 1 ? '' : 's'}${extra}.`);
        }
        onDone?.(); onClose();
      } catch (err) { setError(apiErrorMessage(err)); }
      return;
    }

    if (!cohortId && isBulk) return setError('Select a major and cohort.');
    try {
      const cohortIds = cohortId ? [cohortId] : [];
      const label = selectedCohort ? `${selectedCohort.majorCode} — ${selectedCohort.cohort}` : 'none';
      if (isBulk && bulkAdvisors) {
        await bulkAssign.mutateAsync({ advisorIds: bulkAdvisors.map((a) => a.id), cohortIds });
        toast.success(`Assigned ${label} to ${bulkAdvisors.length} advisor${bulkAdvisors.length === 1 ? '' : 's'}.`);
      } else if (fixedAdvisorId) {
        await replaceOne.mutateAsync({ advisorId: fixedAdvisorId, cohortIds });
        toast.success(cohortId ? `${advisor?.fullName ?? 'Advisor'} is now assigned to ${label}.` : `Removed cohort assignment for ${advisor?.fullName ?? 'advisor'}.`);
      }
      onDone?.(); onClose();
    } catch (err) { setError(apiErrorMessage(err)); }
  };

  const title = isBulk
    ? `Assign cohort to ${bulkAdvisors.length} advisor${bulkAdvisors.length === 1 ? '' : 's'}`
    : `Assign cohort${advisor ? ` — ${advisor.fullName}` : ''}`;

  const submitDisabled = pending || (isBulk && mode === 'auto'
    ? idleCount === 0 || cohortsNeedingPool === 0
    : (isBulk && !cohortId) || (!!majorCode && !cohortId));

  return (
    <Modal open={open} onClose={() => !pending && onClose()} title="Assign cohort to advisor" className="max-w-lg">
      <AssignmentModalHeader
        icon={FolderOpen} title={title}
        subtitle="1 major & 1 cohort per advisor. Students are not assigned yet." onClose={onClose}
      />
      <CohortAssignModalBody
        isBulk={isBulk} bulkCount={bulkAdvisors?.length ?? 0} mode={mode}
        idleCount={idleCount} alreadyAssignedCount={alreadyAssignedCount} cohortsNeedingPool={cohortsNeedingPool}
        majorCode={majorCode} cohortId={cohortId} fixedCohortId={fixedCohortId}
        majors={majors} cohortOptions={cohortOptions} error={error}
        onModeChange={(next) => { setMode(next); setError(null); }}
        onMajorChange={(next) => {
          setMajorCode(next); setCohortId('');
          setError(null);
        }}
        onCohortChange={(next) => { setCohortId(next); setError(null); }}
      />
      <AssignmentModalFooter>
        <button type="button" disabled={pending} onClick={onClose} className={assignmentCancelBtn}>Cancel</button>
        <button type="button" disabled={submitDisabled} onClick={() => void save()} className={assignmentPrimaryBtn}>
          {pending ? 'Saving...' : isBulk && mode === 'auto' ? 'Auto-assign cohorts' : cohortId ? 'Save assignment' : 'Clear cohort'}
        </button>
      </AssignmentModalFooter>
    </Modal>
  );
}
