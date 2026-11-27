// AI Performance charts — token-driven Recharts visuals for daily requests, latency, and tokens.
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
import { ChartBar as BarChart3 } from '@phosphor-icons/react';
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

interface TooltipEntry {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  color?: string;
  fill?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">{label}</p>
      <div className="space-y-0.5">
        {payload.map((p) => (
          <p key={String(p.dataKey)} className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
            <span className="size-2 rounded-full" style={{ background: p.color ?? p.fill }} />
            {p.name}: <span className="font-mono font-semibold tabular-nums text-ink-primary">{fmtInt(p.value ?? 0)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

const AXIS_TICK = { fontSize: 11, fill: 'var(--ink-subtle)', fontWeight: 500 } as const;

export default function AiPerformanceChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid flex-1 gap-4 xl:grid-cols-5">
        <div className="min-h-[260px] animate-pulse rounded-lg bg-line-soft xl:col-span-3" />
        <div className="grid gap-4 xl:col-span-2">
          <div className="min-h-[120px] animate-pulse rounded-lg bg-line-soft" />
          <div className="min-h-[120px] animate-pulse rounded-lg bg-line-soft" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-6 py-12 text-center">
        <span className="flex size-10 items-center justify-center rounded-md bg-brand-soft text-brand ring-1 ring-inset ring-brand/20">
          <BarChart3 className="size-5" />
        </span>
        <p className="text-sm font-semibold text-ink-primary">No usage in this period</p>
        <p className="max-w-sm text-xs leading-relaxed text-ink-muted">
          Try widening the date range or clearing the configuration filter — charts appear as soon as requests are logged.
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
    <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-5">
      <div className="flex min-h-[260px] flex-col rounded-lg border border-line bg-surface-page/40 p-4 xl:col-span-3">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-semibold tracking-tight text-ink-primary">Requests &amp; failures</h3>
            <p className="text-[11px] text-ink-muted">Daily volume per selected filter</p>
          </div>
          <span className="rounded-sm bg-brand-soft px-2 py-0.5 text-[11px] font-semibold tabular-nums text-brand-ink">
            {rows.length} days
          </span>
        </div>
        <div className="min-h-[200px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: 'var(--line)' }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--brand-soft)' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--ink-muted)' }} iconType="circle" iconSize={8} />
              <Bar dataKey="requests" name="Requests" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="failed" name="Failed" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid min-h-0 gap-4 xl:col-span-2 xl:grid-rows-2">
        <div className="flex min-h-[150px] flex-col rounded-lg border border-line bg-surface-page/40 p-4">
          <h3 className="text-[13px] font-semibold tracking-tight text-ink-primary">Avg latency</h3>
          <p className="mb-1.5 text-[11px] text-ink-muted">Milliseconds per day</p>
          <div className="min-h-[100px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: 'var(--line)' }} interval="preserveStartEnd" />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="averageLatencyMs" name="Latency (ms)" stroke="var(--brand)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'var(--brand)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex min-h-[150px] flex-col rounded-lg border border-line bg-surface-page/40 p-4">
          <h3 className="text-[13px] font-semibold tracking-tight text-ink-primary">Token usage</h3>
          <p className="mb-1.5 text-[11px] text-ink-muted">Prompt + completion per day</p>
          <div className="min-h-[100px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rows} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: 'var(--line)' }} interval="preserveStartEnd" />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="tokens" name="Tokens" stroke="var(--brand)" strokeWidth={2} fill="var(--brand)" fillOpacity={0.14} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
