import { AssignToAdvisorModal } from '../../components/AssignToAdvisorModal';
import { AutoAssignModal } from '../../components/AutoAssignModal';
import { CohortPickerModal } from '../../components/CohortPickerModal';
import { CohortAssignModal } from '../../components/CohortAssignModal';
import { CohortPoolModal } from '../../components/CohortPoolModal';
import { AdvisoryLimitModal, type AdvisoryLimitTarget } from '../../components/AdvisoryLimitModal';
import { AdvisorDetailsModal } from '../../components/AdvisorDetailsModal';
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
  limitTarget,
  onCloseLimit,
  detailAdvisorId,
  onCloseDetail,
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
  limitTarget: AdvisoryLimitTarget | null;
  onCloseLimit: () => void;
  detailAdvisorId: string | null;
  onCloseDetail: () => void;
  cohorts: SummaryCohort[];
  advisors: AssignmentAdvisor[];
  autoPool: CohortPoolAdvisor[];
  poolCountByCohort: Map<string, number>;
  poolAdvisorsByCohort: Map<string, Set<string>>;
}) {
  const requiredCohorts = [...new Set((bulkAssignStudents ?? []).map((s) => s.cohortId).filter(Boolean) as string[])];
  const eligibleAdvisors =
    requiredCohorts.length > 0 && poolAdvisorsByCohort.size > 0
      ? advisors.filter((a) => requiredCohorts.every((cId) => poolAdvisorsByCohort.get(cId)?.has(a.id)))
      : advisors;
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
        onDone={onDoneAssignCohort}
      />
      <CohortPickerModal
        open={pickerOpen}
        cohorts={cohorts}
        poolCountByCohort={poolCountByCohort}
        onClose={onClosePicker}
        onPick={onPickCohort}
        onConfigurePool={onConfigureCohortPool}
      />
      <AutoAssignModal
        open={!!autoFor}
        cohort={autoFor}
        pool={autoPool}
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
      <AdvisoryLimitModal target={limitTarget} onClose={onCloseLimit} />
      <AdvisorDetailsModal advisorId={detailAdvisorId} onClose={onCloseDetail} />
    </>
  );
}
