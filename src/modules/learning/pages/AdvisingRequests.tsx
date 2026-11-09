// src/pages/learning/AdvisingRequests.tsx
// Trang "Yêu cầu tư vấn" của sinh viên: form gửi yêu cầu + danh sách yêu cầu đã gửi.

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquareText } from 'lucide-react';
import { toast } from 'sonner';
import { AdvisingRequestDetailModal } from '../components/AdvisingRequestDetailModal';
import { AdvisingRequestForm } from '../components/AdvisingRequestForm';
import { RequestStatusBadge } from '../../advising/components/RequestStatusBadge';
import { studentAcademicService } from '../../academic/services/studentAcademicService';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { useMyAdvisingRequests } from '../hooks/queries/useStudentQueries';


const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function StudentAdvisingRequests() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useMyAdvisingRequests();
  const requests = data ?? [];
  const assignment = useQuery({ queryKey: ['student', 'assignment'], queryFn: studentAcademicService.assignment });
  const [openId, setOpenId] = useState<string | null>(null);
  const [requestingAdvisor, setRequestingAdvisor] = useState(false);

  // Requests can only be sent once an advisor is assigned (the backend refuses them before that).
  const canSend = !!assignment.data?.canRequestAdvising;
  const hasAdvisor = !!assignment.data?.advisorId;
  const lockedReason = assignment.isLoading
    ? undefined
    : assignment.data?.pendingRequestId
      ? 'Your request for an advisor is pending. You can send advising requests once an advisor is assigned.'
      : 'You need an assigned advisor before you can send advising requests.';

  const requestAdvisor = async () => {
    setRequestingAdvisor(true);
    try {
      await studentAcademicService.requestAdvisor();
      toast.success('Advisor request sent');
      await queryClient.invalidateQueries({ queryKey: ['student', 'assignment'] });
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setRequestingAdvisor(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Student / Advising Requests</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Advising Requests</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Send questions to your advisor and track the status of each request.
        </p>
      </div>



      {assignment.isSuccess && !hasAdvisor && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          <span>
            {assignment.data?.pendingRequestId
              ? 'Your request for an advisor is waiting for the Academic Office.'
              : 'You do not have an advisor yet. Ask the Academic Office to assign one.'}
          </span>
          {assignment.data?.canRequestAdvisor && (
            <button
              type="button"
              onClick={requestAdvisor}
              disabled={requestingAdvisor}
              className="rounded-lg bg-[#F26F21] px-3 py-1.5 text-[13px] font-bold text-white hover:bg-[#e05f14] disabled:opacity-60"
            >
              {requestingAdvisor ? 'Sending...' : 'Request an advisor'}
            </button>
          )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <AdvisingRequestForm disabled={!canSend} disabledReason={canSend ? undefined : lockedReason} />

        <section className="flex flex-col rounded-xl bg-white shadow-sm">
          <div className="border-b border-[#f1f5f9] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#151c27]">Submitted Requests</h2>
            <p className="mt-0.5 text-[13px] text-[#555f6f]">
              {requests.length > 0 ? `${requests.length} request(s)` : 'No requests yet'}
            </p>
          </div>

          {isLoading ? (
            <ul className="divide-y divide-[#f1f5f9]">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="space-y-2 px-5 py-4">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                </li>
              ))}
            </ul>
          ) : isError ? (
            <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-[#151c27]">Unable to load requests</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
              >
                Try again
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-gray-100 text-[#98a2b3]">
                <MessageSquareText className="size-5" />
              </span>
              <p className="text-sm font-semibold text-[#151c27]">No advising requests yet</p>
              <p className="max-w-sm text-[13px] text-[#555f6f]">
                Use the form on the left to submit your first request.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#f1f5f9]">
              {requests.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(r.id)}
                    className="block w-full px-5 py-4 text-left transition-colors hover:bg-[#f7f8fa]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#151c27]">{r.title}</p>
                        <p className="mt-0.5 text-[12px] text-[#555f6f]">
                          {r.advisorName ?? 'Waiting for an advisor'} · {formatDateTime(r.createdAt)}
                        </p>
                      </div>
                      <RequestStatusBadge status={r.status} cancelledLabel="Cancelled" />
                    </div>

                    {r.description && (
                      <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#555f6f]">{r.description}</p>
                    )}

                    {(r.status === 'RESOLVED' || r.status === 'CANCELLED') && (
                      <div className="mt-3 rounded-lg border border-[#e5e7eb] bg-[#f7f8fa] px-3 py-2.5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">Advisor Response</p>
                        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[#151c27]">
                          {r.resolutionSummary ?? (r.status === 'CANCELLED' ? 'This request was cancelled.' : 'Your advisor has processed this request.')}
                        </p>
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <AdvisingRequestDetailModal id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
