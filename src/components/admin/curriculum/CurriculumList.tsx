import type { CurriculumSummary } from '../../../types/curriculum';
import { StatusBadge } from '../../admin/StatusBadge';

interface Props {
  data: CurriculumSummary[];
  onOpenDetail: (curriculum: CurriculumSummary) => void;
}

export default function CurriculumList({ data, onOpenDetail }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-indigo-50/30 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <th className="p-4">Version</th>
              <th className="p-4">Name</th>
              <th className="p-4">Major</th>
              <th className="p-4 text-center">Courses</th>
              <th className="p-4 text-center">Credits</th>
              <th className="p-4">Effective</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs text-gray-500">
                  No curriculum found.
                </td>
              </tr>
            ) : data.map((curriculum) => (
              <tr key={curriculum.id} className="transition-colors hover:bg-gray-50/60">
                <td className="p-4 font-bold text-gray-900">{curriculum.version}</td>
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => onOpenDetail(curriculum)}
                    className="text-left font-semibold text-gray-900 hover:underline"
                  >
                    {curriculum.name}
                  </button>
                </td>
                <td className="p-4 text-gray-600">{curriculum.majorCode} - {curriculum.majorName}</td>
                <td className="p-4 text-center">{curriculum.totalCourses}</td>
                <td className="p-4 text-center">{curriculum.totalCredits}</td>
                <td className="p-4 text-gray-600">
                  {curriculum.effectiveFromSemesterCode}
                  {curriculum.effectiveToSemesterCode ? ` → ${curriculum.effectiveToSemesterCode}` : ' → ...'}
                </td>
                <td className="p-4">
                  <StatusBadge status={curriculum.status} />
                  {curriculum.isCurrent && (
                    <span className="ml-1 text-[10px] font-bold text-[#F26F21]">· CURRENT</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
