// Compact modal showing an advisor's summary, cohorts, start date, and assigned students.
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Warning as AlertTriangle, X } from '@phosphor-icons/react';
import { Modal } from '../../../shared/components/ui/Modal';
import { LoadBadge } from './LoadBadge';
import { StatusBadge } from './StatusBadge';
import { UserInitials } from './UserInitials';
import { AssignAdvisorModal } from './AssignAdvisorModal';
import { UnassignAdvisorModal } from './UnassignAdvisorModal';
import { StudentHistoryPanel, type HistoryStudentTarget } from './StudentHistoryPanel';
import type { AdminUserStatus } from '../types/admin';
import { AdvisorStudentsSection } from '../pages/assignments/AdvisorStudentsSection';
import { ADVISOR_PAGE_SIZE, useAdvisorDetailsState } from '../pages/assignments/useAdvisorDetailsState';

export function AdvisorDetailsModal({
  advisorId,
  onClose,
}: {
  advisorId: string | null;
  onClose: () => void;
}) {
  const [historyStudent, setHistoryStudent] = useState<HistoryStudentTarget | null>(null);
  const s = useAdvisorDetailsState(advisorId ?? undefined);
  const { data, isLoading, isError, refetch } = s.assignmentQuery;

  useEffect(() => {
    setHistoryStudent(null);
  }, [advisorId]);

  const selectedList = () =>
    s.students.filter((st) => s.selected.has(st.id)).map((st) => ({ id: st.id, name: st.fullName }));

  const advisor = data?.advisor;
  const overBy =
    advisor && advisor.maxAdvisees !== null
      ? Math.max(0, advisor.activeStudents - advisor.maxAdvisees)
      : 0;

  return (
    <Modal open={!!advisorId} onClose={onClose} title="Advisor details & history" className="max-w-6xl">
      <div className="flex items-center justify-between gap-4 border-b border-line-soft bg-white px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          {advisor && <UserInitials name={advisor.fullName} className="size-9 shrink-0" />}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[15px] font-bold text-ink-primary">
                {advisor ? advisor.fullName : 'Advisor details & history'}
              </h2>
              {data?.status && <StatusBadge status={data.status as AdminUserStatus} />}
            </div>
            <p className="truncate text-xs text-ink-muted">{data?.email ?? advisor?.email ?? 'Loading…'}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {advisor && <LoadBadge count={advisor.activeStudents} limit={advisor.maxAdvisees} />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-subtle transition-colors hover:bg-line-soft hover:text-ink-secondary"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[82vh] space-y-3 overflow-y-auto bg-surface-page/50 p-5">
        {isLoading && <div className="h-48 animate-pulse rounded-lg bg-white" />}

        {!isLoading && (isError || !data || !advisor) && (
          <div className="rounded-lg border border-line/80 bg-white p-8 text-center text-sm text-ink-muted">
            Could not load this advisor.{' '}
            <button type="button" onClick={() => refetch()} className="font-semibold text-brand hover:underline">
              Retry
            </button>
          </div>
        )}

        {!isLoading && data && advisor && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line/80 bg-white px-4 py-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                  Cohorts
                </span>
                {s.myCohorts.length === 0 ? (
                  <span className="text-xs text-ink-subtle">None</span>
                ) : (
                  s.myCohorts.map((c) => (
                    <Link
                      key={c.cohortId}
                      to={`/admin/assignments/cohorts/${c.cohortId}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 rounded-md bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-ink ring-1 ring-inset ring-brand/25 transition-colors hover:bg-brand-soft-strong"
                    >
                      {c.label}
                      <span className="text-[11px] text-brand-ink/80 tabular-nums">· {c.students}</span>
                    </Link>
                  ))
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                  Start date
                </label>
                <input
                  type="date"
                  aria-label="Start date"
                  value={s.assignmentStartDate}
                  onChange={(e) => s.setAssignmentStartDate(e.target.value)}
                  className="h-8 rounded-lg border border-line bg-white px-2 text-xs text-ink-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                />
                <button
                  type="button"
                  onClick={s.saveDate}
                  className="h-8 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-hover"
                >
                  Save
                </button>
              </div>
            </div>

            {s.scheduleError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
                {s.scheduleError}
              </p>
            )}

            {overBy > 0 && (
              <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="size-3.5 shrink-0" />
                {overBy} student{overBy === 1 ? '' : 's'} over the advisory limit. Reassign students below or raise the limit.
              </p>
            )}

            {historyStudent ? (
              <StudentHistoryPanel student={historyStudent} onBack={() => setHistoryStudent(null)} />
            ) : (
              <AdvisorStudentsSection
                advisorId={advisor.id}
                advisorName={advisor.fullName}
                search={s.search}
                page={s.page}
                pageSize={ADVISOR_PAGE_SIZE}
                totalFiltered={s.filtered.length}
                pageRows={s.pageRows}
                selected={s.selected}
                allPageSelected={s.allPageSelected}
                onSearchChange={(val) => {
                  s.setSearch(val);
                  s.setPage(0);
                }}
                onClearSearch={() => s.setSearch('')}
                onToggleAll={s.toggleAll}
                onToggleOne={s.toggleOne}
                onSelectAllFiltered={() => s.setSelected(new Set(s.filtered.map((row) => row.id)))}
                onClearSelection={() => s.setSelected(new Set())}
                onReassignSelected={() => s.setReassign(selectedList())}
                onUnassignSelected={() => s.setUnassign(selectedList())}
                onReassignOne={(student) => s.setReassign([student])}
                onUnassignOne={(student) => s.setUnassign([student])}
                onHistoryOne={setHistoryStudent}
                onPageChange={s.setPage}
              />
            )}
          </>
        )}
      </div>

      {advisor && (
        <>
          <AssignAdvisorModal open={!!s.reassign} onClose={() => s.setReassign(null)} students={s.reassign ?? []} advisors={s.advisors.data ?? []} excludeAdvisorId={advisor.id} onDone={() => s.setSelected(new Set())} />
          <UnassignAdvisorModal students={s.unassign} onClose={() => s.setUnassign(null)} onDone={() => s.setSelected(new Set())} />
        </>
      )}
    </Modal>
  );
}
