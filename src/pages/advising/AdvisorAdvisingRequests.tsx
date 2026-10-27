// src/pages/advising/AdvisorAdvisingRequests.tsx
// Trang "Yêu cầu tư vấn" của cố vấn — bảng đầy đủ + ô tìm kiếm.

import { useState } from 'react';
import { Search } from 'lucide-react';
import { RequestListTable } from '../../components/advising/RequestListTable';


export default function AdvisorAdvisingRequests() {
  const [search, setSearch] = useState('');

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Advisor / Advising Requests</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Advising Requests</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Review all advising requests from students assigned to you.
        </p>
      </div>



      <label className="flex h-[38px] w-full max-w-md items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
        <Search className="size-4 text-[#98a2b3]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name, student ID, or title..."
          aria-label="Search requests"
          className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
        />
      </label>

      <RequestListTable search={search.trim()} />
    </div>
  );
}
