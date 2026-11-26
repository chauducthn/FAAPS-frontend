import type { StudentIdentity } from '../utils/accountRules';

interface CurriculumOption {
  id: string;
  majorCode: string;
  version: string;
  name: string;
}

interface Props {
  studentCode: string;
  curriculumId: string;
  curriculumList: CurriculumOption[];
  identity: StudentIdentity | null;
  fieldClass: string;
  onStudentCodeChange: (value: string) => void;
  onCurriculumChange: (value: string) => void;
}

export function SetRoleStudentFields({
  studentCode,
  curriculumId,
  curriculumList,
  identity,
  fieldClass,
  onStudentCodeChange,
  onCurriculumChange,
}: Props) {
  return (
    <div className="space-y-3">
      <label className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
        Student ID
        <input
          value={studentCode}
          onChange={(event) => onStudentCodeChange(event.target.value.toUpperCase())}
          placeholder="SE173012"
          maxLength={8}
          aria-label="Student ID"
          className={`${fieldClass} mt-1.5 font-mono font-bold uppercase`}
        />
      </label>
      <label className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
        Curriculum
        <select
          value={curriculumId}
          onChange={(event) => onCurriculumChange(event.target.value)}
          aria-label="Curriculum"
          className={`${fieldClass} mt-1.5`}
        >
          <option value="">Select a curriculum…</option>
          {curriculumList.map((item) => (
            <option key={item.id} value={item.id}>
              {item.majorCode} {item.version} — {item.name}
            </option>
          ))}
        </select>
      </label>
      {identity && (
        <p className="rounded-xl bg-orange-50 px-3 py-2 text-[12px] font-semibold text-[#9a3412] ring-1 ring-orange-200">
          {identity.campusName} ({identity.campusCode}) · {identity.groupName} ({identity.groupCode}) · Cohort {identity.cohort}
        </p>
      )}
    </div>
  );
}
