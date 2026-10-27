import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '../components/StatusBadge';
import { UserInitials } from '../components/UserInitials';
import { UserDetailModal } from '../components/UserDetailModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Modal } from '../../../shared/components/ui/Modal';
import { Pagination } from '../components/Pagination';
import { backState } from '../../../shared/lib/backLink';
import { useAdminUsers, useChangeUserRole, useChangeUserStatus, useRoleCount } from '../hooks/queries/useAdminUsers';
import { useCurriculumsQuery } from '../../academic/hooks/queries/useCurriculumsQuery';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useAuth } from '../../auth/stores/useAuth';
import type { AdminUserRole, AdminUserStatus, AdminUserSummary, UserSort } from '../types/admin';
import { cn } from '@/shared/lib/utils';
import { adminService } from '../services/adminService';
import { UserRowMenu } from '../components/UserRowMenu';

const PAGE_SIZE = 10;
const TABS: { role: AdminUserRole; label: string }[] = [
  { role: 'STUDENT', label: 'Student' },
  { role: 'ADVISOR', label: 'Advisor' },
];
const STATUSES: AdminUserStatus[] = ['ACTIVE', 'SUSPENDED'];

type SortField = 'userId' | 'fullName';

function TabButton({ role, label, active, onClick }: { role: AdminUserRole; label: string; active: boolean; onClick: () => void }) {
  const { data: count } = useRoleCount(role);
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-md border-b-2 px-3 py-2 text-sm font-semibold',
        active ? 'border-[#f37021] bg-[#fff7ed] text-[#f37021]' : 'border-transparent text-[#555f6f] hover:bg-gray-50'
      )}
    >
      {label}
      <span className="text-xs font-bold">{count ?? '–'}</span>
    </button>
  );
}

export default function UserAccounts() {
  const me = useAuth((s) => s.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const roleParam = searchParams.get('role');
  const role: AdminUserRole = TABS.some((t) => t.role === roleParam) ? (roleParam as AdminUserRole) : 'STUDENT';
  const setRole = (next: AdminUserRole) => setSearchParams(next === 'STUDENT' ? {} : { role: next }, { replace: true });
  const [status, setStatus] = useState<AdminUserStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<UserSort>('createdAt,desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ ids: string[]; status: 'ACTIVE' | 'SUSPENDED'; label: string } | null>(null);
  const [roleChange, setRoleChange] = useState<AdminUserSummary | null>(null);
  const [studentCode, setStudentCode] = useState('');
  const [curriculumId, setCurriculumId] = useState('');
  const [roleError, setRoleError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ role: 'STUDENT' as AdminUserRole, email: '', fullName: '', studentCode: '', curriculumId: '', maxAdvisees: '30' });
  const [createError, setCreateError] = useState('');

  const debouncedSearch = useDebounce(search.trim());
  const { data, isLoading, isError, refetch } = useAdminUsers({
    role,
    status: status || undefined,
    search: debouncedSearch || undefined,
    page,
    size: PAGE_SIZE,
    sort,
  });
  const changeStatus = useChangeUserStatus();
  const changeRole = useChangeUserRole();
  const curriculums = useCurriculumsQuery('curriculum', { status: 'ACTIVE', page: 0, size: 100 });

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.totalElements ?? 0;

  // Selection only makes sense for the rows currently shown.
  useEffect(() => setSelected(new Set()), [role, status, debouncedSearch, page, sort]);

  const allSelected = items.length > 0 && items.every((u) => selected.has(u.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((u) => u.id)));
  const toggleOne = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const hasFilters = !!status || !!search;
  const clearFilters = () => {
    setStatus('');
    setSearch('');
    setPage(0);
  };

  const sortField = sort.split(',')[0] as SortField | 'createdAt';
  const sortDir = sort.split(',')[1];
  const toggleSort = (field: SortField) => {
    setPage(0);
    setSort(sortField === field && sortDir === 'asc' ? (`${field},desc` as UserSort) : (`${field},asc` as UserSort));
  };
  const SortIcon = ({ field }: { field: SortField }) =>
    sortField !== field ? (
      <ArrowUpDown className="size-3 text-[#98a2b3]" />
    ) : sortDir === 'asc' ? (
      <ArrowUp className="size-3 text-orange-600" />
    ) : (
      <ArrowDown className="size-3 text-orange-600" />
    );

  const askBulk = (target: 'ACTIVE' | 'SUSPENDED') => {
    let ids = items.filter((u) => selected.has(u.id)).map((u) => u.id);
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
      setSelected(new Set());
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

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold text-[#151c27]">User Accounts</h1><button type="button" onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white"><Plus className="size-4" /> Create user</button></div>

      <section className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <div role="tablist" aria-label="Account type" className="flex gap-1">
          {TABS.map((t) => (
            <TabButton
              key={t.role}
              role={t.role}
              label={t.label}
              active={role === t.role}
              onClick={() => {
                setRole(t.role);
                setPage(0);
              }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
            <Search className="size-4 text-[#98a2b3]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search by ID, name, or email..."
              aria-label="Search accounts"
              className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
            />
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as AdminUserStatus | '');
              setPage(0);
            }}
            aria-label="Filter by status"
            className="h-[38px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="">Status: All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                Status: {s.charAt(0) + s.slice(1).toLowerCase()}
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
        </div>
      </section>

      <section className="rounded-xl bg-white shadow-sm">
        {selected.size > 0 && (
          <div className="flex flex-col items-start justify-between gap-3 border-b border-[#e7eefe] p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#f37021] px-2.5 py-1 text-xs font-bold text-white">{selected.size} selected</span>
              <span className="text-[13px] text-[#555f6f]">Apply bulk actions to the selected accounts.</span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => askBulk('SUSPENDED')} className="rounded-lg bg-[#fef2f2] px-4 py-2 text-sm font-semibold text-[#b91c1c] hover:bg-red-100">
                Suspend
              </button>
              <button type="button" onClick={() => askBulk('ACTIVE')} className="rounded-lg bg-[#ecfdf5] px-4 py-2 text-sm font-semibold text-[#047857] hover:bg-emerald-100">
                Activate
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-[rgba(240,243,255,0.7)]">
              <tr>
                <th className="w-12 px-4 py-3.5">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all accounts on this page" className="size-4 accent-[#f37021]" />
                </th>
                <th className="px-3 py-3.5" aria-sort={sortField === 'userId' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" onClick={() => toggleSort('userId')} className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
                    User ID <SortIcon field="userId" />
                  </button>
                </th>
                <th className="px-3 py-3.5" aria-sort={sortField === 'fullName' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" onClick={() => toggleSort('fullName')} className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
                    Full Name <SortIcon field="fullName" />
                  </button>
                </th>
                <th className="px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Email</th>
                <th className="px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Status</th>
                <th className="px-3 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-[#e7eefe]">
                    <td colSpan={6} className="px-4 py-5">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : isError && !data ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    Could not load accounts.{' '}
                    <button type="button" onClick={() => refetch()} className="font-semibold text-orange-600 hover:underline">
                      Retry
                    </button>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    {hasFilters ? 'No accounts match your filters.' : 'No accounts yet.'}
                  </td>
                </tr>
              ) : (
                items.map((u) => (
                  <tr key={u.id} className={cn('border-t border-[#e7eefe] hover:bg-gray-50/60', selected.has(u.id) && 'bg-[#fff7ed]/40')}>
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleOne(u.id)} aria-label={`Select ${u.fullName}`} className="size-4 accent-[#f37021]" />
                    </td>
                    <td className="px-3 py-3.5 text-[13px] font-semibold text-[#151c27]">{u.userId}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2.5 text-left text-sm font-semibold text-[#151c27]">
                        <UserInitials name={u.fullName} />
                        {u.fullName}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-[13px] text-[#555f6f]">{u.email}</td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <UserRowMenu
                        user={u}
                        isSelf={u.id === me?.id}
                        onView={() => setDetailId(u.id)}
                        onRole={() => openRoleChange(u)}
                        onAssignments={u.role === 'ADVISOR' ? () => navigate(`/admin/assignments/advisors/${u.id}`, { state: backState('/admin/users?role=ADVISOR', 'User Accounts · Advisor tab') }) : undefined}
                        onToggle={() =>
                          setConfirm({
                            ids: [u.id],
                            status: u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED',
                            label: u.fullName,
                          })
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} noun="accounts" onChange={setPage} />
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
