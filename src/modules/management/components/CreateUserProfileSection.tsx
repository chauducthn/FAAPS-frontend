import type { ReactNode } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { CaretDown as ChevronDown, GraduationCap, Sparkle as Sparkles } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AdminUserRole } from '../types/admin';
import type { StudentIdentity } from '../utils/accountRules';
import { userFieldClass, type CreateUserValues } from './createUserSchema';
import { UserFormField, UserFormSection } from './UserFormPrimitives';

export { UserFormField, UserFormSection };

function DerivedChip({ icon, label, tone = 'default' }: { icon?: ReactNode; label: string; tone?: 'default' | 'warn' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        tone === 'warn' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-orange-50/80 text-[#9a3412] ring-orange-200/80',
      )}
    >
      {icon}
      {label}
    </span>
  );
}

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

export function CreateUserProfileSection({
  role, register, errors, selectedMajor, selectedCohort, majorOptions, cohortOptions,
  onMajorChange, onCohortChange, curriculumList, semesterList, graduationOptions,
  identity, graduationConflict,
}: ProfileProps) {
  const isStudent = role === 'STUDENT';
  const majorCohortGrid = (
    <div className="grid gap-4 sm:grid-cols-2">
      <UserFormField label="Major">
        <div className="relative">
          <select
            value={selectedMajor}
            onChange={(e) => onMajorChange(e.target.value)}
            className={`${userFieldClass(false)} appearance-none pr-9`}
            aria-label={isStudent ? 'Filter by major' : 'Advisor major'}
          >
            <option value="">{isStudent ? 'All majors' : 'Not assigned yet'}</option>
            {majorOptions.map((m) => (
              <option key={m.code} value={m.code}>{m.code} — {m.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        </div>
      </UserFormField>

      <UserFormField label="Cohort">
        <div className="relative">
          <select
            value={selectedCohort}
            onChange={(e) => onCohortChange(e.target.value)}
            disabled={!isStudent && !selectedMajor}
            className={`${userFieldClass(false)} appearance-none pr-9`}
            aria-label={isStudent ? 'Filter by cohort' : 'Advisor cohort'}
          >
            <option value="">{isStudent ? 'All cohorts' : selectedMajor ? 'Select cohort…' : 'Pick a major first'}</option>
            {cohortOptions.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        </div>
      </UserFormField>
    </div>
  );

  if (!isStudent) {
    return (
      <UserFormSection title="Assigned major & cohort (optional)" bordered>
        {majorCohortGrid}
      </UserFormSection>
    );
  }

  return (
    <UserFormSection title="Academic placement" bordered>
      {identity && (
        <div className="flex flex-wrap items-center gap-2">
          <DerivedChip icon={<GraduationCap className="size-3.5" />} label={`${identity.campusName} (${identity.campusCode})`} />
          <DerivedChip label={`${identity.groupName} (${identity.groupCode})`} />
          <DerivedChip icon={<Sparkles className="size-3.5" />} label={`Cohort ${identity.cohort}`} />
          {curriculumList.length === 0 && <DerivedChip tone="warn" label={`No active ${identity.cohort} curriculum`} />}
        </div>
      )}

      {majorCohortGrid}

      <UserFormField label="Curriculum" required error={errors.curriculumId?.message}>
        <div className="relative">
          <select {...register('curriculumId')} className={`${userFieldClass(!!errors.curriculumId)} appearance-none pr-9`} aria-label="Curriculum">
            <option value="">Select a curriculum…</option>
            {curriculumList.map((c) => (
              <option key={c.id} value={c.id}>{c.majorCode} {c.version} — {c.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        </div>
      </UserFormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <UserFormField label="Enrollment semester" required error={errors.enrollmentSemesterId?.message}>
          <div className="relative">
            <select {...register('enrollmentSemesterId')} className={`${userFieldClass(!!errors.enrollmentSemesterId)} appearance-none pr-8`} aria-label="Enrollment semester">
              <option value="">Select…</option>
              {semesterList.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          </div>
        </UserFormField>

        <UserFormField label="Current semester" required error={errors.currentSemester?.message}>
          <input type="number" min={1} max={9} {...register('currentSemester')} placeholder="1" className={userFieldClass(!!errors.currentSemester)} aria-label="Current semester" />
        </UserFormField>

        <UserFormField
          label="Expected graduation"
          error={errors.expectedGraduationSemesterId?.message ?? (graduationConflict ? 'The graduation semester must come after the enrollment semester' : undefined)}
        >
          <div className="relative">
            <select {...register('expectedGraduationSemesterId')} className={`${userFieldClass(!!errors.expectedGraduationSemesterId || graduationConflict)} appearance-none pr-8`} aria-label="Expected graduation semester">
              <option value="">Not set</option>
              {graduationOptions.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          </div>
        </UserFormField>
      </div>
    </UserFormSection>
  );
}
