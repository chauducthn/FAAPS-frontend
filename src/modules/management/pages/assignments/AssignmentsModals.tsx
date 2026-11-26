import { Modal } from '../../../../shared/components/ui/Modal';
import { AssignAdvisorModal } from '../../components/AssignAdvisorModal';
import { AssignToAdvisorModal } from '../../components/AssignToAdvisorModal';
import { AutoAssignModal } from '../../components/AutoAssignModal';
import { CohortPickerModal } from '../../components/CohortPickerModal';
import { CohortAssignModal } from '../../components/CohortAssignModal';
import { CohortPoolModal } from '../../components/CohortPoolModal';
import { AdvisoryLimitModal, type AdvisoryLimitTarget } from '../../components/AdvisoryLimitModal';
import { StudentHistoryPanel, type HistoryStudentTarget } from '../../components/StudentHistoryPanel';
import { UnassignAdvisorModal } from '../../components/UnassignAdvisorModal';
import { UnassignAllModal, type UnassignAllTarget } from '../../components/UnassignAllModal';
import type { AssignmentAdvisor, CohortPoolAdvisor, SummaryCohort } from '../../types/admin';

export interface AssignCohortModalState {
  cohortId?: string;
  advisorId?: string;
  initialCohortIds?: string[];
  bulkAdvisors?: { id: string; name: string }[];
}

export function AssignmentsModals({
  assignCohortFor,
  onCloseAssignCohort,
  onDoneAssignCohort,
  pickerOpen,
  onClosePicker,
  onPickCohort,
  onConfigureCohortPool,
  autoFor,
  onCloseAuto,
  onBackFromAuto,
  onConfigurePoolFromAuto,
  poolFor,
  onClosePool,
  onBackFromPool,
  bulkAssignStudents,
  onCloseBulkAssign,
  reassignStudents,
  onCloseReassign,
  excludeAdvisorId,
  unassignStudents,
  onCloseUnassignStudents,
  historyStudent,
  onCloseHistory,
  limitTarget,
  onCloseLimit,
  unassignAllTarget,
  onCloseUnassignAll,
  onDoneUnassignAll,
  cohorts,
  advisors,
  autoPool,
  poolCountByCohort,
  poolAdvisorsByCohort,
}: {
  assignCohortFor: AssignCohortModalState | null;
  onCloseAssignCohort: () => void;
  onDoneAssignCohort: () => void;
  pickerOpen: boolean;
  onClosePicker: () => void;
  onPickCohort: (cohort: SummaryCohort) => void;
  onConfigureCohortPool: (cohort: SummaryCohort) => void;
  autoFor: SummaryCohort | null;
  onCloseAuto: () => void;
  onBackFromAuto: () => void;
  onConfigurePoolFromAuto: () => void;
  poolFor: SummaryCohort | null;
  onClosePool: () => void;
  onBackFromPool: () => void;
  bulkAssignStudents: { id: string; name: string; cohortId?: string }[] | null;
  onCloseBulkAssign: () => void;
  reassignStudents: { id: string; name: string; cohortId?: string; advisorId?: string | null }[] | null;
  onCloseReassign: () => void;
  excludeAdvisorId?: string;
  unassignStudents: { id: string; name: string }[] | null;
  onCloseUnassignStudents: () => void;
  historyStudent: HistoryStudentTarget | null;
  onCloseHistory: () => void;
  limitTarget: AdvisoryLimitTarget | null;
  onCloseLimit: () => void;
  unassignAllTarget: UnassignAllTarget | null;
  onCloseUnassignAll: () => void;
  onDoneUnassignAll: () => void;
  cohorts: SummaryCohort[];
  advisors: AssignmentAdvisor[];
  autoPool: CohortPoolAdvisor[];
  poolCountByCohort: Map<string, number>;
  poolAdvisorsByCohort: Map<string, Set<string>>;
}) {
  const filterEligibleByCohorts = (list: { cohortId?: string }[] | null) => {
    const requiredCohorts = [...new Set((list ?? []).map((s) => s.cohortId).filter(Boolean) as string[])];
    if (requiredCohorts.length === 0) return advisors;
    return advisors.filter((a) => requiredCohorts.every((cId) => poolAdvisorsByCohort.get(cId)?.has(a.id)));
  };
  const eligibleAdvisors = filterEligibleByCohorts(bulkAssignStudents);
  const eligibleReassignAdvisors = filterEligibleByCohorts(reassignStudents);
  const sharedCurrentAdvisorIds = [
    ...new Set((reassignStudents ?? []).map((s) => s.advisorId).filter(Boolean) as string[]),
  ];
  const effectiveExcludeAdvisorId =
    excludeAdvisorId ?? (sharedCurrentAdvisorIds.length === 1 ? sharedCurrentAdvisorIds[0] : undefined);
  const assignedAdvisorIds = new Set<string>();
  poolAdvisorsByCohort.forEach((set) => set.forEach((id) => assignedAdvisorIds.add(id)));
  const idleAdvisors = advisors.filter((a) => !assignedAdvisorIds.has(a.id));
  return (
    <>
      <CohortAssignModal
        open={!!assignCohortFor}
        onClose={onCloseAssignCohort}
        cohorts={cohorts}
        advisors={advisors}
        fixedCohortId={assignCohortFor?.cohortId}
        fixedAdvisorId={assignCohortFor?.advisorId}
        initialCohortIds={assignCohortFor?.initialCohortIds}
        bulkAdvisors={assignCohortFor?.bulkAdvisors}
        assignedAdvisorIds={assignedAdvisorIds}
        onDone={onDoneAssignCohort}
      />
      <CohortPickerModal
        open={pickerOpen}
        cohorts={cohorts}
        poolCountByCohort={poolCountByCohort}
        idleAdvisorCount={idleAdvisors.length}
        onClose={onClosePicker}
        onPick={onPickCohort}
        onConfigurePool={onConfigureCohortPool}
      />
      <AutoAssignModal
        open={!!autoFor}
        cohort={autoFor}
        pool={autoPool}
        advisors={advisors}
        idleAdvisors={idleAdvisors}
        onClose={onCloseAuto}
        onBack={onBackFromAuto}
        onConfigurePool={onConfigurePoolFromAuto}
      />
      <CohortPoolModal
        open={!!poolFor}
        cohort={poolFor}
        advisors={advisors}
        currentIds={autoPool.map((a) => a.advisorId)}
        onClose={onClosePool}
        onBack={onBackFromPool}
      />
      <AssignToAdvisorModal
        open={!!bulkAssignStudents}
        onClose={onCloseBulkAssign}
        students={bulkAssignStudents ?? []}
        advisors={eligibleAdvisors}
      />
      <AssignAdvisorModal
        open={!!reassignStudents?.length}
        onClose={onCloseReassign}
        students={reassignStudents ?? []}
        advisors={eligibleReassignAdvisors}
        excludeAdvisorId={effectiveExcludeAdvisorId}
      />
      <UnassignAdvisorModal students={unassignStudents} onClose={onCloseUnassignStudents} />
      <Modal open={!!historyStudent} onClose={onCloseHistory} title="Assignment history" className="max-w-4xl">
        {historyStudent && (
          <div className="p-4">
            <StudentHistoryPanel student={historyStudent} onBack={onCloseHistory} />
          </div>
        )}
      </Modal>
      <AdvisoryLimitModal target={limitTarget} onClose={onCloseLimit} />
      <UnassignAllModal target={unassignAllTarget} onClose={onCloseUnassignAll} onDone={onDoneUnassignAll} />
    </>
  );
}
