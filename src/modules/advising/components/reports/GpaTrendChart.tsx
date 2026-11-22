// src/modules/advising/components/reports/GpaTrendChart.tsx
// LineChart GPA theo hoc ky — Recharts, dung chung bo khung/tooltip voi trang Reports.
//
// Data: phan tu cua mang `semesters` do BE tra ve (da sap xep tang dan theo ngay bat dau).

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SemesterGpaPoint } from '../../types/reports';

interface Props {
  semesters: SemesterGpaPoint[];
}

/** Nhan cot X: dung `code` khi co, khong thi cat `name` cho gon. */
function shortLabel(point: SemesterGpaPoint): string {
  if (point.code) return point.code;
  const name = point.name ?? '';
  const parts = name.split(' ');
  return parts.length > 1 ? parts[parts.length - 1] : name;
}

export default function GpaTrendChart({ semesters }: Props) {
  const data = semesters.map((s) => ({
    ...s,
    label: shortLabel(s),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#eef2f7" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ stroke: '#e5e7eb' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as SemesterGpaPoint;
              return (
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                    {row.name || row.code}
                  </p>
                  <p className="text-xs font-semibold text-slate-700">
                    Avg GPA:{' '}
                    <span className="font-bold tabular-nums text-slate-900">{row.avgGpa.toFixed(2)}</span>
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Range {row.minGpa.toFixed(2)} – {row.maxGpa.toFixed(2)} · {row.studentCount} students
                  </p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="avgGpa"
            name="Avg GPA"
            stroke="#F26F21"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#F26F21', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#F26F21', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
