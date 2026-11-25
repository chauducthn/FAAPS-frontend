import type { ReactNode } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { AlertTriangle, GraduationCap, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { STUDENT_ID_PLACEHOLDER } from '../utils/accountRules';
import type { AdminUserRole } from '../types/admin';
import { userFieldClass, userLabelClass, type CreateUserValues } from './createUserSchema';

export function UserFormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <h3 className="mb-3.5 text-[13px] font-extrabold tracking-tight text-gray-900">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function UserFormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={userLabelClass}>
        {label}
        {required && <span className="ml-0.5 text-[#C2410C]">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 flex items-start gap-1 text-[11px] font-semibold leading-snug text-red-600">
          <AlertTriangle className="mt-px size-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function DerivedChip({ icon, label, tone = 'default' }: { icon?: ReactNode; label: string; tone?: 'default' | 'warn' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1',
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
      </UserFormSection>
    );
  }

  return (
    <UserFormSection title="Student profile">
      <div className="grid gap-4 sm:grid-cols-2">
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
          <select {...register('curriculumId')} className={userFieldClass(!!errors.curriculumId)} aria-label="Curriculum">
            <option value="">Select a curriculum…</option>
            {curriculumList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.majorCode} {c.version} — {c.name}
              </option>
            ))}
          </select>
        </UserFormField>
      </div>

      {identity && (
        <div className="flex flex-wrap items-center gap-2">
          <DerivedChip icon={<GraduationCap className="size-3" />} label={`Major ${major?.name ?? identity.majorCode}`} />
          <DerivedChip icon={<Sparkles className="size-3" />} label={`Cohort ${identity.cohort}`} />
          {!major && <DerivedChip tone="warn" label="No matching major" />}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <UserFormField label="Enrollment semester" required error={errors.enrollmentSemesterId?.message}>
          <select {...register('enrollmentSemesterId')} className={userFieldClass(!!errors.enrollmentSemesterId)} aria-label="Enrollment semester">
            <option value="">Select…</option>
            {semesterList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </select>
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
          error={errors.expectedGraduationSemesterId?.message ?? (graduationConflict ? 'The graduation semester must come after the enrollment semester' : undefined)}
        >
          <select
            {...register('expectedGraduationSemesterId')}
            className={userFieldClass(!!errors.expectedGraduationSemesterId || graduationConflict)}
            aria-label="Expected graduation semester"
          >
            <option value="">Not set</option>
            {graduationOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </select>
        </UserFormField>
      </div>
    </UserFormSection>
  );
}
