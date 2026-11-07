// AI Performance charts — Operate-mode, synced with the Cam ecosystem.
// Three focused visuals: daily requests (bars), latency (line), tokens (area).
// Shared tooltip styling, skeleton loading, empty state — no stray gray cards.
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { AiUsageByDay } from '../../../ai/types/ai-config';

interface Props {
  data: AiUsageByDay[];
  isLoading?: boolean;
}

const shortDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

const fmtInt = (v: number | string) => Number(v).toLocaleString('en-US');

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-gray-400">{label}</p>
      <div className="space-y-0.5">
        {payload.map((p: any) => (
          <p key={String(p.dataKey)} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <span className="size-2 rounded-full" style={{ background: p.color ?? p.fill }} />
            {p.name}: <span className="font-mono tabular-nums">{fmtInt(p.value)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

const axisTick = { fontSize: 11, fill: '#9ca3af', fontWeight: 600 } as const;

export default function AiPerformanceChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-5">
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100 xl:col-span-3" />
        <div className="grid gap-4 xl:col-span-2">
          <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#F26F21]">
          <BarChart3 className="size-6" />
        </span>
        <p className="text-sm font-bold text-gray-900">No usage in this period</p>
        <p className="max-w-sm text-xs leading-relaxed text-gray-500">
          Try widening the date range or clearing the configuration filter — charts appear as soon as
          requests are logged.
        </p>
      </div>
    );
  }

  const rows = data.map((d) => ({
    ...d,
    label: shortDate(d.date),
    tokens: d.promptTokens + d.completionTokens,
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {/* Requests — hero chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 xl:col-span-3">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-extrabold tracking-tight text-gray-900">Requests &amp; failures</h3>
            <p className="text-[11px] text-gray-400">Daily volume per selected filter</p>
          </div>
          <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-bold text-[#9a3412] ring-1 ring-orange-200">
            {rows.length} days
          </span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#eef2f7" />
              <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} width={44} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(242,111,33,0.08)' }} />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} iconType="circle" iconSize={8} />
              <Bar dataKey="requests" name="Requests" fill="#F26F21" radius={[6, 6, 0, 0]} maxBarSize={34} />
              <Bar dataKey="failed" name="Failed" fill="#dc2626" radius={[6, 6, 0, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 xl:col-span-2">
        {/* Latency */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <h3 className="text-[13px] font-extrabold tracking-tight text-gray-900">Avg latency</h3>
          <p className="mb-1 text-[11px] text-gray-400">Milliseconds per day</p>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#eef2f7" />
                <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} interval="preserveStartEnd" />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} width={48} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="averageLatencyMs" name="Latency (ms)" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tokens */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <h3 className="text-[13px] font-extrabold tracking-tight text-gray-900">Token usage</h3>
          <p className="mb-1 text-[11px] text-gray-400">Prompt + completion per day</p>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="perfTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F26F21" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#F26F21" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#eef2f7" />
                <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} interval="preserveStartEnd" />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="tokens" name="Tokens" stroke="#F26F21" strokeWidth={2.5} fill="url(#perfTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
