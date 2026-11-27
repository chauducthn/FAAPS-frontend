import type { ReactNode, SelectHTMLAttributes } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { CaretDown as ChevronDown } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AdminUserRole } from '../types/admin';
import type { StudentIdentity } from '../utils/accountRules';
import { userFieldClass, type CreateUserValues } from './createUserSchema';
import { UserFormField, UserFormSection } from './UserFormPrimitives';

export { UserFormField, UserFormSection };

const PANEL_CLASS = 'h-full rounded-lg bg-surface-page p-4 ring-1 ring-inset ring-line-soft';

interface ProfileProps {
  role: AdminUserRole;
  register: UseFormRegister<CreateUserValues>;
  errors: FieldErrors<CreateUserValues>;
  selectedMajor: string;
  selectedCohort: string;
  majorOptions: { code: string; name: string }[];
  cohortOptions: string[];
  onMajorChange: (code: string) => void;
  onCohortChange: (version: string) => void;
  curriculumList: { id: string; majorCode: string; version: string; name: string }[];
  semesterList: { id: string; code: string }[];
  graduationOptions: { id: string; code: string }[];
  identity: StudentIdentity | null;
  graduationConflict: boolean;
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean; children: ReactNode };

/** Native select with the shared caret; it keeps its aria-label for tests and assistive tech. */
function Select({ invalid = false, className, children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select {...rest} className={cn(userFieldClass(invalid), 'appearance-none pr-9', className)}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
    </div>
  );
}

/** Right column: academic placement for a student, advising capacity for an advisor. */
export function CreateUserProfileSection({
  role, register, errors, selectedMajor, selectedCohort, majorOptions, cohortOptions,
  onMajorChange, onCohortChange, curriculumList, semesterList, graduationOptions,
  identity, graduationConflict,
}: ProfileProps) {
  const isStudent = role === 'STUDENT';
  const majorCohort = (
    <div className="grid grid-cols-2 gap-3">
      <UserFormField label="Major">
        <Select
          value={selectedMajor}
          onChange={(e) => onMajorChange(e.target.value)}
          aria-label={isStudent ? 'Filter by major' : 'Advisor major'}
        >
          <option value="">{isStudent ? 'All majors' : 'Not assigned'}</option>
          {majorOptions.map((m) => (
            <option key={m.code} value={m.code}>{m.code} — {m.name}</option>
          ))}
        </Select>
      </UserFormField>
      <UserFormField label="Cohort">
        <Select
          value={selectedCohort}
          onChange={(e) => onCohortChange(e.target.value)}
          disabled={!isStudent && !selectedMajor}
          aria-label={isStudent ? 'Filter by cohort' : 'Advisor cohort'}
        >
          <option value="">{isStudent ? 'All cohorts' : selectedMajor ? 'Select…' : 'Pick a major'}</option>
          {cohortOptions.map((v) => <option key={v} value={v}>{v}</option>)}
        </Select>
      </UserFormField>
    </div>
  );

  if (!isStudent) {
    return (
      <UserFormSection title="Advising" className={PANEL_CLASS}>
        <UserFormField label="Max advisees" required error={errors.maxAdvisees?.message}>
          <input
            type="number"
            min={1}
            max={500}
            {...register('maxAdvisees')}
            placeholder="30"
            className={userFieldClass(!!errors.maxAdvisees)}
            aria-label="Max advisees"
          />
        </UserFormField>
        {majorCohort}
      </UserFormSection>
    );
  }

  const missingCurriculum = !!identity && curriculumList.length === 0;
  const curriculumError =
    errors.curriculumId?.message ?? (missingCurriculum ? `No active ${identity?.cohort} curriculum` : undefined);
  const graduationError =
    errors.expectedGraduationSemesterId?.message ??
    (graduationConflict ? 'The graduation semester must come after the enrollment semester' : undefined);

  return (
    <UserFormSection title="Academic placement" className={PANEL_CLASS}>
      {majorCohort}

      <UserFormField label="Curriculum" required error={curriculumError}>
        <Select {...register('curriculumId')} invalid={!!curriculumError} aria-label="Curriculum">
          <option value="">Select a curriculum…</option>
          {curriculumList.map((c) => (
            <option key={c.id} value={c.id}>{c.majorCode} {c.version} — {c.name}</option>
          ))}
        </Select>
      </UserFormField>

      <div className="grid grid-cols-2 gap-3">
        <UserFormField label="Enrollment" required error={errors.enrollmentSemesterId?.message}>
          <Select
            {...register('enrollmentSemesterId')}
            invalid={!!errors.enrollmentSemesterId}
            aria-label="Enrollment semester"
          >
            <option value="">Select…</option>
            {semesterList.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
          </Select>
        </UserFormField>
        <UserFormField label="Current semester" required error={errors.currentSemester?.message}>
          <input
            type="number"
            min={1}
            max={9}
            {...register('currentSemester')}
            placeholder="1"
            className={userFieldClass(!!errors.currentSemester)}
            aria-label="Current semester"
          />
        </UserFormField>
      </div>

      <UserFormField label="Expected graduation" error={graduationError}>
        <Select
          {...register('expectedGraduationSemesterId')}
          invalid={!!errors.expectedGraduationSemesterId || graduationConflict}
          aria-label="Expected graduation semester"
        >
          <option value="">Not set</option>
          {graduationOptions.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
        </Select>
      </UserFormField>
    </UserFormSection>
  );
}
