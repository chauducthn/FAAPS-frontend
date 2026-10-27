// src/components/management/ai-config/AiPerformanceChart.tsx
// Biểu đồ hiệu suất AI: cột nhóm (requests / failed) + đường latency trung bình.

import {
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
import type { AiUsageByDay } from '../../../types/ai-config';

interface Props {
  data: AiUsageByDay[];
}

const shortDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

export default function AiPerformanceChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="p-8 text-center text-sm italic text-[#555f6f]">
        No usage recorded in the selected period.
      </p>
    );
  }

  const rows = data.map((d) => ({ ...d, label: shortDate(d.date) }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
          Requests &amp; failures per day
        </p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#98a2b3' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#555f6f' }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                formatter={(value, name) => [Number(value).toLocaleString('en-US'), name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="requests" name="Requests" fill="#f37021" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="failed" name="Failed" fill="#b91c1c" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
          Average latency (ms)
        </p>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#98a2b3' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#555f6f' }}
                tickLine={false}
                axisLine={false}
                width={46}
              />
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString('en-US')} ms`, 'Latency']} />
              <Line
                type="monotone"
                dataKey="averageLatencyMs"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
