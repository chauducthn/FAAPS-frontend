import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiMessage } from '../../lib/apiMessage';
import { advisorConversationService } from '../../services/advisorConversationService';

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
      setNotice('Cập nhật thành công.');
      await queryClient.invalidateQueries({ queryKey: ['advisor'] });
    } catch (error) {
      setNotice(apiMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return <div className="mx-auto max-w-5xl space-y-5">
    <div>
      <p className="text-xs text-[#555f6f]">Cố vấn / Trao đổi tư vấn</p>
      <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Không gian tư vấn học tập</h1>
      <p className="mt-1 text-sm text-[#555f6f]">Trao đổi và xử lý các yêu cầu đã được phân công cho bạn.</p>
    </div>
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Yêu cầu tư vấn</h2>
      {requests.isLoading ? <p>Đang tải...</p> : requests.isError ? <p role="alert" className="text-red-700">Không thể tải yêu cầu tư vấn.</p> : requests.data?.length ? <ul className="mt-3 space-y-2">{requests.data.map((request) => <li key={request.id}><button type="button" onClick={() => { setSelectedId(request.id); setSummary(''); }} className="w-full break-words rounded border p-3 text-left text-sm hover:border-orange-500"><strong>{request.title}</strong> · {request.studentName} · {request.status.replaceAll('_', ' ')}</button></li>)}</ul> : <p className="mt-3 text-sm text-gray-600">Chưa có yêu cầu nào được phân công.</p>}
    </section>
    {selectedId && <section className="rounded-xl bg-white p-5 shadow-sm"><div className="flex justify-between"><h2 className="text-lg font-semibold">Chi tiết yêu cầu</h2><button type="button" onClick={() => setSelectedId('')}>Đóng</button></div>
      {detail.isLoading ? <p>Đang tải...</p> : detail.isError ? <p role="alert" className="text-red-700">Không thể tải yêu cầu.</p> : detail.data && <>
        <p className="mt-2 text-sm"><strong>{detail.data.request.studentName}</strong> · {detail.data.request.title} · {detail.data.request.status}</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm">{detail.data.request.description}</p>
        <div className="mt-4 space-y-2">{detail.data.messages.length ? detail.data.messages.map((message) => <article key={message.id} className="rounded bg-gray-50 p-3 text-sm"><strong>{message.senderName}</strong>{message.internal && <span className="ml-2 text-amber-700">Ghi chú nội bộ</span>} · {new Date(message.createdAt).toLocaleString()}<p className="whitespace-pre-wrap break-words">{message.content}</p></article>) : <p className="text-sm text-gray-600">Chưa có tin nhắn.</p>}</div>
        {!['RESOLVED', 'CANCELLED'].includes(detail.data.request.status) && <div className="mt-4 space-y-3">
          <textarea aria-label="Phản hồi hoặc ghi chú nội bộ" className="w-full rounded border p-2 text-sm" rows={3} maxLength={10000} value={reply} onChange={(event) => setReply(event.target.value)} />
          <label className="block text-sm"><input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} /> Ghi chú nội bộ (sinh viên không xem được)</label>
          <button type="button" disabled={busy || !reply.trim()} onClick={() => run(async () => { await advisorConversationService.reply(selectedId, reply, internal); setReply(''); })} className="rounded bg-orange-600 px-3 py-2 text-sm text-white disabled:opacity-50">Gửi</button>
          <div className="border-t pt-3"><label className="block text-sm">Tóm tắt xử lý<textarea className="mt-1 w-full rounded border p-2" rows={2} maxLength={10000} value={summary} onChange={(event) => setSummary(event.target.value)} /></label><button type="button" disabled={busy || !summary.trim()} onClick={() => run(() => advisorConversationService.status(selectedId, 'RESOLVED', summary))} className="mt-2 rounded border border-orange-600 px-3 py-2 text-sm text-orange-700 disabled:opacity-50">Hoàn tất yêu cầu</button></div>
        </div>}
        {detail.data.request.resolutionSummary && <p className="mt-3 text-sm">Kết quả: {detail.data.request.resolutionSummary}</p>}
      </>}
    </section>}
    {notice && <p role="status" className="rounded bg-white p-3 text-sm">{notice}</p>}
  </div>;
}
