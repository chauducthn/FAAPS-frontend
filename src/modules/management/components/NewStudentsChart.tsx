import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Funnel as Filter } from '@phosphor-icons/react';
import { useMajorOptions } from '../hooks/queries/useAdminDashboard';
import { MonthPicker } from './MonthPicker';
import { formatMonthLabel, monthSpan, monthsBetween } from '../../../shared/lib/months';
import type { MonthlyCount } from '../types/admin';

export const MAX_MONTHS = 36;

export interface NewStudentsChartProps {
  startMonth: string;
  endMonth: string;
  majorId: string;
  /** Month range is invalid (reversed or too long) — nothing is fetched. */
  rangeError: string | null;
  /** Rows per month, gap-filled with zeros. */
  chartData: { month: string; label: string; students: number }[];
  isLoading: boolean;
  isError: boolean;
  onStartMonthChange: (month: string) => void;
  onEndMonthChange: (month: string) => void;
  onMajorIdChange: (majorId: string) => void;
  onRetry: () => void;
}

export function NewStudentsChart({
  startMonth,
  endMonth,
  majorId,
  rangeError,
  chartData,
  isLoading,
  isError,
  onStartMonthChange,
  onEndMonthChange,
  onMajorIdChange,
  onRetry,
}: NewStudentsChartProps) {
  const [showFilters, setShowFilters] = useState(true);
  const majors = useMajorOptions();

  return (
    <section className="flex flex-col gap-5 rounded-xl bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#151c27]">New Students by Month</h2>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2 text-[13px] font-medium text-[#555f6f] hover:bg-gray-50"
        >
          <Filter className="size-3.5" />
          Filter
        </button>
      </div>

      {showFilters && (
        <div className="grid gap-3 sm:grid-cols-3">
          <MonthPicker label="Start month" value={startMonth} onChange={onStartMonthChange} />
          <MonthPicker label="End month" value={endMonth} onChange={onEndMonthChange} />
          <div className="flex flex-col gap-1 text-xs font-medium text-[#555f6f]">
            Major
            <select
              value={majorId}
              onChange={(e) => onMajorIdChange(e.target.value)}
              aria-label="Major"
              className="h-[38px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">All majors</option>
              {(majors.data ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {rangeError ? (
        <p className="text-sm text-red-600">{rangeError}</p>
      ) : isError ? (
        <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-sm text-[#555f6f]">
          Could not load chart data.
          <button type="button" onClick={onRetry} className="font-semibold text-orange-600 hover:underline">
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="h-[280px] animate-pulse rounded-lg bg-gray-50" />
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#98a2b3' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#555f6f' }} tickLine={false} axisLine={false} width={36} />
              <Tooltip cursor={{ fill: 'rgba(59,130,246,0.08)' }} formatter={(v) => [v, 'New students']} />
              <Bar dataKey="students" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {chartData.length <= 18 && (
                  <LabelList dataKey="students" position="top" style={{ fontSize: 12, fontWeight: 600, fill: '#151c27' }} />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

/** Fills the gaps of the API answer with zero so the chart has no holes. */
export function buildStudentsChartData(
  rows: MonthlyCount[] | undefined,
  startMonth: string,
  endMonth: string,
): { month: string; label: string; students: number }[] {
  if (!rows) return [];
  const byMonth = new Map(rows.map((d) => [d.month, d.students]));
  return monthsBetween(startMonth, endMonth).map((month) => ({
    month,
    label: formatMonthLabel(month),
    students: byMonth.get(month) ?? 0,
  }));
}

/** The error shown when the picked months cannot be used. */
export function studentsRangeError(startMonth: string, endMonth: string): string | null {
  const span = monthSpan(startMonth, endMonth);
  if (span === 0) return 'Start month must not be after end month.';
  if (span > MAX_MONTHS) return 'Range can be at most 36 months.';
  return null;
}
