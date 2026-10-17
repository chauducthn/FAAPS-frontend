// src/pages/admin/ImportHistory.tsx
// List of past import jobs + entry point to a new import.

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Search, ChevronDown } from 'lucide-react';
import { useImportJobsQuery } from '../../hooks/queries/useImportQuery';
import { useDebounce } from '../../hooks/useDebounce';
import type { ImportJobFilterParams, ImportJob } from '../../types/import';
import { IMPORT_ENTITIES } from '../../validations/import.schema';
import { StatusBadge } from '../../components/admin/StatusBadge';

const STATUS_TONE: Record<string, 'active' | 'inactive' | 'pending'> = {
  CONFIRMED: 'active',
  PREVIEWED: 'pending',
  PENDING: 'pending',
  FAILED: 'inactive',
};

export default function ImportHistoryPage() {
  const [search, setSearch] = useState('');
  const [entity, setEntity] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const debouncedSearch = useDebounce(search, 300);

  const params: ImportJobFilterParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      entity: entity === 'ALL' ? undefined : (entity as ImportJob['entity']),
      status: status === 'ALL' ? undefined : (status as ImportJob['status']),
      page: 0,
      size: 20,
    }),
    [debouncedSearch, entity, status],
  );

  const { data, isLoading } = useImportJobsQuery(params);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Import History</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Excel imports for courses, curricula and other academic data
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold text-xs rounded-lg shadow-xs">
          <Plus className="size-4" /> New Import
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by file name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#F26F21]"
            />
          </div>
          <div className="relative">
            <select
              value={entity}
              onChange={(e) => setEntity(e.target.value)}
              className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs"
            >
              <option value="ALL">Entity: All</option>
              {IMPORT_ENTITIES.map((e) => (
                <option key={e} value={e}>
                  {e.replace('_', ' ')}
                </option>
              ))}
            </select>
            <ChevronDown className="size-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs"
            >
              <option value="ALL">Status: All</option>
              <option value="PENDING">Pending</option>
              <option value="PREVIEWED">Previewed</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="FAILED">Failed</option>
            </select>
            <ChevronDown className="size-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
        {isLoading && <p className="p-4 text-xs text-gray-500">Loading...</p>}
        {data && (
          <table className="w-full text-left">
            <thead className="bg-indigo-50/30 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase">
              <tr>
                <th className="p-4">File</th>
                <th className="p-4">Entity</th>
                <th className="p-4 text-center">Total / Valid / Invalid</th>
                <th className="p-4">Uploaded By</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No import jobs yet.
                  </td>
                </tr>
              )}
              {data.items.map((j: ImportJob) => (
                <tr key={j.id} className="hover:bg-gray-50/60">
                  <td className="p-4 font-bold text-gray-900">{j.fileName}</td>
                  <td className="p-4 text-gray-700">{j.entity.replace('_', ' ')}</td>
                  <td className="p-4 text-center">
                    {j.totalRows} / {j.validRows} / {j.invalidRows}
                  </td>
                  <td className="p-4 text-gray-600">{j.uploadedByUserName}</td>
                  <td className="p-4">
                    <StatusBadge status={j.status} />
                    <span className="ml-1 text-[10px] text-gray-400">
                      ({STATUS_TONE[j.status]})
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{j.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}