import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '../components/StatusBadge';
import { UserInitials } from '../components/UserInitials';
import { UserDetailModal } from '../components/UserDetailModal';
import { CreateUserModal } from '../components/CreateUserModal';
import { AssignToAdvisorModal } from '../components/AssignToAdvisorModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Modal } from '../../../shared/components/ui/Modal';
import { backState } from '../../../shared/lib/backLink';
import {
  useAdminUsers,
  useChangeUserRole,
  useChangeUserStatus,
  useCohortOptions,
} from '../hooks/queries/useAdminUsers';
import { useAssignmentAdvisors } from '../hooks/queries/useAdminAssignments';
import { useCurriculumsQuery } from '../../academic/hooks/queries/useCurriculumsQuery';
import { useMajorOptions } from '../hooks/queries/useAdminDashboard';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useAuth } from '../../auth/stores/useAuth';
import type { AdminUserRole, AdminUserStatus, AdminUserSummary, UserSort } from '../types/admin';
import { STUDENT_CODE_MESSAGE, STUDENT_CODE_PATTERN } from '../../auth/validations/register.schema';
import { UserRowMenu } from '../components/UserRowMenu';
import { DataTable, type DataTableColumnDef } from '../../../shared/components/common/DataTable';
import type { PaginationState, SortingState } from '@tanstack/react-table';

const PAGE_SIZE = 10;
const ROLES: { role: AdminUserRole; label: string }[] = [
  { role: 'STUDENT', label: 'Student' },
  { role: 'ADVISOR', label: 'Advisor' },
];
const STATUSES: AdminUserStatus[] = ['ACTIVE', 'SUSPENDED'];

/** Compact select shown under a column title. */
const headerSelect =
  'h-8 w-full min-w-[104px] rounded-md border border-[#e5e7eb] bg-white px-2 text-xs font-medium normal-case text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500';

/** The backend sorts users by a whitelist; the table only offers the ones it can serve. */
function toUserSort(sorting: SortingState): UserSort {
  const active = sorting[0];
  if (!active || active.id !== 'fullName') return 'createdAt,desc';
  return active.desc ? 'fullName,desc' : 'fullName,asc';
}

export default function UserAccounts() {
  const me = useAuth((s) => s.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // Other pages link here with ?role=STUDENT or ?role=ADVISOR; the role is now a column filter.
  const roleParam = searchParams.get('role');
  const [role, setRoleState] = useState<AdminUserRole | ''>(
    ROLES.some((r) => r.role === roleParam) ? (roleParam as AdminUserRole) : '',
  );
  const setRole = (next: AdminUserRole | '') => {
    setRoleState(next);
    setSearchParams(next ? { role: next } : {}, { replace: true });
  };

  const [status, setStatus] = useState<AdminUserStatus | ''>('');
  const [majorId, setMajorId] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ ids: string[]; status: 'ACTIVE' | 'SUSPENDED'; label: string } | null>(null);
  const [roleChange, setRoleChange] = useState<AdminUserSummary | null>(null);
  const [studentCode, setStudentCode] = useState('');
  const [curriculumId, setCurriculumId] = useState('');
  const [roleError, setRoleError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [assignTo, setAssignTo] = useState<{ id: string; name: string }[] | null>(null);

  const changeStatus = useChangeUserStatus();
  const changeRole = useChangeUserRole();
  const curriculums = useCurriculumsQuery('curriculum', { status: 'ACTIVE', page: 0, size: 100 });
  const majors = useMajorOptions();
  const cohortOptionsQuery = useCohortOptions();
  const advisors = useAssignmentAdvisors();

  const cohortOptions = useMemo(() => cohortOptionsQuery.data ?? [], [cohortOptionsQuery.data]);
  // Once a major is chosen the cohort list only offers that major's cohorts.
  const selectedMajorCode = majors.data?.find((m) => m.id === majorId)?.code;
  const visibleCohorts = useMemo(
    () => (selectedMajorCode ? cohortOptions.filter((c) => c.majorCode === selectedMajorCode) : cohortOptions),
    [cohortOptions, selectedMajorCode],
  );

  const { data, isLoading, isError, refetch } = useAdminUsers({
    role: role || undefined,
    status: status || undefined,
    search: search || undefined,
    majorId: majorId || undefined,
    // A cohort is one curriculum version of a major, so its id is the backend's curriculumVersionId.
    curriculumVersionId: cohortId || undefined,
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: toUserSort(sorting),
  });

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.totalElements ?? 0;

  const hasFilters = !!role || !!status || !!search || !!majorId || !!cohortId;
  const clearFilters = () => {
    setRole('');
    setStatus('');
    setSearch('');
    setMajorId('');
    setCohortId('');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const askSetAdvisor = (rows: AdminUserSummary[]) => {
    const students = rows.filter((u) => u.role === 'STUDENT');
    if (students.length === 0) return toast.error('Select at least one student: advisors cannot be given an advisor.');
    if (students.length < rows.length) {
      const skipped = rows.length - students.length;
      toast.info(`${skipped} advisor account${skipped > 1 ? 's were' : ' was'} left out of the selection.`);
    }
    setAssignTo(students.map((u) => ({ id: u.id, name: u.fullName })));
  };

  /** Any change of the query must start again on the first page. */
  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const askBulk = (rows: AdminUserSummary[], target: 'ACTIVE' | 'SUSPENDED') => {
    let ids = rows.map((u) => u.id);
    if (target === 'SUSPENDED' && me) ids = ids.filter((id) => id !== me.id);
    if (ids.length === 0) return toast.error('Nothing to update: you cannot suspend your own account.');
    setConfirm({ ids, status: target, label: `${ids.length} selected account${ids.length > 1 ? 's' : ''}` });
  };

  const runConfirm = async () => {
    if (!confirm) return;
    try {
      const result = await changeStatus.mutateAsync({ ids: confirm.ids, status: confirm.status });
      toast.success(
        `${result.updated} account${result.updated === 1 ? '' : 's'} ${confirm.status === 'ACTIVE' ? 'activated' : 'suspended'}.`
      );
    } catch {
      // The global API error handler already shows a toast.
    } finally {
      setConfirm(null);
    }
  };

  const openRoleChange = (user: AdminUserSummary) => {
    setRoleChange(user);
    setStudentCode('');
    setCurriculumId('');
    setRoleError(null);
  };

  const runRoleChange = async () => {
    if (!roleChange) return;
    const target = roleChange.role === 'STUDENT' ? 'ADVISOR' : 'STUDENT';
    const curriculum = curriculums.data?.items.find((item) => item.id === curriculumId);
    if (target === 'STUDENT' && (!STUDENT_CODE_PATTERN.test(studentCode.trim().toUpperCase()) || !curriculum)) {
      setRoleError(`${STUDENT_CODE_MESSAGE}. Then select a curriculum.`);
      return;
    }
    try {
      await changeRole.mutateAsync({
        id: roleChange.id,
        role: target,
        studentCode: target === 'STUDENT' ? studentCode.trim().toUpperCase() : undefined,
        curriculumVersionId: target === 'STUDENT' ? curriculum?.id : undefined,
        enrollmentSemesterId: target === 'STUDENT' ? curriculum?.effectiveFromSemesterId : undefined,
      });
      toast.success(`${roleChange.fullName} is now a ${target === 'STUDENT' ? 'Student' : 'Advisor'}.`);
      setRoleChange(null);
    } catch (error) {
      setRoleError(apiErrorMessage(error));
    }
  };

  const columns = useMemo<DataTableColumnDef<AdminUserSummary>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Full Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <UserInitials name={row.original.fullName} />
            <span className="font-semibold text-[#151c27]">{row.original.fullName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        enableSorting: false,
        cell: ({ row }) => <span className="text-[#555f6f]">{row.original.email}</span>,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        enableSorting: false,
        meta: {
          headerFilter: (
            <select
              value={role}
              onChange={(e) => {
                resetPage(setRole)(e.target.value as AdminUserRole | '');
              }}
              aria-label="Filter by role"
              className={headerSelect}
            >
              <option value="">All</option>
              {ROLES.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.label}
                </option>
              ))}
            </select>
          ),
        },
        cell: ({ row }) => (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-600">
            {row.original.role}
          </span>
        ),
      },
      {
        id: 'major',
        header: 'Major',
        enableSorting: false,
        accessorFn: (user) => user.majorCode ?? '',
        meta: {
          headerFilter: (
            <select
              value={majorId}
              onChange={(e) => {
                resetPage(setMajorId)(e.target.value);
                // The cohort list follows the major, so a cohort of another major no longer applies.
                setCohortId('');
              }}
              aria-label="Filter by major"
              className={headerSelect}
            >
              <option value="">All</option>
              {(majors.data ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code}
                </option>
              ))}
            </select>
          ),
        },
        cell: ({ row }) => <span className="text-[#555f6f]">{row.original.majorCode || '—'}</span>,
      },
      {
        id: 'cohort',
        header: 'Cohort',
        enableSorting: false,
        accessorFn: (user) => user.cohort ?? '',
        meta: {
          headerFilter: (
            <select
              value={cohortId}
              onChange={(e) => resetPage(setCohortId)(e.target.value)}
              aria-label="Filter by cohort"
              className={headerSelect}
            >
              <option value="">All</option>
              {visibleCohorts.map((c) => (
                <option key={c.cohortId} value={c.cohortId}>
                  {c.majorCode} {c.cohort}
                </option>
              ))}
            </select>
          ),
        },
        cell: ({ row }) => <span className="text-[#555f6f]">{row.original.cohort || '—'}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        meta: {
          headerFilter: (
            <select
              value={status}
              onChange={(e) => resetPage(setStatus)(e.target.value as AdminUserStatus | '')}
              aria-label="Filter by status"
              className={headerSelect}
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          ),
        },
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex justify-end">
              <UserRowMenu
                user={user}
                isSelf={user.id === me?.id}
                onView={() => setDetailId(user.id)}
                onRole={() => openRoleChange(user)}
                onAssignments={
                  user.role === 'ADVISOR'
                    ? () => navigate(`/admin/assignments/advisors/${user.id}`, {
                        state: backState('/admin/users?role=ADVISOR', 'User Accounts'),
                      })
                    : undefined
                }
                onToggle={() =>
                  setConfirm({
                    ids: [user.id],
                    status: user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED',
                    label: user.fullName,
                  })
                }
              />
            </div>
          );
        },
      },
    ],
    // resetPage only calls state setters, so it never changes the result of a render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [me?.id, navigate, role, status, majorId, cohortId, majors.data, visibleCohorts],
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#151c27]">User Accounts</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="size-4" /> Create user
        </button>
      </div>

      {isError && !data && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load accounts.{' '}
          <button type="button" onClick={() => refetch()} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      <section className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <DataTable
          manual
          columns={columns}
          data={items}
          searchKey="fullName"
          searchValue={search}
          searchPlaceholder="Search by ID, name, or email..."
          emptyText={hasFilters ? 'No accounts match your filters.' : 'No accounts yet.'}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          totalRowCount={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          onSearchChange={resetPage(setSearch)}
          filters={
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
            >
              Clear filters
            </button>
          }
          bulkActions={(selectedRows) => (
            <>
              <button
                type="button"
                onClick={() => askSetAdvisor(selectedRows)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#fff7ed] px-4 py-2 text-sm font-semibold text-[#c2410c] hover:bg-orange-100"
              >
                <UserCheck className="size-4" aria-hidden />
                Set advisor
              </button>
              <button
                type="button"
                onClick={() => askBulk(selectedRows, 'SUSPENDED')}
                className="rounded-lg bg-[#fef2f2] px-4 py-2 text-sm font-semibold text-[#b91c1c] hover:bg-red-100"
              >
                Suspend
              </button>
              <button
                type="button"
                onClick={() => askBulk(selectedRows, 'ACTIVE')}
                className="rounded-lg bg-[#ecfdf5] px-4 py-2 text-sm font-semibold text-[#047857] hover:bg-emerald-100"
              >
                Activate
              </button>
            </>
          )}
        />
      </section>

      <UserDetailModal userId={detailId} onClose={() => setDetailId(null)} />

      <AssignToAdvisorModal
        open={!!assignTo}
        onClose={() => setAssignTo(null)}
        students={assignTo ?? []}
        advisors={advisors.data ?? []}
        onDone={() => refetch()}
      />

      <CreateUserModal
        open={creating}
        defaultRole={role || 'STUDENT'}
        onClose={() => setCreating(false)}
        onCreated={async (name) => {
          toast.success(`${name} was added.`);
          setCreating(false);
          await refetch();
        }}
      />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.status === 'SUSPENDED' ? 'Suspend accounts?' : 'Activate accounts?'}
        message={
          confirm?.status === 'SUSPENDED'
            ? `${confirm.label} will lose access to FAAPS immediately.`
            : `${confirm?.label ?? ''} will be able to sign in again.`
        }
        confirmLabel={confirm?.status === 'SUSPENDED' ? 'Suspend' : 'Activate'}
        destructive={confirm?.status === 'SUSPENDED'}
        isLoading={changeStatus.isPending}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />

      <Modal open={!!roleChange} onClose={() => !changeRole.isPending && setRoleChange(null)} title="Change user role" className="max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#151c27]">
            Set Role: {roleChange?.role === 'STUDENT' ? 'Advisor' : 'Student'}?
          </h2>
          <p className="mt-2 text-sm text-[#555f6f]">
            Confirm changing {roleChange?.fullName} from {roleChange?.role === 'STUDENT' ? 'Student to Advisor' : 'Advisor to Student'}.
          </p>
          {roleChange?.role === 'ADVISOR' && (
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-[#151c27]">Student ID
                <input value={studentCode} onChange={(event) => setStudentCode(event.target.value.toUpperCase())}
                  placeholder="SE173012 or IA173012" maxLength={8}
                  className="mt-1 w-full rounded-lg border border-[#e5e7eb] px-3 py-2 outline-none focus:border-orange-500" />
              </label>
              <label className="block text-sm font-medium text-[#151c27]">Curriculum
                <select value={curriculumId} onChange={(event) => setCurriculumId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 outline-none focus:border-orange-500">
                  <option value="">Select curriculum...</option>
                  {(curriculums.data?.items ?? []).map((item) => (
                    <option key={item.id} value={item.id}>{item.majorCode} {item.version} · {item.name}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {roleError && <p role="alert" className="mt-3 text-sm text-red-600">{roleError}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" disabled={changeRole.isPending} onClick={() => setRoleChange(null)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold">Cancel</button>
            <button type="button" disabled={changeRole.isPending} onClick={runRoleChange} className="rounded-lg bg-[#047857] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {changeRole.isPending ? 'Changing...' : 'Confirm role change'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
