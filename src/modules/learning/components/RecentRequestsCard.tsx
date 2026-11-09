// The latest advising requests of the student on the dashboard.

import { Link } from 'react-router';
import { RequestStatusBadge } from '../../advising/components/RequestStatusBadge';
import type { AdvisingRequest } from '../../advising/types/advising';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export function RecentRequestsCard({
  requests,
  isLoading,
}: {
  requests: AdvisingRequest[] | undefined;
  isLoading: boolean;
}) {
  const latest = [...(requests ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <section className="flex flex-col rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#151c27]">Recent Advising Requests</h2>
        <Link to="/student/advising-requests" className="text-[13px] font-semibold text-[#F26F21] hover:underline">
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      ) : latest.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 py-4 text-center">
          <p className="text-sm font-semibold text-[#151c27]">No requests yet</p>
          <Link
            to="/student/advising-requests"
            className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
          >
            Send a request
          </Link>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-[#f1f5f9]">
          {latest.map((request) => (
            <li key={request.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[#151c27]">{request.title}</p>
                <p className="text-[12px] text-[#98a2b3]">{formatDate(request.createdAt)}</p>
              </div>
              <RequestStatusBadge status={request.status} cancelledLabel="Cancelled" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
