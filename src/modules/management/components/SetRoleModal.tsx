// Change the role of one account.
//
// Switching the role changes the academic identity of the account and the
// mail domain it must use, so the dialog asks for both and refuses to submit
// when the address and the new role disagree.

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, GraduationCap, Loader2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useCurriculumsQuery } from '../../academic/hooks/queries/useCurriculumsQuery';
import { useChangeUserRole } from '../hooks/queries/useAdminUsers';
import {
  STUDENT_ID_ERROR_MESSAGE,
  STUDENT_ID_PATTERN,
  emailMatchesRole,
  emailRoleErrorMessage,
  hasAllowedEmailDomain,
  parseStudentId,
} from '../utils/accountRules';
import type { AdminUserRole, AdminUserSummary } from '../types/admin';

interface Props {
  open: boolean;
  user: AdminUserSummary | null;
  onClose: () => void;
  onDone?: () => void;
}

const field =
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-[13px] font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400 transition-all focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';

export function SetRoleModal({ open, user, onClose, onDone }: Props) {
  const changeRole = useChangeUserRole();
  const curriculums = useCurriculumsQuery('curriculum', { status: 'ACTIVE', page: 0, size: 100 });

  const [target, setTarget] = useState<AdminUserRole>('ADVISOR');
  const [studentCode, setStudentCode] = useState('');
  const [curriculumId, setCurriculumId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    setTarget(user.role === 'STUDENT' ? 'ADVISOR' : 'STUDENT');
    setStudentCode(user.role === 'STUDENT' ? user.userId : '');
    setCurriculumId('');
    setError(null);
  }, [open, user]);

  const curriculumList = useMemo(() => curriculums.data?.items ?? [], [curriculums.data]);
  const identity = useMemo(() => parseStudentId(studentCode), [studentCode]);

  if (!user) return null;

  /**
   * The address of the account must fit the role it is moving to. The admin
   * cannot edit the address here, so a mismatch blocks the change.
   */
  const emailConflict =
    hasAllowedEmailDomain(user.email) && !emailMatchesRole(user.email, target);

  const studentCodeInvalid = target === 'STUDENT' && !STUDENT_ID_PATTERN.test(studentCode.trim().toUpperCase());

  const submit = async () => {
    if (emailConflict) {
      setError(emailRoleErrorMessage(target));
      return;
    }
    if (target === 'STUDENT') {
      if (studentCodeInvalid) {
        setError(STUDENT_ID_ERROR_MESSAGE);
        return;
      }
      const curriculum = curriculumList.find((item) => item.id === curriculumId);
      if (!curriculum) {
        setError('Select the curriculum the student follows.');
        return;
      }
      setError(null);
      try {
        await changeRole.mutateAsync({
          id: user.id,
          role: target,
          studentCode: studentCode.trim().toUpperCase(),
          curriculumVersionId: curriculum.id,
          enrollmentSemesterId: curriculum.effectiveFromSemesterId,
        });
        toast.success(`${user.fullName} is now a Student.`);
        onDone?.();
        onClose();
      } catch (cause) {
        setError(apiErrorMessage(cause));
      }
      return;
    }
    setError(null);
    try {
      await changeRole.mutateAsync({ id: user.id, role: target });
      toast.success(`${user.fullName} is now an Advisor.`);
      onDone?.();
      onClose();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const blocked = emailConflict || studentCodeInvalid;

  return (
    <Modal open={open} onClose={() => !changeRole.isPending && onClose()} title="Change user role" className="max-w-lg">
      <div className="flex flex-col gap-4 overflow-y-auto p-6">
        <div className="flex items-start gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)]">
            {target === 'STUDENT' ? <GraduationCap className="size-5" /> : <UserRound className="size-5" />}
          </span>
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold leading-snug text-[#111827]">
              Set role: {target === 'STUDENT' ? 'Student' : 'Advisor'}?
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
              {user.fullName} is currently a {user.role === 'STUDENT' ? 'Student' : 'Advisor'} and signs in as{' '}
              <span className="font-semibold text-gray-800">{user.email}</span>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1" role="radiogroup" aria-label="New role">
          {(['STUDENT', 'ADVISOR'] as const).map((r) => (
            <label
              key={r}
              className={[
                'cursor-pointer rounded-lg px-3 py-2 text-center text-xs font-bold transition-all',
                target === r ? 'bg-white text-[#C2410C] shadow-xs ring-1 ring-orange-200' : 'text-gray-400 hover:text-gray-600',
              ].join(' ')}
            >
              <input
                type="radio"
                value={r}
                checked={target === r}
                onChange={() => {
                  setTarget(r);
                  setError(null);
                }}
                className="sr-only"
              />
              {r === 'STUDENT' ? 'Student' : 'Advisor'}
            </label>
          ))}
        </div>

        {target === 'STUDENT' && (
          <div className="space-y-3">
            <label className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
              Student ID
              <input
                value={studentCode}
                onChange={(event) => setStudentCode(event.target.value.toUpperCase())}
                placeholder="SE173012"
                maxLength={8}
                aria-label="Student ID"
                className={`${field} mt-1.5 font-mono font-bold uppercase`}
              />
            </label>
            <label className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
              Curriculum
              <select
                value={curriculumId}
                onChange={(event) => setCurriculumId(event.target.value)}
                aria-label="Curriculum"
                className={`${field} mt-1.5`}
              >
                <option value="">Select a curriculum…</option>
                {curriculumList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.majorCode} {item.version} — {item.name}
                  </option>
                ))}
              </select>
            </label>
            {identity && (
              <p className="rounded-xl bg-orange-50 px-3 py-2 text-[12px] font-semibold text-[#9a3412] ring-1 ring-orange-200">
                Major {identity.majorCode} · Cohort {identity.cohort}
              </p>
            )}
          </div>
        )}

        {emailConflict && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] font-semibold leading-relaxed text-red-700">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {emailRoleErrorMessage(target)} This account signs in as {user.email}, so the role cannot be changed until the
            address is updated.
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#e5e7eb] p-4 sm:flex-row sm:px-6">
        <button
          type="button"
          disabled={changeRole.isPending}
          onClick={onClose}
          className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={changeRole.isPending || blocked}
          title={blocked ? 'Fix the highlighted fields to continue' : undefined}
          onClick={submit}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f37021] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {changeRole.isPending && <Loader2 className="size-4 animate-spin" />}
          {changeRole.isPending ? 'Changing…' : 'Confirm role change'}
        </button>
      </div>
    </Modal>
  );
}
