// Change the role (and matching email when needed) of one account.
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, GraduationCap, Loader2, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useCurriculumsQuery } from '../../academic/hooks/queries/useCurriculumsQuery';
import { useChangeUserRole } from '../hooks/queries/useAdminUsers';
import {
  STUDENT_ID_ERROR_MESSAGE, STUDENT_ID_PATTERN,
  emailMatchesRole, emailRoleErrorMessage, parseStudentId, suggestRoleEmail,
} from '../utils/accountRules';
import type { AdminUserRole, AdminUserSummary } from '../types/admin';
import { userFieldClass, userLabelClass } from './createUserSchema';
import { SetRoleStudentFields } from './SetRoleStudentFields';
import { useSingleEmailAvailability } from './useRoleEmailCheck';

interface Props {
  open: boolean;
  user: AdminUserSummary | null;
  onClose: () => void;
  onDone?: () => void;
}

export function SetRoleModal({ open, user, onClose, onDone }: Props) {
  const changeRole = useChangeUserRole();
  const curriculums = useCurriculumsQuery('curriculum', { status: 'ACTIVE', page: 0, size: 100 });
  const [target, setTarget] = useState<AdminUserRole>('ADVISOR');
  const [email, setEmail] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [curriculumId, setCurriculumId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    const nextRole: AdminUserRole = user.role === 'STUDENT' ? 'ADVISOR' : 'STUDENT';
    setTarget(nextRole);
    setEmail(emailMatchesRole(user.email, nextRole) ? user.email : suggestRoleEmail(user.email, nextRole));
    setStudentCode(user.role === 'STUDENT' ? user.userId : '');
    setCurriculumId('');
    setError(null);
  }, [open, user]);

  const trimmedEmail = email.trim().toLowerCase();
  const emailValidDomain = trimmedEmail.length > 0 && emailMatchesRole(trimmedEmail, target);
  const emailChanged = user ? trimmedEmail !== user.email.trim().toLowerCase() : false;
  const { available: emailAvailable, checking: checkingEmail } = useSingleEmailAvailability(
    open, user?.id, trimmedEmail, emailChanged && emailValidDomain,
  );

  const curriculumList = useMemo(() => curriculums.data?.items ?? [], [curriculums.data]);
  const identity = useMemo(() => parseStudentId(studentCode), [studentCode]);
  const visibleCurriculums = useMemo(
    () => (identity ? curriculumList.filter((c) => c.majorCode === identity.majorCode && c.version === identity.cohort) : curriculumList),
    [curriculumList, identity],
  );

  if (!user) return null;

  const sameRole = target === user.role;
  const emailTaken = emailChanged && emailAvailable === false;
  const studentCodeInvalid = target === 'STUDENT' && !STUDENT_ID_PATTERN.test(studentCode.trim().toUpperCase());
  const selectedCurriculum = curriculumList.find((item) => item.id === curriculumId);
  const prefixMismatch =
    target === 'STUDENT' && !!identity && !!selectedCurriculum
    && (selectedCurriculum.majorCode !== identity.majorCode || selectedCurriculum.version !== identity.cohort);
  const blocked = sameRole || !emailValidDomain || emailTaken || checkingEmail || studentCodeInvalid || prefixMismatch;

  const handleTargetChange = (nextRole: AdminUserRole) => {
    setTarget(nextRole);
    setEmail(emailMatchesRole(user.email, nextRole) ? user.email : suggestRoleEmail(user.email, nextRole));
    setError(null);
  };

  const submit = async () => {
    if (!emailValidDomain) return setError(emailRoleErrorMessage(target));
    if (emailTaken) return setError('This email is already in use by another account.');
    const curriculum = target === 'STUDENT' ? curriculumList.find((item) => item.id === curriculumId) : undefined;
    if (target === 'STUDENT' && studentCodeInvalid) return setError(STUDENT_ID_ERROR_MESSAGE);
    if (target === 'STUDENT' && !curriculum) return setError('Select the curriculum the student follows.');
    if (target === 'STUDENT' && identity && curriculum
        && (curriculum.majorCode !== identity.majorCode || curriculum.version !== identity.cohort)) {
      return setError(`Student ID must match ${curriculum.majorCode} ${curriculum.version}.`);
    }
    setError(null);
    try {
      await changeRole.mutateAsync({
        id: user.id,
        role: target,
        email: emailChanged ? trimmedEmail : undefined,
        ...(target === 'STUDENT' && curriculum
          ? { studentCode: studentCode.trim().toUpperCase(), curriculumVersionId: curriculum.id, enrollmentSemesterId: curriculum.effectiveFromSemesterId }
          : {}),
      });
      toast.success(`${user.fullName} is now ${target === 'STUDENT' ? 'a Student' : 'an Advisor'}.`);
      onDone?.();
      onClose();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  return (
    <Modal open={open} onClose={() => !changeRole.isPending && onClose()} title="Set role" className="max-w-lg">
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21] ring-1 ring-orange-200/70">
            {target === 'STUDENT' ? <GraduationCap className="size-4.5" /> : <UserRound className="size-4.5" />}
          </span>
          <div>
            <h2 className="text-base font-bold text-gray-900">Set role</h2>
            <p className="text-xs text-gray-500">
              {user.fullName} · currently {user.role === 'STUDENT' ? 'Student' : 'Advisor'}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto px-6 py-5">
        <div>
          <label className={userLabelClass}>New role</label>
          <div className="relative">
            <select value={target} onChange={(e) => handleTargetChange(e.target.value as AdminUserRole)} aria-label="New role" className={`${userFieldClass(false)} appearance-none pr-9 font-medium`}>
              <option value="STUDENT">Student</option>
              <option value="ADVISOR">Advisor</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className={userLabelClass}>Account email <span className="text-[#F26F21]">*</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            aria-label="Account email"
            placeholder={target === 'STUDENT' ? 'name@fpt.edu.vn' : 'name@fe.edu.vn'}
            className={userFieldClass(!emailValidDomain || emailTaken)}
          />
          {!emailValidDomain && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
              <AlertTriangle className="size-3.5 shrink-0" /> {emailRoleErrorMessage(target)}
            </p>
          )}
          {emailValidDomain && checkingEmail && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
              <Loader2 className="size-3 animate-spin" /> Checking availability…
            </p>
          )}
          {emailValidDomain && !checkingEmail && emailChanged && emailAvailable === true && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="size-3.5 shrink-0" /> Email is available
            </p>
          )}
          {emailTaken && (
            <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
              <AlertTriangle className="size-3.5 shrink-0" /> This email is already in use by another account.
            </p>
          )}
        </div>

        {target === 'STUDENT' && (
          <SetRoleStudentFields
            studentCode={studentCode}
            curriculumId={curriculumId}
            curriculumList={visibleCurriculums}
            identity={identity}
            fieldClass={userFieldClass(false)}
            onStudentCodeChange={setStudentCode}
            onCurriculumChange={setCurriculumId}
          />
        )}

        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-6 py-3.5">
        <button type="button" disabled={changeRole.isPending} onClick={onClose} className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          Cancel
        </button>
        <button type="button" disabled={changeRole.isPending || blocked} onClick={submit} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#F26F21] px-4 text-sm font-semibold text-white hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55">
          {changeRole.isPending && <Loader2 className="size-4 animate-spin" />}
          {changeRole.isPending ? 'Saving…' : 'Confirm role change'}
        </button>
      </div>
    </Modal>
  );
}
