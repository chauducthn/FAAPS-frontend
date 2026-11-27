// Change the role (and matching email / academic placement when needed) of one account.
import { useEffect, useState } from 'react';
import { Warning as AlertTriangle, CheckCircle as CheckCircle2, GraduationCap, SpinnerGap as Loader2, User as UserRound } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { InlineAlert } from '../../../shared/components/ui/InlineAlert';
import { ModalFooter, ModalHeader, modalButtonClass } from '../../../shared/components/ui/ModalParts';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { cn } from '@/shared/lib/utils';
import { useChangeUserRole } from '../hooks/queries/useAdminUsers';
import {
  STUDENT_ID_ERROR_MESSAGE, STUDENT_ID_PATTERN, STUDENT_ID_PLACEHOLDER,
  emailMatchesRole, emailRoleErrorMessage, suggestRoleEmail,
} from '../utils/accountRules';
import type { AdminUserRole, AdminUserSummary } from '../types/admin';
import { ADMIN_TAB_LIST_CLASS, adminTabClass } from './AdminTabBar';
import { userFieldClass } from './createUserSchema';
import { SetRoleStudentFields } from './SetRoleStudentFields';
import { useSetRolePlacement } from './useSetRolePlacement';
import { UserFormField, UserFormSection } from './UserFormPrimitives';
import { useSingleEmailAvailability } from './useRoleEmailCheck';

const ROLE_TABS: { key: AdminUserRole; label: string; icon: typeof GraduationCap }[] = [
  { key: 'STUDENT', label: 'Student', icon: GraduationCap },
  { key: 'ADVISOR', label: 'Advisor', icon: UserRound },
];

interface Props {
  open: boolean;
  user: AdminUserSummary | null;
  onClose: () => void;
  onDone?: () => void;
}

export function SetRoleModal({ open, user, onClose, onDone }: Props) {
  const changeRole = useChangeUserRole();
  const [target, setTarget] = useState<AdminUserRole>('ADVISOR');
  const [email, setEmail] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const p = useSetRolePlacement(open, target, studentCode);

  useEffect(() => {
    if (!open || !user) return;
    const nextRole: AdminUserRole = user.role === 'STUDENT' ? 'ADVISOR' : 'STUDENT';
    setTarget(nextRole);
    setEmail(emailMatchesRole(user.email, nextRole) ? user.email : suggestRoleEmail(user.email, nextRole));
    setStudentCode(user.role === 'STUDENT' ? user.userId : '');
    p.resetPlacement();
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const trimmedEmail = email.trim().toLowerCase();
  const emailValidDomain = trimmedEmail.length > 0 && emailMatchesRole(trimmedEmail, target);
  const emailChanged = user ? trimmedEmail !== user.email.trim().toLowerCase() : false;
  const { available: emailAvailable, checking: checkingEmail } = useSingleEmailAvailability(
    open, user?.id, trimmedEmail, emailChanged && emailValidDomain,
  );

  if (!user) return null;

  const isStudent = target === 'STUDENT';
  const sameRole = target === user.role;
  const emailTaken = emailChanged && emailAvailable === false;
  const studentCodeInvalid = isStudent && !STUDENT_ID_PATTERN.test(studentCode.trim().toUpperCase());
  const cohortMismatch = isStudent && !!p.identity && !!p.selectedCurriculum && p.selectedCurriculum.version !== p.identity.cohort;
  const blocked = sameRole || !emailValidDomain || emailTaken || checkingEmail || studentCodeInvalid || cohortMismatch || p.graduationConflict;

  const handleTargetChange = (nextRole: AdminUserRole) => {
    setTarget(nextRole);
    setEmail(emailMatchesRole(user.email, nextRole) ? user.email : suggestRoleEmail(user.email, nextRole));
    setError(null);
  };

  const submit = async () => {
    if (!emailValidDomain) return setError(emailRoleErrorMessage(target));
    if (emailTaken) return setError('This email is already in use by another account.');
    if (isStudent && studentCodeInvalid) return setError(STUDENT_ID_ERROR_MESSAGE);
    if (isStudent && !p.selectedCurriculum) return setError('Select the curriculum the student follows.');
    if (isStudent && cohortMismatch && p.selectedCurriculum) return setError(`Student ID cohort must match ${p.selectedCurriculum.version}.`);
    if (isStudent && p.graduationConflict) return setError('The graduation semester must come after the enrollment semester.');
    setError(null);
    try {
      await changeRole.mutateAsync({
        id: user.id,
        role: target,
        email: emailChanged ? trimmedEmail : undefined,
        ...(isStudent && p.selectedCurriculum
          ? {
              studentCode: studentCode.trim().toUpperCase(),
              curriculumVersionId: p.selectedCurriculum.id,
              enrollmentSemesterId: p.enrollmentSemesterId || p.selectedCurriculum.effectiveFromSemesterId || undefined,
            }
          : {}),
      });
      toast.success(`${user.fullName} is now ${isStudent ? 'a Student' : 'an Advisor'}.`);
      onDone?.();
      onClose();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const identityHint = p.identity
    ? `${p.identity.campusName} (${p.identity.campusCode}) · ${p.identity.groupName} (${p.identity.groupCode}) · Cohort ${p.identity.cohort}`
    : undefined;

  return (
    <Modal open={open} onClose={() => !changeRole.isPending && onClose()} title="Set role" className={isStudent ? 'max-w-[760px]' : 'max-w-lg'}>
      <ModalHeader
        title="Set role"
        description={`${user.fullName} · currently ${user.role === 'STUDENT' ? 'Student' : 'Advisor'}`}
        icon={isStudent ? <GraduationCap /> : <UserRound />}
        tone={isStudent ? 'brand' : 'neutral'}
        onClose={onClose}
        closeDisabled={changeRole.isPending}
        actions={
          <div role="tablist" aria-label="New role" className={ADMIN_TAB_LIST_CLASS}>
            {ROLE_TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" role="tab" aria-selected={target === key} onClick={() => handleTargetChange(key)} className={adminTabClass(target === key)}>
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className={cn(isStudent ? 'grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-stretch' : 'space-y-4')}>
          <UserFormSection title="Account" className={isStudent ? 'md:py-4' : undefined}>
            {isStudent && (
              <UserFormField label="Student ID" required error={studentCode.length > 0 && studentCodeInvalid ? STUDENT_ID_ERROR_MESSAGE : undefined} hint={identityHint}>
                <input
                  value={studentCode}
                  onChange={(e) => { setStudentCode(e.target.value.toUpperCase()); setError(null); }}
                  maxLength={8}
                  placeholder={STUDENT_ID_PLACEHOLDER}
                  aria-label="Student ID"
                  className={cn(userFieldClass(studentCode.length > 0 && studentCodeInvalid), 'font-mono uppercase tracking-wide')}
                />
              </UserFormField>
            )}
            <UserFormField label="Account email" required error={!emailValidDomain ? emailRoleErrorMessage(target) : emailTaken ? 'This email is already in use by another account.' : undefined}>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                aria-label="Account email"
                placeholder={isStudent ? 'name@fpt.edu.vn' : 'name@fe.edu.vn'}
                className={userFieldClass(!emailValidDomain || emailTaken)}
              />
              {emailValidDomain && checkingEmail && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-muted"><Loader2 className="size-3 animate-spin" /> Checking availability…</p>
              )}
              {emailValidDomain && !checkingEmail && emailChanged && emailAvailable === true && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="size-3.5 shrink-0" /> Email is available</p>
              )}
              {!emailValidDomain && email.trim().length === 0 && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600"><AlertTriangle className="size-3.5 shrink-0" /> Email is required</p>
              )}
            </UserFormField>
          </UserFormSection>

          {isStudent && (
            <SetRoleStudentFields
              selectedMajor={p.selectedMajor} selectedCohort={p.selectedCohort}
              majorOptions={p.majorOptions} cohortOptions={p.cohortOptions}
              curriculumId={p.curriculumId} curriculumList={p.visibleCurriculums}
              enrollmentSemesterId={p.enrollmentSemesterId} semesterList={p.semesterList}
              currentSemester={p.currentSemester} expectedGraduationSemesterId={p.expectedGraduationSemesterId}
              graduationOptions={p.graduationOptions} identity={p.identity} graduationConflict={p.graduationConflict}
              onMajorChange={p.onMajorChange} onCohortChange={p.onCohortChange}
              onCurriculumChange={p.onCurriculumChange} onEnrollmentChange={p.onEnrollmentChange}
              onCurrentSemesterChange={p.onCurrentSemesterChange} onGraduationChange={p.onGraduationChange}
            />
          )}
        </div>

        {error && <div className="mt-5"><InlineAlert tone="error" role="alert">{error}</InlineAlert></div>}
      </div>

      <ModalFooter>
        <button type="button" disabled={changeRole.isPending} onClick={onClose} className={modalButtonClass('secondary')}>Cancel</button>
        <button type="button" disabled={changeRole.isPending || blocked} onClick={submit} className={modalButtonClass('primary')}>
          {changeRole.isPending && <Loader2 className="size-4 animate-spin" />}
          {changeRole.isPending ? 'Saving…' : 'Confirm role change'}
        </button>
      </ModalFooter>
    </Modal>
  );
}
