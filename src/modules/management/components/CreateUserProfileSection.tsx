import type { ReactNode } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { ChevronDown, GraduationCap, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { STUDENT_ID_PLACEHOLDER } from '../utils/accountRules';
import type { AdminUserRole } from '../types/admin';
import { userFieldClass, type CreateUserValues } from './createUserSchema';
import { UserFormField, UserFormSection } from './UserFormPrimitives';

export { UserFormField, UserFormSection };

function DerivedChip({ icon, label, tone = 'default' }: { icon?: ReactNode; label: string; tone?: 'default' | 'warn' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1',
        tone === 'warn' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-orange-50 text-[#9a3412] ring-orange-200',
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
  curriculumList: { id: string; majorCode: string; version: string; name: string }[];
  semesterList: { id: string; code: string }[];
  graduationOptions: { id: string; code: string }[];
  identity: { majorCode: string; cohort: string } | null;
  major: { name: string } | undefined;
  graduationConflict: boolean;
}

export function CreateUserProfileSection({
  role,
  register,
  errors,
  curriculumList,
  semesterList,
  graduationOptions,
  identity,
  major,
  graduationConflict,
}: ProfileProps) {
  if (role !== 'STUDENT') {
    return (
      <UserFormSection title="Advisor profile">
        <div className="grid gap-3.5 sm:grid-cols-2">
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
        </div>
      </UserFormSection>
    );
  }

  return (
    <UserFormSection title="Student profile">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <UserFormField label="Student ID" required error={errors.studentCode?.message}>
          <input
            {...register('studentCode', { setValueAs: (v: string) => v.toUpperCase() })}
            maxLength={8}
            placeholder={STUDENT_ID_PLACEHOLDER}
            className={cn(userFieldClass(!!errors.studentCode), 'font-mono font-bold uppercase')}
            aria-label="Student ID"
          />
        </UserFormField>

        <UserFormField label="Curriculum" required error={errors.curriculumId?.message}>
          <div className="relative">
            <select
              {...register('curriculumId')}
              className={`${userFieldClass(!!errors.curriculumId)} appearance-none pr-9`}
              aria-label="Curriculum"
            >
              <option value="">Select a curriculum…</option>
              {curriculumList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.majorCode} {c.version} — {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          </div>
        </UserFormField>
      </div>

      {identity && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
          <DerivedChip icon={<GraduationCap className="size-3" />} label={`Major ${major?.name ?? identity.majorCode}`} />
          <DerivedChip icon={<Sparkles className="size-3" />} label={`Cohort ${identity.cohort}`} />
          {!major && <DerivedChip tone="warn" label="No matching major" />}
        </div>
      )}

      <div className="grid gap-3.5 sm:grid-cols-3">
        <UserFormField label="Enrollment semester" required error={errors.enrollmentSemesterId?.message}>
          <div className="relative">
            <select
              {...register('enrollmentSemesterId')}
              className={`${userFieldClass(!!errors.enrollmentSemesterId)} appearance-none pr-8`}
              aria-label="Enrollment semester"
            >
              <option value="">Select…</option>
              {semesterList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          </div>
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

        <UserFormField
          label="Expected graduation"
          error={
            errors.expectedGraduationSemesterId?.message ??
            (graduationConflict ? 'The graduation semester must come after the enrollment semester' : undefined)
          }
        >
          <div className="relative">
            <select
              {...register('expectedGraduationSemesterId')}
              className={`${userFieldClass(!!errors.expectedGraduationSemesterId || graduationConflict)} appearance-none pr-8`}
              aria-label="Expected graduation semester"
            >
              <option value="">Not set</option>
              {graduationOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          </div>
        </UserFormField>
      </div>
    </UserFormSection>
  );
}
