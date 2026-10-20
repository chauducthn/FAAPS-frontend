import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/apiClient';
import { getCsrfHeaders } from '../../lib/csrf';

type AdminAccount = { id: string; fullName: string };
type Handover = { id: string; fromAdminName: string; toAdminName: string; handoverDate: string };

export function AdminHandovers() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [fromAdminId, setFromAdminId] = useState('');
  const [toAdminId, setToAdminId] = useState('');
  const [handoverDate, setHandoverDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiClient.get<{ items: AdminAccount[] }>('/admin/users', { params: { role: 'ADMIN', size: 100 } }),
      apiClient.get<Handover[]>('/admin/handovers'),
    ]).then(([users, history]) => {
      setAccounts(users.data.items);
      setHandovers(history.data);
    }).catch(() => setError('Could not load admin handovers. Apply the database migration first.'));
  }, []);

  return <section className="rounded-xl bg-white p-5 shadow-sm">
    <h2 className="text-lg font-semibold">Admin handovers</h2>
    <p className="mt-1 text-sm text-[#555f6f]">Record the handover date; this does not automatically change account access.</p>
    <div className="mt-4 flex flex-wrap gap-3">
      <select aria-label="Outgoing admin" value={fromAdminId} onChange={event => setFromAdminId(event.target.value)} className="rounded-md border p-2 text-sm">
        <option value="">Outgoing admin</option>{accounts.map(account => <option key={account.id} value={account.id}>{account.fullName}</option>)}
      </select>
      <select aria-label="Incoming admin" value={toAdminId} onChange={event => setToAdminId(event.target.value)} className="rounded-md border p-2 text-sm">
        <option value="">Incoming admin</option>{accounts.map(account => <option key={account.id} value={account.id}>{account.fullName}</option>)}
      </select>
      <input type="date" aria-label="Handover date" value={handoverDate} onChange={event => setHandoverDate(event.target.value)} className="rounded-md border p-2 text-sm" />
      <input aria-label="Handover notes" placeholder="Notes (optional)" value={notes} onChange={event => setNotes(event.target.value)} className="rounded-md border p-2 text-sm" />
      <button type="button" className="rounded-md bg-[#f37021] px-3 text-sm font-semibold text-white" onClick={async () => {
        if (!fromAdminId || !toAdminId || !handoverDate || fromAdminId === toAdminId) return setError('Choose two different admins and a date.');
        try {
          const { data: handover } = await apiClient.post<Handover>('/admin/handovers', { fromAdminId, toAdminId, handoverDate, notes }, { headers: await getCsrfHeaders() });
          setHandovers(current => [handover, ...current]); setError(''); setNotes(''); toast.success('Admin handover recorded.');
        } catch { setError('Could not record handover. Check the admin accounts and database migration.'); }
      }}>Record handover</button>
    </div>
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    <ul className="mt-4 space-y-1 text-sm">{handovers.map(item => <li key={item.id}>
      {item.handoverDate}: {item.fromAdminName} → {item.toAdminName}
    </li>)}</ul>
  </section>;
}
