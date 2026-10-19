import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Filter } from 'lucide-react';
import { useNewStudents } from '../../hooks/queries/useAdminDashboard';
import { MonthPicker } from './MonthPicker';
import { defaultMonthRange, formatMonthLabel, monthSpan, monthsBetween } from '../../lib/months';

const MAX_MONTHS = 36;

export function NewStudentsChart() {
  const initial = useMemo(() => defaultMonthRange(12), []);
  const [startMonth, setStartMonth] = useState(initial.start);
  const [endMonth, setEndMonth] = useState(initial.end);
  const [showFilters, setShowFilters] = useState(true);

  const span = monthSpan(startMonth, endMonth);
  const rangeError =
    span === 0 ? 'Start month must not be after end month.' : span > MAX_MONTHS ? 'Range can be at most 36 months.' : null;

  const { data, isLoading, isError, refetch } = useNewStudents(startMonth, endMonth, !rangeError);

  // The API only returns months that have data; fill the gaps with 0.
  const chartData = useMemo(() => {
    if (rangeError || !data) return [];
    const byMonth = new Map(data.map((d) => [d.month, d.students]));
    return monthsBetween(startMonth, endMonth).map((month) => ({
      label: formatMonthLabel(month),
      students: byMonth.get(month) ?? 0,
    }));
  }, [data, startMonth, endMonth, rangeError]);

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
        <div className="grid gap-3 sm:grid-cols-2">
          <MonthPicker label="Start month" value={startMonth} onChange={setStartMonth} />
          <MonthPicker label="End month" value={endMonth} onChange={setEndMonth} />
        </div>
      )}

      {rangeError ? (
        <p className="text-sm text-red-600">{rangeError}</p>
      ) : isError ? (
        <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-sm text-[#555f6f]">
          Could not load chart data.
          <button type="button" onClick={() => refetch()} className="font-semibold text-orange-600 hover:underline">
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
