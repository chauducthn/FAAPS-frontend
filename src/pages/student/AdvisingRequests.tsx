// src/pages/student/AdvisingRequests.tsx
// Trang "Yêu cầu tư vấn" của sinh viên: form gửi yêu cầu + danh sách yêu cầu đã gửi.

import { MessageSquareText } from 'lucide-react';
import { AdvisingRequestForm } from '../../components/student/AdvisingRequestForm';
import { RequestStatusBadge } from '../../components/advising/RequestStatusBadge';
import { RequestTypeLabel } from '../../components/advising/RequestTypeLabel';
import { useMyAdvisingRequests } from '../../hooks/queries/useStudentQueries';
import { MockDataBanner } from '../../components/admin/MockDataToggle';

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function StudentAdvisingRequests() {
  const { data, isLoading, isError, refetch } = useMyAdvisingRequests();
  const requests = data ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Sinh viên / Yêu cầu tư vấn</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Yêu cầu tư vấn</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Gửi câu hỏi cho cố vấn và theo dõi trạng thái xử lý của từng yêu cầu.
        </p>
      </div>

      <MockDataBanner scope="portal" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <AdvisingRequestForm />

        <section className="flex flex-col rounded-xl bg-white shadow-sm">
          <div className="border-b border-[#f1f5f9] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#151c27]">Yêu cầu đã gửi</h2>
            <p className="mt-0.5 text-[13px] text-[#555f6f]">
              {requests.length > 0 ? `${requests.length} yêu cầu` : 'Chưa có yêu cầu nào'}
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
              <p className="text-sm font-semibold text-[#151c27]">Không tải được danh sách yêu cầu</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
              >
                Thử lại
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-gray-100 text-[#98a2b3]">
                <MessageSquareText className="size-5" />
              </span>
              <p className="text-sm font-semibold text-[#151c27]">Chưa có yêu cầu tư vấn nào</p>
              <p className="max-w-sm text-[13px] text-[#555f6f]">
                Dùng biểu mẫu bên trái để gửi yêu cầu đầu tiên của bạn.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#f1f5f9]">
              {requests.map((r) => (
                <li key={r.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#151c27]">{r.title}</p>
                      <p className="mt-0.5 text-[12px] text-[#555f6f]">
                        <RequestTypeLabel requestType={r.requestType} /> · {formatDateTime(r.createdAt)}
                      </p>
                    </div>
                    <RequestStatusBadge status={r.status} />
                  </div>

                  {r.description && (
                    <p className="mt-2 text-[13px] leading-relaxed text-[#555f6f]">{r.description}</p>
                  )}

                  {(r.status === 'RESOLVED' || r.status === 'CANCELLED') && (
                    <div className="mt-3 rounded-lg border border-[#e5e7eb] bg-[#f7f8fa] px-3 py-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">
                        Cố vấn đã phản hồi
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#151c27]">
                        {r.resolutionSummary ?? 'Cố vấn đã xử lý yêu cầu này.'}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
