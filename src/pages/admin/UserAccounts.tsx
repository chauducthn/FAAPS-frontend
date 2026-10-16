import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Search } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { UserAvatar } from '../../components/admin/UserAvatar';
import { UserDetailModal } from '../../components/admin/UserDetailModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useAdminUsers, useChangeUserStatus, useRoleCount } from '../../hooks/queries/useAdminUsers';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../stores/useAuth';
import type { AdminUserRole, AdminUserStatus, AdminUserSummary, UserSort } from '../../types/admin';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;
const TABS: { role: AdminUserRole; label: string }[] = [
  { role: 'STUDENT', label: 'Student' },
  { role: 'ADVISOR', label: 'Advisor' },
  { role: 'ADMIN', label: 'Admin' },
];
const STATUSES: AdminUserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED'];

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

function RowMenu({
  user,
  isSelf,
  onView,
  onEdit,
  onToggle,
}: {
  user: AdminUserSummary;
  isSelf: boolean;
  onView: () => void;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const suspended = user.status === 'SUSPENDED';
  const item = 'block w-full px-3 py-2 text-left text-[13px] font-medium hover:bg-gray-50';

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label={`Actions for ${user.fullName}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 text-[#555f6f] hover:bg-gray-100"
      >
        <MoreHorizontal className="size-5" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-md">
          <button type="button" className={cn(item, 'text-[#151c27]')} onClick={() => { setOpen(false); onView(); }}>
            View details
          </button>
          <button type="button" className={cn(item, 'text-[#151c27]')} onClick={() => { setOpen(false); onEdit(); }}>
            Edit
          </button>
          {(user.status === 'ACTIVE' || suspended) && (
            <button
              type="button"
              disabled={isSelf && !suspended}
              title={isSelf && !suspended ? 'You cannot suspend your own account' : undefined}
              className={cn(item, suspended ? 'text-[#047857]' : 'text-[#b91c1c]', 'disabled:cursor-not-allowed disabled:opacity-40')}
              onClick={() => { setOpen(false); onToggle(); }}
            >
              {suspended ? 'Activate account' : 'Suspend account'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function UserAccounts() {
  const me = useAuth((s) => s.user);
  const [role, setRole] = useState<AdminUserRole>('STUDENT');
  const [status, setStatus] = useState<AdminUserStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<UserSort>('createdAt,desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<{ id: string; edit: boolean } | null>(null);
  const [confirm, setConfirm] = useState<{ ids: string[]; status: 'ACTIVE' | 'SUSPENDED'; label: string } | null>(null);

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

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, total);

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

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[#151c27]">User Accounts</h1>

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
                <th className="px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Created</th>
                <th className="px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Status</th>
                <th className="px-3 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-[#e7eefe]">
                    <td colSpan={7} className="px-4 py-5">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    Could not load accounts.{' '}
                    <button type="button" onClick={() => refetch()} className="font-semibold text-orange-600 hover:underline">
                      Retry
                    </button>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#555f6f]">
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
                      <button type="button" onClick={() => setDetail({ id: u.id, edit: false })} className="flex items-center gap-2.5 text-left text-sm font-semibold text-[#151c27] hover:text-orange-600">
                        <UserAvatar name={u.fullName} src={u.avatarUrl} />
                        {u.fullName}
                      </button>
                    </td>
                    <td className="px-3 py-3.5 text-[13px] text-[#555f6f]">{u.email}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-[13px] text-[#555f6f]">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <RowMenu
                        user={u}
                        isSelf={u.id === me?.id}
                        onView={() => setDetail({ id: u.id, edit: false })}
                        onEdit={() => setDetail({ id: u.id, edit: true })}
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

        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e7eefe] bg-[#f7f8fa]/60 px-4 py-3 sm:flex-row">
          <p className="text-[13px] text-[#555f6f]">
            Showing {from}–{to} of {total} accounts · {PAGE_SIZE} per page
          </p>
          <div className="flex items-center gap-1">
            <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#555f6f] hover:bg-gray-100 disabled:opacity-40">
              Previous
            </button>
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#f37021] text-xs font-bold text-white">{page + 1}</span>
            <button type="button" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#555f6f] hover:bg-gray-100 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </section>

      <UserDetailModal userId={detail?.id ?? null} startInEdit={detail?.edit} onClose={() => setDetail(null)} />

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
    </div>
  );
}
