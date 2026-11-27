import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { GraduationCap, SpinnerGap as Loader2, User as UserRound } from '@phosphor-icons/react';
import { ModalFooter, ModalHeader, modalButtonClass } from '../../../shared/components/ui/ModalParts';
import { cn } from '@/shared/lib/utils';
import { STUDENT_ID_PLACEHOLDER, type StudentIdentity } from '../utils/accountRules';
import type { AdminUserRole } from '../types/admin';
import { ADMIN_TAB_LIST_CLASS, adminTabClass } from './AdminTabBar';
import { userFieldClass, type CreateUserValues } from './createUserSchema';
import { UserFormField, UserFormSection } from './UserFormPrimitives';

const ROLE_TABS: { key: AdminUserRole; label: string; icon: typeof GraduationCap }[] = [
  { key: 'STUDENT', label: 'Student', icon: GraduationCap },
  { key: 'ADVISOR', label: 'Advisor', icon: UserRound },
];

export function CreateUserModalHeader({
  isEdit,
  role,
  onClose,
  onChangeRole,
}: {
  isEdit: boolean;
  role: AdminUserRole;
  onClose: () => void;
  onChangeRole: (next: AdminUserRole) => void;
}) {
  return (
    <ModalHeader
      title={isEdit ? 'Edit user' : 'Create user'}
      description={role === 'STUDENT' ? 'Student account' : 'Advisor account'}
      icon={role === 'STUDENT' ? <GraduationCap /> : <UserRound />}
      tone={role === 'STUDENT' ? 'brand' : 'neutral'}
      onClose={onClose}
      actions={
        <div role="tablist" aria-label="Role" className={ADMIN_TAB_LIST_CLASS}>
          {ROLE_TABS.map(({ key, label, icon: Icon }) => {
            const active = role === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChangeRole(key)}
                className={adminTabClass(active)}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
      }
    />
  );
}

/** Left column: who the account belongs to. One field per row. */
export function CreateUserAccountSection({
  role,
  email,
  emailError,
  identity,
  register,
  errors,
}: {
  role: AdminUserRole;
  email: string;
  emailError: string | undefined;
  /** What the Student ID says about the student (campus, group, cohort), shown under the field. */
  identity?: StudentIdentity | null;
  register: UseFormRegister<CreateUserValues>;
  errors: FieldErrors<CreateUserValues>;
}) {
  const identityHint = identity
    ? `${identity.campusName} (${identity.campusCode}) · ${identity.groupName} (${identity.groupCode}) · Cohort ${identity.cohort}`
    : undefined;
  const advisorIdentifier = role === 'ADVISOR' && email.includes('@') ? email.trim().split('@')[0] : '';
  const emailHint =
    role === 'ADVISOR' && advisorIdentifier ? (
      <>
        Identifier <span className="font-mono text-ink-secondary">{advisorIdentifier}</span>
      </>
    ) : undefined;

  return (
    <UserFormSection title="Account" className="md:py-4">
      {role === 'STUDENT' && (
        <UserFormField label="Student ID" required error={errors.studentCode?.message} hint={identityHint}>
          <input
            {...register('studentCode', { setValueAs: (v: string) => v.toUpperCase() })}
            maxLength={8}
            placeholder={STUDENT_ID_PLACEHOLDER}
            className={cn(userFieldClass(!!errors.studentCode), 'font-mono uppercase tracking-wide')}
            aria-label="Student ID"
          />
        </UserFormField>
      )}

      <UserFormField label="Full name" required error={errors.fullName?.message}>
        <input
          {...register('fullName')}
          placeholder="Nguyen Van A"
          className={userFieldClass(!!errors.fullName)}
          aria-label="Full name"
        />
      </UserFormField>

      <UserFormField label="Email" required error={emailError} hint={emailHint}>
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
    <ModalFooter>
      <button type="button" onClick={onClose} className={modalButtonClass('secondary')}>
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting || blocked}
        title={blocked ? 'Fix the highlighted field to continue' : undefined}
        className={modalButtonClass('primary', 'min-w-28')}
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
      </button>
    </ModalFooter>
  );
}
