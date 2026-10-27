import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiMessage } from '../../lib/apiMessage';
import { studentAcademicService } from '../../services/studentAcademicService';

export default function StudentAdvising() {
  const qc = useQueryClient();
  const assignment = useQuery({ queryKey: ['student', 'assignment'], queryFn: studentAcademicService.assignment });
  const requests = useQuery({ queryKey: ['student', 'advising'], queryFn: studentAcademicService.advisingRequests });
  const [selectedId, setSelectedId] = useState('');
  const detail = useQuery({ queryKey: ['student', 'advising', selectedId], queryFn: () => studentAcademicService.advisingDetail(selectedId), enabled: !!selectedId });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reply, setReply] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true); setNotice('');
    try { await action(); setNotice('Updated successfully.'); await Promise.all(['assignment', 'advising'].map((key) => qc.invalidateQueries({ queryKey: ['student', key] }))); }
    catch (error) { setNotice(apiMessage(error)); }
    finally { setBusy(false); }
  };
  return <div className="space-y-5">
    <section className="rounded-xl bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold">Advisor assignment</h2>
      {assignment.isLoading ? <p>Loading...</p> : assignment.isError ? <p role="alert" className="text-red-700">Could not load assignment.</p> : <>
        <p className="mt-2 text-sm">{assignment.data?.advisorId ? 'An advisor is assigned to you.' : assignment.data?.pendingRequestId ? 'Your advisor request is pending.' : 'You do not have an advisor yet.'}</p>
        {assignment.data?.canRequestAdvisor && <button disabled={busy} onClick={() => run(studentAcademicService.requestAdvisor)} className="mt-3 rounded bg-orange-600 px-3 py-2 text-sm text-white disabled:opacity-50">Request an advisor</button>}
      </>}
    </section>
    <section className="rounded-xl bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold">Academic advising requests</h2>
      {assignment.data?.canRequestAdvising && <form className="mt-3 space-y-2" onSubmit={(event) => { event.preventDefault(); void run(async () => { await studentAcademicService.createAdvising({ title, description }); setTitle(''); setDescription(''); }); }}>
        <input aria-label="Request title" className="w-full rounded border p-2 text-sm" placeholder="Title" maxLength={255} required value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea aria-label="Request description" className="w-full rounded border p-2 text-sm" rows={3} placeholder="Describe what you need help with" maxLength={10000} required value={description} onChange={(e) => setDescription(e.target.value)} />
        <button disabled={busy} className="rounded bg-orange-600 px-3 py-2 text-sm text-white disabled:opacity-50">Send request</button>
      </form>}
      {!assignment.data?.canRequestAdvising && !assignment.isLoading && <p className="mt-2 text-sm text-gray-600">Advising requests become available after an advisor is assigned.</p>}
      {requests.isLoading ? <p className="mt-3">Loading requests...</p> : requests.isError ? <p role="alert" className="mt-3 text-red-700">Could not load requests.</p> : requests.data?.length ? <ul className="mt-4 space-y-2">{requests.data.map((request) => <li key={request.id}><button onClick={() => setSelectedId(request.id)} className="w-full break-words rounded border p-3 text-left text-sm hover:border-orange-500"><strong>{request.title}</strong> · {request.status.replaceAll('_', ' ')} · {new Date(request.createdAt).toLocaleString()}</button></li>)}</ul> : <p className="mt-3 text-sm text-gray-600">No advising requests yet.</p>}
    </section>
    {selectedId && <section className="rounded-xl bg-white p-5 shadow-sm"><div className="flex justify-between"><h2 className="text-lg font-semibold">Request details</h2><button onClick={() => setSelectedId('')}>Close</button></div>
      {detail.isLoading ? <p>Loading...</p> : detail.isError ? <p role="alert" className="text-red-700">Could not load request.</p> : detail.data && <>
        <h3 className="mt-2 break-words font-semibold">{detail.data.request.title}</h3><p className="whitespace-pre-wrap break-words text-sm text-gray-700">{detail.data.request.description}</p>
        <p className="mt-1 text-sm">Advisor: {detail.data.request.advisorName ?? 'Not assigned'} · {detail.data.request.status.replaceAll('_', ' ')}</p>
        {detail.data.request.resolutionSummary && <p className="mt-2 text-sm">Resolution: {detail.data.request.resolutionSummary}</p>}
        <div className="mt-4 space-y-2">{detail.data.messages.length ? detail.data.messages.map((message) => <article key={message.id} className="rounded bg-gray-50 p-3 text-sm"><strong>{message.senderName}</strong> · {new Date(message.createdAt).toLocaleString()}<p className="whitespace-pre-wrap break-words">{message.content}</p></article>) : <p className="text-sm text-gray-600">No replies yet.</p>}</div>
        {!['RESOLVED', 'CANCELLED'].includes(detail.data.request.status) && <div className="mt-4 space-y-2"><textarea aria-label="Reply to advisor" className="w-full rounded border p-2 text-sm" rows={3} maxLength={10000} value={reply} onChange={(e) => setReply(e.target.value)} /><div className="flex gap-3"><button disabled={busy || !reply.trim()} onClick={() => run(async () => { await studentAcademicService.reply(selectedId, reply); setReply(''); })} className="rounded bg-orange-600 px-3 py-2 text-sm text-white disabled:opacity-50">Send reply</button><button disabled={busy} onClick={() => run(() => studentAcademicService.cancel(selectedId))} className="text-sm text-red-700">Cancel request</button></div></div>}
      </>}
    </section>}
    {notice && <p role="status" className="rounded bg-white p-3 text-sm">{notice}</p>}
  </div>;
}
