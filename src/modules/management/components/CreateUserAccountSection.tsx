import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { CaretDown as ChevronDown, GraduationCap, SpinnerGap as Loader2, User as UserRound, X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { STUDENT_ID_PLACEHOLDER } from '../utils/accountRules';
import type { AdminUserRole } from '../types/admin';
import { userFieldClass, type CreateUserValues } from './createUserSchema';
import { UserFormField, UserFormSection } from './UserFormPrimitives';

export function CreateUserModalHeader({
  isEdit,
  role,
  onClose,
}: {
  isEdit: boolean;
  role: AdminUserRole;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21] ring-1 ring-orange-200/70">
          {role === 'STUDENT' ? <GraduationCap className="size-4.5" /> : <UserRound className="size-4.5" />}
        </span>
        <div>
          <h2 className="text-base font-bold tracking-tight text-gray-900">
            {isEdit ? 'Edit user' : 'Create user'}
          </h2>
          <p className="text-xs text-gray-500">
            {role === 'STUDENT' ? 'Student account & academic placement' : 'Advisor account & advising capacity'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function CreateUserAccountSection({
  role,
  email,
  emailError,
  register,
  errors,
  onChangeRole,
}: {
  role: AdminUserRole;
  email: string;
  emailError: string | undefined;
  register: UseFormRegister<CreateUserValues>;
  errors: FieldErrors<CreateUserValues>;
  onChangeRole: (next: AdminUserRole) => void;
}) {
  const advisorIdentifier = role === 'ADVISOR' && email.includes('@') ? email.trim().split('@')[0] : '';
  return (
    <UserFormSection>
      <div className="grid gap-4 sm:grid-cols-2">
        <UserFormField label="Role" required>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => onChangeRole(e.target.value as AdminUserRole)}
              aria-label="Role"
              className={`${userFieldClass(false)} appearance-none pr-9 font-medium`}
            >
              <option value="STUDENT">Student</option>
              <option value="ADVISOR">Advisor</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          </div>
        </UserFormField>

        {role === 'STUDENT' ? (
          <UserFormField label="Student ID" required error={errors.studentCode?.message}>
            <input
              {...register('studentCode', { setValueAs: (v: string) => v.toUpperCase() })}
              maxLength={8}
              placeholder={STUDENT_ID_PLACEHOLDER}
              className={cn(userFieldClass(!!errors.studentCode), 'font-mono font-semibold uppercase tracking-wide')}
              aria-label="Student ID"
            />
          </UserFormField>
        ) : (
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
        )}
      </div>

      <UserFormField label="Full name" required error={errors.fullName?.message}>
        <input
          {...register('fullName')}
          placeholder="Nguyen Van A"
          className={userFieldClass(!!errors.fullName)}
          aria-label="Full name"
        />
      </UserFormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <UserFormField label="Email" required error={emailError}>
          <input
            type="email"
            {...register('email')}
            placeholder={role === 'STUDENT' ? 'name@fpt.edu.vn' : 'name@fe.edu.vn'}
            className={userFieldClass(!!emailError)}
            aria-label="Email"
          />
        </UserFormField>

        <UserFormField label="Phone" error={errors.phone?.message}>
          <input
            {...register('phone')}
            placeholder="0901234567"
            className={userFieldClass(!!errors.phone)}
            aria-label="Phone"
          />
        </UserFormField>
      </div>

      {role === 'ADVISOR' && (
        <UserFormField label="Advisor identifier">
          <input
            type="text"
            readOnly
            disabled
            value={advisorIdentifier}
            placeholder="Extracted automatically from email before @"
            aria-label="Advisor identifier"
            className={userFieldClass(false)}
          />
        </UserFormField>
      )}
    </UserFormSection>
  );
}

export function CreateUserModalFooter({
  isEdit,
  isSubmitting,
  blocked,
  onClose,
}: {
  isEdit: boolean;
  isSubmitting: boolean;
  blocked: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-6 py-3.5">
      <button
        type="button"
        onClick={onClose}
        className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting || blocked}
        title={blocked ? 'Fix the highlighted field to continue' : undefined}
        className="inline-flex h-9 min-w-28 items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
      </button>
    </div>
  );
}
