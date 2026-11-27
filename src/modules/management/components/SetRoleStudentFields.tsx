import { CaretDown as ChevronDown } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { StudentIdentity } from '../utils/accountRules';
import { userFieldClass } from './createUserSchema';
import { UserFormField, UserFormSection } from './UserFormPrimitives';

export interface CurriculumOption {
  id: string;
  majorCode: string;
  version: string;
  name: string;
  effectiveFromSemesterId?: string | null;
}

interface Props {
  selectedMajor: string;
  selectedCohort: string;
  majorOptions: { code: string; name: string }[];
  cohortOptions: string[];
  curriculumId: string;
  curriculumList: CurriculumOption[];
  enrollmentSemesterId: string;
  semesterList: { id: string; code: string }[];
  currentSemester: string;
  expectedGraduationSemesterId: string;
  graduationOptions: { id: string; code: string }[];
  identity: StudentIdentity | null;
  graduationConflict: boolean;
  onMajorChange: (code: string) => void;
  onCohortChange: (version: string) => void;
  onCurriculumChange: (id: string) => void;
  onEnrollmentChange: (id: string) => void;
  onCurrentSemesterChange: (val: string) => void;
  onGraduationChange: (id: string) => void;
}

const PANEL_CLASS = 'h-full rounded-lg bg-surface-page p-4 ring-1 ring-inset ring-line-soft';

function SelectField({
  value,
  onChange,
  invalid = false,
  ariaLabel,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={cn(userFieldClass(invalid), 'appearance-none pr-9')}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
    </div>
  );
}

/** Right column Academic placement panel for converting an Advisor into a Student. */
export function SetRoleStudentFields({
  selectedMajor,
  selectedCohort,
  majorOptions,
  cohortOptions,
  curriculumId,
  curriculumList,
  enrollmentSemesterId,
  semesterList,
  currentSemester,
  expectedGraduationSemesterId,
  graduationOptions,
  identity,
  graduationConflict,
  onMajorChange,
  onCohortChange,
  onCurriculumChange,
  onEnrollmentChange,
  onCurrentSemesterChange,
  onGraduationChange,
}: Props) {
  const missingCurriculum = !!identity && curriculumList.length === 0;
  const curriculumError = missingCurriculum ? `No active ${identity?.cohort} curriculum` : undefined;
  const graduationError = graduationConflict
    ? 'The graduation semester must come after the enrollment semester'
    : undefined;

  return (
    <UserFormSection title="Academic placement" className={PANEL_CLASS}>
      <div className="grid grid-cols-2 gap-3">
        <UserFormField label="Major">
          <SelectField value={selectedMajor} onChange={onMajorChange} ariaLabel="Filter by major">
            <option value="">All majors</option>
            {majorOptions.map((m) => (
              <option key={m.code} value={m.code}>{m.code} — {m.name}</option>
            ))}
          </SelectField>
        </UserFormField>
        <UserFormField label="Cohort">
          <SelectField value={selectedCohort} onChange={onCohortChange} ariaLabel="Filter by cohort">
            <option value="">All cohorts</option>
            {cohortOptions.map((v) => <option key={v} value={v}>{v}</option>)}
          </SelectField>
        </UserFormField>
      </div>

      <UserFormField label="Curriculum" required error={curriculumError}>
        <SelectField
          value={curriculumId}
          onChange={onCurriculumChange}
          invalid={!!curriculumError}
          ariaLabel="Curriculum"
        >
          <option value="">Select a curriculum…</option>
          {curriculumList.map((c) => (
            <option key={c.id} value={c.id}>{c.majorCode} {c.version} — {c.name}</option>
          ))}
        </SelectField>
      </UserFormField>

      <div className="grid grid-cols-2 gap-3">
        <UserFormField label="Enrollment" required>
          <SelectField value={enrollmentSemesterId} onChange={onEnrollmentChange} ariaLabel="Enrollment semester">
            <option value="">Select…</option>
            {semesterList.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
          </SelectField>
        </UserFormField>
        <UserFormField label="Current semester" required>
          <input
            type="number"
            min={1}
            max={9}
            value={currentSemester}
            onChange={(e) => onCurrentSemesterChange(e.target.value)}
            placeholder="1"
            aria-label="Current semester"
            className={userFieldClass(false)}
          />
        </UserFormField>
      </div>

      <UserFormField label="Expected graduation" error={graduationError}>
        <SelectField
          value={expectedGraduationSemesterId}
          onChange={onGraduationChange}
          invalid={graduationConflict}
          ariaLabel="Expected graduation semester"
        >
          <option value="">Not set</option>
          {graduationOptions.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
        </SelectField>
      </UserFormField>
    </UserFormSection>
  );
}
