import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '../components/StatusBadge';
import { UserInitials } from '../components/UserInitials';
import { UserDetailModal } from '../components/UserDetailModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Modal } from '../../../shared/components/ui/Modal';
import { backState } from '../../../shared/lib/backLink';
import {
  useAdminUsers,
  useChangeUserRole,
  useChangeUserStatus,
  useCohortOptions,
  useRoleCount,
} from '../hooks/queries/useAdminUsers';
import { useCurriculumsQuery } from '../../academic/hooks/queries/useCurriculumsQuery';
import { useMajorOptions } from '../hooks/queries/useAdminDashboard';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useAuth } from '../../auth/stores/useAuth';
import type { AdminUserRole, AdminUserStatus, AdminUserSummary, UserSort } from '../types/admin';
import { adminService } from '../services/adminService';
import { UserRowMenu } from '../components/UserRowMenu';
import { DataTable, type DataTableColumnDef } from '../../../shared/components/common/DataTable';
import type { PaginationState, SortingState } from '@tanstack/react-table';

const PAGE_SIZE = 10;
const TABS: { role: AdminUserRole; label: string }[] = [
  { role: 'STUDENT', label: 'Student' },
  { role: 'ADVISOR', label: 'Advisor' },
];
const STATUSES: AdminUserStatus[] = ['ACTIVE', 'SUSPENDED'];

const selectClass =
  'h-[38px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500';

function TabButton({ role, label, active, onClick }: { role: AdminUserRole; label: string; active: boolean; onClick: () => void }) {
  const { data: count } = useRoleCount(role);
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        'flex items-center gap-1.5 rounded-md border-b-2 px-3 py-2 text-sm font-semibold',
        active ? 'border-[#f37021] bg-[#fff7ed] text-[#f37021]' : 'border-transparent text-[#555f6f] hover:bg-gray-50',
      ].join(' ')}
    >
      {label}
      <span className="text-xs font-bold">{count ?? '–'}</span>
    </button>
  );
}

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
  const roleParam = searchParams.get('role');
  const role: AdminUserRole = TABS.some((t) => t.role === roleParam) ? (roleParam as AdminUserRole) : 'STUDENT';
  const setRole = (next: AdminUserRole) =>
    setSearchParams(next === 'STUDENT' ? {} : { role: next }, { replace: true });

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
  const [createForm, setCreateForm] = useState({ role: 'STUDENT' as AdminUserRole, email: '', fullName: '', studentCode: '', curriculumId: '', maxAdvisees: '30' });
  const [createError, setCreateError] = useState('');

  const changeStatus = useChangeUserStatus();
  const changeRole = useChangeUserRole();
  const curriculums = useCurriculumsQuery('curriculum', { status: 'ACTIVE', page: 0, size: 100 });
  const majors = useMajorOptions();
  const cohortOptionsQuery = useCohortOptions();

  const cohortOptions = useMemo(() => cohortOptionsQuery.data ?? [], [cohortOptionsQuery.data]);
  const cohortOptionsById = useMemo(
    () => new Map(cohortOptions.map((c) => [c.cohortId, c])),
    [cohortOptions],
  );

  /**
   * A cohort is one version (K19) of a major, so it narrows the account list
   * down to the major it belongs to. The backend filters users by `majorId`.
   */
  const cohortMajorId = useMemo(() => {
    if (!cohortId) return '';
    const majorCode = cohortOptionsById.get(cohortId)?.majorCode;
    if (!majorCode) return '';
    return majors.data?.find((m) => m.code === majorCode)?.id ?? '';
  }, [cohortId, cohortOptionsById, majors.data]);

  const effectiveMajorId = cohortMajorId || majorId;

  const { data, isLoading, isError, refetch } = useAdminUsers({
    role,
    status: status || undefined,
    search: search || undefined,
    majorId: effectiveMajorId || undefined,
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: toUserSort(sorting),
  });

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.totalElements ?? 0;

  const hasFilters = !!status || !!search || !!majorId || !!cohortId;
  const clearFilters = () => {
    setStatus('');
    setSearch('');
    setMajorId('');
    setCohortId('');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
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
    if (target === 'STUDENT' && (!/^(SE|IA)1\d{5}$/.test(studentCode.trim().toUpperCase()) || !curriculum)) {
      setRoleError('Enter a Student ID like SE173012 or IA173012 and select a curriculum.');
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

  const createUser = async () => {
    const curriculum = curriculums.data?.items.find((item) => item.id === createForm.curriculumId);
    if (!createForm.fullName.trim() || !createForm.email.trim()) return setCreateError('Full name and email are required.');
    if (createForm.role === 'STUDENT' && (!/^(SE|IA)1\d{5}$/.test(createForm.studentCode) || !curriculum)) {
      return setCreateError('Student ID must match SE173012/IA173012 and a curriculum is required.');
    }
    try {
      await adminService.createUser({
        role: createForm.role, email: createForm.email.trim(), fullName: createForm.fullName.trim(),
        studentCode: createForm.role === 'STUDENT' ? createForm.studentCode : undefined,
        curriculumVersionId: curriculum?.id, enrollmentSemesterId: curriculum?.effectiveFromSemesterId,
        currentSemester: createForm.role === 'STUDENT' ? 1 : undefined,
        maxAdvisees: createForm.role === 'ADVISOR' ? Number(createForm.maxAdvisees) : undefined,
      });
      toast.success('User account created.');
      setCreating(false); setCreateError('');
      setCreateForm({ role: 'STUDENT', email: '', fullName: '', studentCode: '', curriculumId: '', maxAdvisees: '30' });
      await refetch();
    } catch (error) { setCreateError(apiErrorMessage(error)); }
  };

  const columns = useMemo<DataTableColumnDef<AdminUserSummary>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Họ tên',
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
        cell: ({ row }) => (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-600">
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        enableSorting: false,
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
                        state: backState('/admin/users?role=ADVISOR', 'User Accounts · Advisor tab'),
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
    [me?.id, navigate],
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

      <section className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <div role="tablist" aria-label="Account type" className="flex gap-1">
          {TABS.map((t) => (
            <TabButton
              key={t.role}
              role={t.role}
              label={t.label}
              active={role === t.role}
              onClick={() => {
                setRole(t.role);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            />
          ))}
        </div>
      </section>

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
            <>
              <select
                value={status}
                onChange={(e) => resetPage(setStatus)(e.target.value as AdminUserStatus | '')}
                aria-label="Filter by status"
                className={selectClass}
              >
                <option value="">Status: All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    Status: {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>

              <select
                value={majorId}
                onChange={(e) => {
                  resetPage(setMajorId)(e.target.value);
                  // The cohort filter already narrows to a major; the two are exclusive.
                  setCohortId('');
                }}
                aria-label="Filter by major"
                className={selectClass}
              >
                <option value="">Major: All</option>
                {(majors.data ?? []).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name}
                  </option>
                ))}
              </select>

              <select
                value={cohortId}
                onChange={(e) => {
                  resetPage(setCohortId)(e.target.value);
                  // A cohort belongs to one major, so the major filter is redundant.
                  setMajorId('');
                }}
                aria-label="Filter by cohort"
                className={selectClass}
              >
                <option value="">Cohort: All</option>
                {cohortOptions.map((c) => (
                  <option key={c.cohortId} value={c.cohortId}>
                    {c.majorCode} {c.cohort} ({c.students})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasFilters}
                className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
              >
                Clear filters
              </button>
            </>
          }
          bulkActions={(selectedRows) => (
            <>
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

      <Modal open={creating} onClose={() => setCreating(false)} title="Create user" className="max-w-lg">
        <div className="space-y-4 p-6">
          <label className="block text-sm font-medium">Role<select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as AdminUserRole })} className="mt-1 w-full rounded-lg border p-2"><option value="STUDENT">Student</option><option value="ADVISOR">Advisor</option></select></label>
          <label className="block text-sm font-medium">Full name<input value={createForm.fullName} onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label>
          <label className="block text-sm font-medium">Email<input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label>
          {createForm.role === 'STUDENT' ? <>
            <label className="block text-sm font-medium">Student ID<input value={createForm.studentCode} maxLength={8} onChange={(e) => setCreateForm({ ...createForm, studentCode: e.target.value.toUpperCase() })} placeholder="SE173012" className="mt-1 w-full rounded-lg border p-2" /></label>
            <label className="block text-sm font-medium">Curriculum<select value={createForm.curriculumId} onChange={(e) => setCreateForm({ ...createForm, curriculumId: e.target.value })} className="mt-1 w-full rounded-lg border p-2"><option value="">Select curriculum...</option>{(curriculums.data?.items ?? []).map((item) => <option key={item.id} value={item.id}>{item.majorCode} {item.version} · {item.name}</option>)}</select></label>
          </> : <label className="block text-sm font-medium">Maximum advisees<input type="number" min="1" value={createForm.maxAdvisees} onChange={(e) => setCreateForm({ ...createForm, maxAdvisees: e.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label>}
          {createError && <p role="alert" className="text-sm text-red-600">{createError}</p>}
          <div className="flex justify-end gap-2"><button onClick={() => setCreating(false)} className="rounded-lg bg-gray-100 px-4 py-2">Cancel</button><button onClick={createUser} className="rounded-lg bg-[#f37021] px-4 py-2 font-semibold text-white">Create user</button></div>
        </div>
      </Modal>

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
