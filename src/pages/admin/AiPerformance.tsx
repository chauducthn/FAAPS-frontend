// src/pages/admin/AiPerformance.tsx
import { useState } from 'react';
import { useAiPerformanceQuery } from '../../hooks/queries/useAiConfigQuery';
import { AiPerformanceChart } from '../../components/admin/ai-config';
import type { AiPerformanceFilterParams, AiPurpose } from '../../types/ai-config';

export default function AiPerformancePage() {
  const [purpose, setPurpose] = useState<'ALL' | AiPurpose>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [configId, setConfigId] = useState('');

  const params: AiPerformanceFilterParams = {
    purpose: purpose === 'ALL' ? undefined : purpose,
    configId: configId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data, isLoading } = useAiPerformanceQuery(params);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI Performance</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Daily usage, success rate and token consumption for each AI configuration
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1 text-[10px]">
              Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as 'ALL' | AiPurpose)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
            >
              <option value="ALL">All</option>
              <option value="CHAT">Chat</option>
              <option value="EMBEDDING">Embedding</option>
              <option value="OCR">OCR</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1 text-[10px]">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1 text-[10px]">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1 text-[10px]">
              Configuration ID (optional)
            </label>
            <input
              value={configId}
              onChange={(e) => setConfigId(e.target.value)}
              placeholder="UUID"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {isLoading && <p className="text-xs text-gray-500">Loading performance data...</p>}
      {data && (
        <>
          <section className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Daily Usage</h2>
            <AiPerformanceChart data={data.byDay} />
          </section>

          <section className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
            <h2 className="text-sm font-bold text-gray-900 p-4 border-b border-gray-100">
              Per-Configuration Summary
            </h2>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500">
                <tr>
                  <th className="p-3">Configuration</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3 text-center">Requests</th>
                  <th className="p-3 text-center">Success</th>
                  <th className="p-3 text-center">Failed</th>
                  <th className="p-3 text-center">Fallback</th>
                  <th className="p-3 text-center">Avg Latency (ms)</th>
                  <th className="p-3 text-center">Tokens (P / C)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {data.summary.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-500">
                      No summary data in the selected period.
                    </td>
                  </tr>
                )}
                {data.summary.map((s) => (
                  <tr key={s.configId} className="hover:bg-gray-50/60">
                    <td className="p-3 font-bold text-gray-900">{s.configName}</td>
                    <td className="p-3 text-gray-600">{s.purpose}</td>
                    <td className="p-3 text-center">{s.totalRequests}</td>
                    <td className="p-3 text-center text-emerald-700">{s.successRequests}</td>
                    <td className="p-3 text-center text-red-700">{s.failedRequests}</td>
                    <td className="p-3 text-center text-amber-700">{s.fallbackRequests}</td>
                    <td className="p-3 text-center">{Math.round(s.averageLatencyMs)}</td>
                    <td className="p-3 text-center">
                      {s.totalPromptTokens} / {s.totalCompletionTokens}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}