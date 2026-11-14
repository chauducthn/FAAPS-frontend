// Admin · User Accounts.
//
// The list of every account in FAAPS: students and advisors. The screen is
// an Operate surface — the admin comes here to find an account, change its
// state, move a role or hand students to an advisor, so everything is
// reachable from the table and the floating bulk-action bar.
//
// The layout follows the Curriculum / Cohort console: a flat header, a KPI
// strip of three equal cards, a filter card and the list card.

import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  ChevronDown,
  CircleAlert,
  GraduationCap,
  KeyRound,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '../components/StatusBadge';
import { UserInitials } from '../components/UserInitials';
import { UserDetailModal } from '../components/UserDetailModal';
import { CreateUserModal } from '../components/CreateUserModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { SetRoleModal } from '../components/SetRoleModal';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import { UserRowMenu } from '../components/UserRowMenu';
import { backState } from '../../../shared/lib/backLink';
import {
  useAdminUsers,
  useChangeUserStatus,
  useCohortOptions,
  useRoleCount,
} from '../hooks/queries/useAdminUsers';
import { useMajorOptions } from '../hooks/queries/useAdminDashboard';
import { DataTable, type DataTableColumnDef } from '../../../shared/components/common/DataTable';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useAuth } from '../../auth/stores/useAuth';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { cn } from '@/shared/lib/utils';
import type { AdminUserRole, AdminUserStatus, AdminUserSummary, UserSort } from '../types/admin';

const PAGE_SIZE = 10;

const ROLES: AdminUserRole[] = ['STUDENT', 'ADVISOR'];

const STATUSES: AdminUserStatus[] = ['ACTIVE', 'SUSPENDED', 'LOCKED', 'INACTIVE'];

const ROLE_LABEL: Record<AdminUserRole, string> = {
  STUDENT: 'Student',
  ADVISOR: 'Advisor',
};

/**
 * The filter bar, styled like the rest of the admin console: a quiet surface,
 * a hairline border and the FPT orange for focus.
 */
const selectClass =
  'appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';

/** The backend sorts users by a whitelist; the table only offers the ones it can serve. */
function toUserSort(sorting: SortingState): UserSort {
  const active = sorting[0];
  if (!active || active.id !== 'fullName') return 'createdAt,desc';
  return active.desc ? 'fullName,desc' : 'fullName,asc';
}

export default function UserAccounts() {
  const me = useAuth((s) => s.user);
  const navigate = useNavigate();
  // Other screens link here with ?role=STUDENT or ?role=ADVISOR (for example the back link of an advisor page).
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const [role, setRole] = useState<AdminUserRole | ''>(
    ROLES.includes(roleParam as AdminUserRole) ? (roleParam as AdminUserRole) : '',
  );
  const [status, setStatus] = useState<AdminUserStatus | ''>('');
  const [majorId, setMajorId] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ ids: string[]; status: 'ACTIVE' | 'SUSPENDED'; label: string } | null>(null);
  const [roleChange, setRoleChange] = useState<AdminUserSummary | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetPasswordFor, setResetPasswordFor] = useState<{ id: string; fullName: string }[] | null>(null);

  const changeStatus = useChangeUserStatus();
  const majors = useMajorOptions();
  const cohortOptionsQuery = useCohortOptions();
  const studentCount = useRoleCount('STUDENT');
  const advisorCount = useRoleCount('ADVISOR');

  // The list is queried by the server, so the search term is debounced.
  const debouncedSearch = useDebounce(search.trim(), 300);

  const cohortOptions = useMemo(() => cohortOptionsQuery.data ?? [], [cohortOptionsQuery.data]);

  const { data, isLoading, isError, isFetching, refetch } = useAdminUsers({
    role: role || undefined,
    status: status || undefined,
    search: debouncedSearch || undefined,
    majorId: majorId || undefined,
    // A cohort is one curriculum version (K19) of a major: filter by that exact version, not by the whole major.
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

  /** Any change of the query must start again on the first page. */
  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const askBulk = (rows: AdminUserSummary[], target: 'ACTIVE' | 'SUSPENDED') => {
    let ids = rows.map((u) => u.id);
    // The admin cannot suspend their own account.
    if (target === 'SUSPENDED' && me) ids = ids.filter((id) => id !== me.id);
    if (ids.length === 0) {
      toast.error('Nothing to update: you cannot suspend your own account.');
      return;
    }
    setConfirm({ ids, status: target, label: `${ids.length} selected account${ids.length > 1 ? 's' : ''}` });
  };

  const runConfirm = async () => {
    if (!confirm) return;
    try {
      const result = await changeStatus.mutateAsync({ ids: confirm.ids, status: confirm.status });
      toast.success(
        `${result.updated} account${result.updated === 1 ? '' : 's'} ${confirm.status === 'ACTIVE' ? 'activated' : 'suspended'}.`,
      );
    } catch {
      // The global API error handler already shows a toast.
    } finally {
      setConfirm(null);
    }
  };

  const columns = useMemo<DataTableColumnDef<AdminUserSummary>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Full Name',
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <UserInitials name={row.original.fullName} />
            <span className="truncate font-semibold text-gray-900">{row.original.fullName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'userId',
        header: 'Identifier',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-md bg-gray-900 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
            {row.original.userId}
          </span>
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
        cell: ({ row }) =>
          row.original.role === 'STUDENT' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold text-[#9a3412] ring-1 ring-inset ring-orange-200">
              <GraduationCap className="size-3" aria-hidden />
              Student
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold text-indigo-800 ring-1 ring-inset ring-indigo-200">
              <UserRound className="size-3" aria-hidden />
              Advisor
            </span>
          ),
      },
      {
        id: 'major',
        header: 'Major',
        enableSorting: false,
        accessorFn: (user) => user.majorCode ?? '',
        cell: ({ row }) => <span className="text-[#555f6f]">{row.original.majorCode || '—'}</span>,
      },
      {
        id: 'cohort',
        header: 'Cohort',
        enableSorting: false,
        accessorFn: (user) => user.cohort ?? '',
        cell: ({ row }) => <span className="text-[#555f6f]">{row.original.cohort || '—'}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
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
                onRole={() => setRoleChange(user)}
                onResetPassword={() => setResetPasswordFor([{ id: user.id, fullName: user.fullName }])}
                onAssignments={
                  user.role === 'ADVISOR'
                    ? () =>
                        navigate(`/admin/assignments/advisors/${user.id}`, {
                          state: backState('/admin/users?role=ADVISOR', 'User Accounts · Advisor filter'),
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
    [navigate, me?.id],
  );

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
            <Users className="size-5.5" />
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900">User Accounts</h1>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:-translate-y-px hover:bg-[#e05f14] hover:shadow-[0_4px_14px_rgba(242,111,33,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50 active:translate-y-0"
        >
          <Plus className="size-4" strokeWidth={2.5} /> Create user
        </button>
      </div>

      {/* KPI strip — three equal cards, one accent for all three. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi
          icon={<GraduationCap className="size-4" />}
          label="Students"
          value={String(studentCount.data ?? '—')}
          hint="accounts"
        />
        <Kpi
          icon={<UserRound className="size-4" />}
          label="Advisors"
          value={String(advisorCount.data ?? '—')}
          hint="accounts"
        />
        <Kpi
          icon={<ShieldCheck className="size-4" />}
          label="Matching"
          value={String(total)}
          hint="current filters"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(e) => resetPage(setSearch)(e.target.value)}
              placeholder="Search by ID, name, or email..."
              aria-label="Search accounts"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20"
            />
          </div>
          <div className="flex flex-wrap gap-3 sm:flex-row">
            <div className="relative">
              <select
                value={role}
                onChange={(e) => resetPage(setRole)(e.target.value as AdminUserRole | '')}
                aria-label="Filter by role"
                className={`${selectClass} w-full sm:w-40`}
              >
                <option value="">Role: All</option>
                {(Object.keys(ROLE_LABEL) as AdminUserRole[]).map((r) => (
                  <option key={r} value={r}>
                    Role: {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => resetPage(setStatus)(e.target.value as AdminUserStatus | '')}
                aria-label="Filter by status"
                className={`${selectClass} w-full sm:w-44`}
              >
                <option value="">Status: All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    Status: {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={majorId}
                onChange={(e) => {
                  resetPage(setMajorId)(e.target.value);
                  // The cohort filter already narrows to a major; the two are exclusive.
                  setCohortId('');
                }}
                aria-label="Filter by major"
                className={`${selectClass} w-full sm:w-52`}
              >
                <option value="">Major: All</option>
                {(majors.data ?? []).map((m) => (
                  <option key={m.id} value={m.id}>
                    Major: {m.code} — {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={cohortId}
                onChange={(e) => {
                  resetPage(setCohortId)(e.target.value);
                  // A cohort belongs to one major, so the major filter is redundant.
                  setMajorId('');
                }}
                aria-label="Filter by cohort"
                className={`${selectClass} w-full sm:w-48`}
              >
                <option value="">Cohort: All</option>
                {cohortOptions.map((c) => (
                  <option key={c.cohortId} value={c.cohortId}>
                    Cohort: {c.majorCode} {c.cohort} ({c.students})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3.5 py-2.5 text-xs font-bold text-gray-500 transition-colors hover:border-[#F26F21] hover:text-[#C2410C]"
              >
                <RotateCcw className="size-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        {isError && !data ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <CircleAlert className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">Could not load accounts</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
                The list failed to load. Check your connection, then try again — your filters are kept.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
            >
              <RotateCcw className="size-3.5" /> Retry
            </button>
          </div>
        ) : (
          <>
            <div className="relative">
              {isFetching && !isLoading && (
                <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-orange-100">
                  <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-[#F26F21]" />
                </div>
              )}
              <DataTable
                manual
                columns={columns}
                data={items}
                searchKey="fullName"
                showSearch={false}
                emptyText={hasFilters ? 'No accounts match your filters.' : 'No accounts yet.'}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                totalRowCount={total}
                pagination={pagination}
                onPaginationChange={setPagination}
                sorting={sorting}
                onSortingChange={setSorting}
                showPageSizeSelect={false}
                showPageJump
                bulkActions={(selectedRows) => (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setResetPasswordFor(
                          selectedRows.map((row) => ({ id: row.id, fullName: row.fullName })),
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#151c27] ring-1 ring-[#e5e7eb] transition-colors hover:bg-gray-50"
                    >
                      <KeyRound className="size-4" aria-hidden /> Reset password
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
            </div>
          </>
        )}
      </div>

      <UserDetailModal userId={detailId} onClose={() => setDetailId(null)} />

      <CreateUserModal
        open={creating}
        defaultRole={role === 'ADVISOR' ? 'ADVISOR' : 'STUDENT'}
        onClose={() => setCreating(false)}
        onCreated={async (name) => {
          toast.success(`${name} was added.`);
          setCreating(false);
          await refetch();
        }}
      />

      <SetRoleModal
        open={!!roleChange}
        user={roleChange}
        onClose={() => setRoleChange(null)}
        onDone={() => void refetch()}
      />

      <ResetPasswordModal
        open={!!resetPasswordFor}
        users={resetPasswordFor ?? []}
        onClose={() => setResetPasswordFor(null)}
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

      <style>{`@keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>
    </div>
  );
}

/** The search icon of the filter bar, drawn once and reused. */
function SearchIcon() {
  return (
    <Search
      aria-hidden
      className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400"
    />
  );
}

/**
 * One KPI card of the strip. Every card carries the same white surface, the
 * same hairline border and the same light-orange accent tile, so no card
 * reads as "the highlighted one".
 */
function Kpi({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#C2410C]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-lg font-extrabold tabular-nums leading-tight text-gray-900">
          {value} <span className="text-[11px] font-medium text-gray-500">{hint}</span>
        </p>
      </div>
    </div>
  );
}
