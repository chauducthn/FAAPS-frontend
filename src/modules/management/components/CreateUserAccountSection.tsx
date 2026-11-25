import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { ChevronDown, GraduationCap, Loader2, UserRound, X } from 'lucide-react';
import type { AdminUserRole } from '../types/admin';
import { userFieldClass, type CreateUserValues } from './createUserSchema';
import { UserFormField, UserFormSection } from './CreateUserProfileSection';

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
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-[#fff7ed] via-white to-white px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F26F21] text-white shadow-[0_2px_8px_rgba(242,111,33,0.35)]">
          {role === 'STUDENT' ? <GraduationCap className="size-5" /> : <UserRound className="size-5" />}
        </span>
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-gray-900">
            {isEdit ? 'Edit user' : 'Create user'}
          </h2>
          <p className="text-xs text-gray-500">
            {role === 'STUDENT' ? 'Student account & academic profile' : 'Advisor account & capacity'}
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
  emailError,
  register,
  errors,
  onChangeRole,
}: {
  role: AdminUserRole;
  emailError: string | undefined;
  register: UseFormRegister<CreateUserValues>;
  errors: FieldErrors<CreateUserValues>;
  onChangeRole: (next: AdminUserRole) => void;
}) {
  return (
    <UserFormSection title="Account details">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <UserFormField label="Role" required>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => onChangeRole(e.target.value as AdminUserRole)}
              aria-label="Role"
              className={`${userFieldClass(false)} appearance-none pr-9 font-semibold`}
            >
              <option value="STUDENT">Student</option>
              <option value="ADVISOR">Advisor</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          </div>
        </UserFormField>

        <UserFormField label="Full name" required error={errors.fullName?.message}>
          <input
            {...register('fullName')}
            placeholder="Nguyen Van A"
            className={userFieldClass(!!errors.fullName)}
            aria-label="Full name"
          />
        </UserFormField>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
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
        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting || blocked}
        title={blocked ? 'Fix the highlighted field to continue' : undefined}
        className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#F26F21] px-5 py-2 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.35)] transition-all hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
        {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
      </button>
    </div>
  );
}
