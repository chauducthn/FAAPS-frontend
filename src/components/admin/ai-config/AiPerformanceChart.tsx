// src/components/admin/ai-config/AiPerformanceChart.tsx
// Simple bar chart of requests per day using recharts (already in deps).

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AiUsageByDay } from '../../../types/ai-config';

interface Props {
  data: AiUsageByDay[];
}

export default function AiPerformanceChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-xs text-gray-500 italic p-4">
        No usage recorded in the selected period.
      </p>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="requests" name="Requests" fill="#F26F21" />
          <Bar dataKey="failed" name="Failed" fill="#b91c1c" />
          <Bar dataKey="promptTokens" name="Prompt tokens" fill="#0ea5e9" />
          <Bar dataKey="completionTokens" name="Completion tokens" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}