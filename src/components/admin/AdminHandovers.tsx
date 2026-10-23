import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/apiClient';
import { apiErrorMessage } from '../../lib/apiError';
import { getCsrfHeaders } from '../../lib/csrf';
import { useAuth } from '../../stores/useAuth';
import { ConfirmDialog } from './ConfirmDialog';

interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  status: string;
}
interface Handover {
  id: string;
  fromAdminId: string;
  fromAdminName: string;
  toAdminId: string;
  toAdminName: string;
  handoverDate: string;
  notes: string | null;
  createdAt: string;
}
interface CurrentAdmin {
  id: string;
  fullName: string;
}

const KEYS = {
  current: ['admin', 'handovers', 'current'] as const,
  list: ['admin', 'handovers', 'list'] as const,
  admins: ['admin', 'handovers', 'admins'] as const,
};

const input = 'w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#151c27] focus:border-[#f37021] focus:outline-none';
const label = 'mb-1 block text-xs font-semibold text-[#555f6f]';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

/** Hand the single active admin role over to another admin. Only the current admin can do this. */
export function AdminHandovers() {
  const qc = useQueryClient();
  const me = useAuth((s) => s.user);
  const current = useQuery({ queryKey: KEYS.current, queryFn: async () => (await apiClient.get<CurrentAdmin>('/admin/handovers/current')).data });
  const history = useQuery({ queryKey: KEYS.list, queryFn: async () => (await apiClient.get<Handover[]>('/admin/handovers')).data });
  const admins = useQuery({
    queryKey: KEYS.admins,
    queryFn: async () => (await apiClient.get<{ items: AdminAccount[] }>('/admin/users', { params: { role: 'ADMIN', size: 100 } })).data.items,
  });

  const [toAdminId, setToAdminId] = useState('');
  const [handoverDate, setHandoverDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [formError, setFormError] = useState('');

  const isCurrentAdmin = !!current.data && me?.id === current.data.id;
  const latestDate = history.data?.[0]?.handoverDate;
  const candidates = useMemo(
    () => (admins.data ?? []).filter((a) => a.id !== current.data?.id && a.status === 'ACTIVE'),
    [admins.data, current.data],
  );
  const target = candidates.find((a) => a.id === toAdminId);

  const record = useMutation({
    mutationFn: async () => {
      const body = { fromAdminId: current.data!.id, toAdminId, handoverDate, notes: notes.trim() || null };
      return (await apiClient.post<Handover>('/admin/handovers', body, { headers: await getCsrfHeaders() })).data;
    },
    onSuccess: (handover) => {
      toast.success(`Admin access handed over to ${handover.toAdminName}`);
      qc.invalidateQueries({ queryKey: ['admin', 'handovers'] });
      // The previous admin is no longer allowed in: go to the login page with an explanation.
      window.location.replace('/login?error=handover-complete');
    },
    onError: (error) => setFormError(apiErrorMessage(error, 'Could not record the handover.')),
  });

  const validate = () => {
    if (!toAdminId) return 'Choose the incoming admin.';
    if (!handoverDate) return 'Choose the handover date.';
    if (handoverDate > today()) return 'The handover date cannot be in the future.';
    if (latestDate && handoverDate < latestDate) return `The handover date cannot be before the latest handover (${formatDate(latestDate)}).`;
    return '';
  };

  const ask = () => {
    const problem = validate();
    setFormError(problem);
    if (!problem) setConfirming(true);
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm" aria-label="Admin handover">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#151c27]">Admin handover</h2>
          <p className="mt-1 text-sm text-[#555f6f]">
            Only one admin is active at a time. The current admin can hand the role over to another active admin; their session ends
            immediately afterwards.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1.5 text-xs font-semibold text-[#047857]" data-testid="current-admin">
          <ShieldCheck className="size-3.5" />
          Current admin: {current.data?.fullName ?? '...'}
        </span>
      </div>

      {current.isError && <p className="mt-3 text-sm text-red-600">Could not load the current admin. Apply the database migration first.</p>}

      {isCurrentAdmin ? (
        <form
          noValidate
          className="mt-4 grid gap-3 rounded-lg border border-[#e5e7eb] bg-[#f7f8fa] p-4 sm:grid-cols-[1fr_180px]"
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
        >
          <div>
            <label htmlFor="handover-to" className={label}>Incoming admin</label>
            <select id="handover-to" value={toAdminId} onChange={(e) => setToAdminId(e.target.value)} className={input}>
              <option value="">{candidates.length === 0 ? 'No other active admin accounts' : 'Select an admin...'}</option>
              {candidates.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName} ({a.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="handover-date" className={label}>Handover date</label>
            <input id="handover-date" type="date" value={handoverDate} max={today()} min={latestDate} onChange={(e) => setHandoverDate(e.target.value)} className={input} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="handover-notes" className={label}>Notes (optional)</label>
            <textarea id="handover-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={input} />
          </div>
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <p role="alert" className="text-sm text-red-600">{formError}</p>
            <button type="submit" disabled={candidates.length === 0 || record.isPending} className="rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e05f14] disabled:opacity-50">
              Hand over admin access
            </button>
          </div>
        </form>
      ) : (
        current.data && (
          <p className="mt-4 rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm text-[#555f6f]">
            Only the current admin ({current.data.fullName}) can hand over the role.
          </p>
        )
      )}

      <div className="mt-5">
        <h3 className="mb-2 text-sm font-semibold text-[#151c27]">Handover history</h3>
        <div className="overflow-hidden rounded-lg border border-[#e5e7eb]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f7f8fa] text-xs font-semibold uppercase text-[#555f6f]">
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Handover</th>
                <th className="px-3 py-2.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {history.isLoading && (
                <tr><td colSpan={3} className="px-3 py-6 text-center text-[#555f6f]">Loading...</td></tr>
              )}
              {history.isError && (
                <tr><td colSpan={3} className="px-3 py-6 text-center text-red-600">Could not load the history.</td></tr>
              )}
              {history.data?.length === 0 && (
                <tr><td colSpan={3} className="px-3 py-6 text-center text-[#555f6f]">No handovers recorded yet.</td></tr>
              )}
              {history.data?.map((item) => (
                <tr key={item.id} data-testid="handover-row">
                  <td className="whitespace-nowrap px-3 py-3 text-[#555f6f]">{formatDate(item.handoverDate)}</td>
                  <td className="px-3 py-3 font-medium text-[#151c27]">
                    <span className="inline-flex items-center gap-2">
                      {item.fromAdminName} <ArrowRight className="size-3.5 text-[#98a2b3]" /> {item.toAdminName}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[#555f6f]">{item.notes?.trim() ? item.notes : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Hand over admin access?"
        message={`${target?.fullName ?? 'The selected admin'} will become the only active admin. You will be signed out right away and will not be able to sign in as admin again unless access is handed back.`}
        confirmLabel="Hand over"
        destructive
        isLoading={record.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => record.mutate(undefined, { onSettled: () => setConfirming(false) })}
      />
    </section>
  );
}
