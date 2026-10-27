import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { advisorConversationService } from '../services/advisorConversationService';

export default function AdvisorConversationWorkspace() {
  const queryClient = useQueryClient();
  const requests = useQuery({ queryKey: ['advisor', 'conversations'], queryFn: advisorConversationService.requests });
  const [selectedId, setSelectedId] = useState('');
  const detail = useQuery({
    queryKey: ['advisor', 'conversation', selectedId],
    queryFn: () => advisorConversationService.detail(selectedId),
    enabled: Boolean(selectedId),
  });
  const [reply, setReply] = useState('');
  const [internal, setInternal] = useState(false);
  const [summary, setSummary] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true); setNotice('');
    try {
      await action();
      setNotice('Updated successfully.');
      await queryClient.invalidateQueries({ queryKey: ['advisor'] });
    } catch (error) {
      setNotice(apiMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return <div className="mx-auto max-w-5xl space-y-5">
    <div>
      <p className="text-xs text-[#555f6f]">Advisor / Advising Conversations</p>
      <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Academic Advising Workspace</h1>
      <p className="mt-1 text-sm text-[#555f6f]">Discuss and process requests assigned to you.</p>
    </div>
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Advising Requests</h2>
      {requests.isLoading ? <p>Loading...</p> : requests.isError ? <p role="alert" className="text-red-700">Unable to load advising requests.</p> : requests.data?.length ? <ul className="mt-3 space-y-2">{requests.data.map((request) => <li key={request.id}><button type="button" onClick={() => { setSelectedId(request.id); setSummary(''); }} className="w-full break-words rounded border p-3 text-left text-sm hover:border-orange-500"><strong>{request.title}</strong> · {request.studentName} · {request.status.replaceAll('_', ' ')}</button></li>)}</ul> : <p className="mt-3 text-sm text-gray-600">No requests have been assigned yet.</p>}
    </section>
    {selectedId && <section className="rounded-xl bg-white p-5 shadow-sm"><div className="flex justify-between"><h2 className="text-lg font-semibold">Request Details</h2><button type="button" onClick={() => setSelectedId('')}>Close</button></div>
      {detail.isLoading ? <p>Loading...</p> : detail.isError ? <p role="alert" className="text-red-700">Unable to load the request.</p> : detail.data && <>
        <p className="mt-2 text-sm"><strong>{detail.data.request.studentName}</strong> · {detail.data.request.title} · {detail.data.request.status}</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm">{detail.data.request.description}</p>
        <div className="mt-4 space-y-2">{detail.data.messages.length ? detail.data.messages.map((message) => <article key={message.id} className="rounded bg-gray-50 p-3 text-sm"><strong>{message.senderName}</strong>{message.internal && <span className="ml-2 text-amber-700">Internal note</span>} · {new Date(message.createdAt).toLocaleString()}<p className="whitespace-pre-wrap break-words">{message.content}</p></article>) : <p className="text-sm text-gray-600">No messages yet.</p>}</div>
        {!['RESOLVED', 'CANCELLED'].includes(detail.data.request.status) && <div className="mt-4 space-y-3">
          <textarea aria-label="Reply or internal note" className="w-full rounded border p-2 text-sm" rows={3} maxLength={10000} value={reply} onChange={(event) => setReply(event.target.value)} />
          <label className="block text-sm"><input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} /> Internal note (hidden from the student)</label>
          <button type="button" disabled={busy || !reply.trim()} onClick={() => run(async () => { await advisorConversationService.reply(selectedId, reply, internal); setReply(''); })} className="rounded bg-orange-600 px-3 py-2 text-sm text-white disabled:opacity-50">Send</button>
          <div className="border-t pt-3"><label className="block text-sm">Resolution Summary<textarea className="mt-1 w-full rounded border p-2" rows={2} maxLength={10000} value={summary} onChange={(event) => setSummary(event.target.value)} /></label><button type="button" disabled={busy || !summary.trim()} onClick={() => run(() => advisorConversationService.status(selectedId, 'RESOLVED', summary))} className="mt-2 rounded border border-orange-600 px-3 py-2 text-sm text-orange-700 disabled:opacity-50">Resolve Request</button></div>
        </div>}
        {detail.data.request.resolutionSummary && <p className="mt-3 text-sm">Resolution: {detail.data.request.resolutionSummary}</p>}
      </>}
    </section>}
    {notice && <p role="status" className="rounded bg-white p-3 text-sm">{notice}</p>}
  </div>;
}
