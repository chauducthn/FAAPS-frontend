// src/components/admin/curriculum/CoursePickerModal.tsx
// Modal to add a course to a specific semester. Picks an existing Course from
// the master list (BE handles code uniqueness per curriculum).

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import type { CourseSummary } from '../../../types/course';

interface Props {
  open: boolean;
  semesterNumber: number;
  courses: CourseSummary[];          // all available courses from BE
  alreadyAddedCourseIds: string[];   // to exclude courses already in this curriculum
  isLoading?: boolean;
  onClose: () => void;
  onPick: (course: CourseSummary, meta: { isMandatory: boolean; groupName?: string }) => void;
}

export default function CoursePickerModal({
  open,
  semesterNumber,
  courses,
  alreadyAddedCourseIds,
  isLoading,
  onClose,
  onPick,
}: Props) {
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<CourseSummary | null>(null);
  const [isMandatory, setIsMandatory] = useState(true);
  const [groupName, setGroupName] = useState('');

  const candidates = useMemo(() => {
    const excluded = new Set(alreadyAddedCourseIds);
    const q = search.toLowerCase().trim();
    return courses.filter(
      (c) => !excluded.has(c.id) && (q === '' || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)),
    );
  }, [courses, alreadyAddedCourseIds, search]);

  return (
    <Modal
      open={open}
      onClose={() => {
        setPicked(null);
        setSearch('');
        setGroupName('');
        onClose();
      }}
      title={`Add Course to Semester ${semesterNumber}`}
    >
      <div className="p-6 space-y-4 text-xs">
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or name..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
          />
        </div>

        <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
          {candidates.length === 0 && (
            <p className="p-4 text-center text-gray-500">No available courses.</p>
          )}
          {candidates.map((c) => {
            const isPicked = picked?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setPicked(c)}
                className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 ${
                  isPicked ? 'bg-orange-50/40' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{c.code}</p>
                    <p className="text-gray-600">{c.name}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold">{c.credits} cr</span>
                </div>
              </button>
            );
          })}
        </div>

        {picked && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
              />
              Mandatory
            </label>
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Group (optional)
              </label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Elective group A..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21]"
              />
            </div>
          </div>
        )}

        <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={!picked || isLoading}
            onClick={() =>
              picked &&
              onPick(picked, {
                isMandatory,
                groupName: groupName.trim() || undefined,
              })
            }
            className="px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold rounded-lg disabled:opacity-60"
          >
            {isLoading ? 'Adding...' : 'Add to Semester'}
          </button>
        </div>
      </div>
    </Modal>
  );
}