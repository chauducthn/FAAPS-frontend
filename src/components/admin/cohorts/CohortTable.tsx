import type { Cohort } from '../../../types/cohort';
import { StatusBadge } from '../../admin/StatusBadge';

export default function CohortTable({ data }: { data: Cohort[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-indigo-50/30 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <th className="p-4">Code</th>
              <th className="p-4">Name</th>
              <th className="p-4">Start</th>
              <th className="p-4">End</th>
              <th className="p-4 text-center">Students</th>
              <th className="p-4 text-center">Advisors</th>
              <th className="p-4 text-center">Majors</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-xs text-gray-500">
                  No cohorts found.
                </td>
              </tr>
            ) : data.map((cohort) => (
              <tr key={cohort.id} className="transition-colors hover:bg-gray-50/60">
                <td className="p-4 font-bold text-gray-900">{cohort.code}</td>
                <td className="p-4 font-semibold text-gray-900">{cohort.name}</td>
                <td className="p-4 text-gray-600">{cohort.startDate}</td>
                <td className="p-4 text-gray-600">{cohort.endDate}</td>
                <td className="p-4 text-center">{cohort.activeStudents}/{cohort.totalStudents}</td>
                <td className="p-4 text-center">{cohort.totalAdvisors}</td>
                <td className="p-4 text-center">{cohort.totalMajors}</td>
                <td className="p-4"><StatusBadge status={cohort.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
