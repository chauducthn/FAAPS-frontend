import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CaretDown, Funnel as Filter } from '@phosphor-icons/react';
import { useMajorOptions } from '../hooks/queries/useAdminDashboard';
import { cn } from '@/shared/lib/utils';
import { MonthPicker } from './MonthPicker';
import { formatMonthLabel, monthSpan, monthsBetween } from '../../../shared/lib/months';
import type { MonthlyCount } from '../types/admin';

export const MAX_MONTHS = 36;

/** Fixed height when stacked; on wide screens the plot takes whatever height the card has left. */
const PLOT_AREA_CLASS = 'h-[260px] xl:h-auto xl:min-h-[140px] xl:flex-1';

const FILTER_BUTTON_CLASS =
  'flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-[13px] font-medium text-ink-muted ' +
  'hover:bg-surface-hover';

const MAJOR_SELECT_CLASS =
  'h-9 w-full appearance-none rounded-md border border-line bg-white pl-3 pr-8 text-[13px] font-medium text-ink-primary ' +
  'transition-colors hover:border-ink-subtle/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

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
  className?: string;
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
  className,
}: NewStudentsChartProps) {
  const [showFilters, setShowFilters] = useState(true);
  const majors = useMajorOptions();

  return (
    <section className={cn('flex flex-col gap-4 rounded-lg border border-line/80 bg-white p-4 shadow-2xs', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-primary">New Students by Month</h3>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className={FILTER_BUTTON_CLASS}
        >
          <Filter className="size-3.5" />
          Filter
        </button>
      </div>

      {showFilters && (
        <div className="grid gap-3 sm:grid-cols-[1.2fr_1.2fr_0.8fr]">
          <MonthPicker label="Start month" value={startMonth} onChange={onStartMonthChange} />
          <MonthPicker label="End month" value={endMonth} onChange={onEndMonthChange} />
          <div className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
            Major
            <div className="relative">
              <select
                value={majorId}
                onChange={(e) => onMajorIdChange(e.target.value)}
                aria-label="Major"
                className={MAJOR_SELECT_CLASS}
              >
                <option value="">All majors</option>
                {(majors.data ?? []).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code}
                  </option>
                ))}
              </select>
              <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" aria-hidden />
            </div>
          </div>
        </div>
      )}

      {rangeError ? (
        <p className="text-sm text-red-600">{rangeError}</p>
      ) : isError ? (
        <div className={cn(PLOT_AREA_CLASS, 'flex flex-col items-center justify-center gap-2 text-sm text-ink-muted')}>
          Could not load chart data.
          <button type="button" onClick={onRetry} className="font-semibold text-brand-ink hover:underline">
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className={cn(PLOT_AREA_CLASS, 'animate-pulse rounded-md bg-surface-page')} />
      ) : (
        <div className={cn(PLOT_AREA_CLASS, 'w-full')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--line)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: 'var(--ink-subtle)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--line)' }}
                interval="preserveStartEnd"
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--ink-muted)' }} tickLine={false} axisLine={false} width={36} />
              <Tooltip cursor={{ fill: 'var(--brand-soft)' }} formatter={(v) => [v, 'New students']} />
              <Bar dataKey="students" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={56}>
                {chartData.length <= 18 && (
                  <LabelList dataKey="students" position="top" style={{ fontSize: 12, fontWeight: 600, fill: 'var(--ink-primary)' }} />
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
