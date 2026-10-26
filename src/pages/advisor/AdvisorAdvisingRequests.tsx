// src/pages/advisor/AdvisorAdvisingRequests.tsx
// Trang "Yêu cầu tư vấn" của cố vấn — bảng đầy đủ + ô tìm kiếm.

import { useState } from 'react';
import { Search } from 'lucide-react';
import { RequestListTable } from '../../components/advisor/RequestListTable';


export default function AdvisorAdvisingRequests() {
  const [search, setSearch] = useState('');

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Cố vấn / Yêu cầu tư vấn</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Yêu cầu tư vấn</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Danh sách toàn bộ yêu cầu tư vấn của sinh viên được phân công cho bạn.
        </p>
      </div>



      <label className="flex h-[38px] w-full max-w-md items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
        <Search className="size-4 text-[#98a2b3]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên sinh viên, mã SV hoặc tiêu đề..."
          aria-label="Tìm yêu cầu"
          className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
        />
      </label>

      <RequestListTable search={search.trim()} />
    </div>
  );
}
