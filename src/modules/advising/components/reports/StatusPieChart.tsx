// src/modules/advising/components/reports/StatusPieChart.tsx
// PieChart phan bo trang thai hoc vu.
//
// Data: map `{ ACTIVE: 10, PROBATION: 2, ... }` do BE tra ve, chuyen thanh mang
// de Recharts ve duoc. BE luon tra ca 6 key (kep ca 0) nen thu tu o day rat.

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { StatusSlice } from '../../types/reports';

interface Props {
  slices: StatusSlice[];
}

/** Mau + nhan theo trang thai hoc vu — dung chung voi badge status o cac trang khac. */
export const STATUS_COLORS: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: '#10b981', label: 'Active' },
  PROBATION: { color: '#F26F21', label: 'Probation' },
  SUSPENDED: { color: '#dc2626', label: 'Suspended' },
  GRADUATED: { color: '#2563eb', label: 'Graduated' },
  WITHDRAWN: { color: '#64748b', label: 'Withdrawn' },
  LEAVE_OF_ABSENCE: { color: '#a855f7', label: 'On leave' },
};

export default function StatusPieChart({ slices }: Props) {
  const total = slices.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as StatusSlice;
              return (
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <p className="mb-0.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                    {row.label}
                  </p>
                  <p className="text-xs font-semibold text-slate-700">
                    <span className="font-bold tabular-nums text-slate-900">{row.count}</span> students
                    <span className="ml-1.5 tabular-nums text-slate-500">({row.percent}%)</span>
                  </p>
                </div>
              );
            }}
          />
          <Pie
            data={slices}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            stroke="#fff"
            strokeWidth={2}
          >
            {slices.map((slice) => (
              <Cell key={slice.status} fill={slice.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Tong so lam chu thich khi hover khong bat duoc — luon nhin thay. */}
      <p className="-mt-2 text-center text-sm font-medium text-slate-600">
        <span className="font-extrabold tabular-nums text-slate-900">{total}</span> students total
      </p>
    </div>
  );
}
