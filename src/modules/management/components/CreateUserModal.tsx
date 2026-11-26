// Create or edit a Student / Advisor account from the admin User Accounts page.
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useCurriculumsQuery, useSemesterOptions } from '../../academic/hooks/queries/useCurriculumsQuery';
import { curriculumService } from '../services/curriculum.service';
import { useMajorOptions } from '../hooks/queries/useAdminDashboard';
import { adminService } from '../services/adminService';
import {
  emailMatchesRole,
  emailRoleErrorMessage,
  hasAllowedEmailDomain,
  sortSemesters,
} from '../utils/accountRules';
import type { AdminUserRole, AdminUserSummary } from '../types/admin';
import { createUserSchema, emptyCreateUserValues, type CreateUserValues } from './createUserSchema';
import { CreateUserProfileSection } from './CreateUserProfileSection';
import { CreateUserAccountSection, CreateUserModalFooter, CreateUserModalHeader } from './CreateUserAccountSection';
import { useStudentPlacement } from './useStudentPlacement';

interface Props {
  open: boolean;
  defaultRole: AdminUserRole;
  user?: AdminUserSummary | null;
  onClose: () => void;
  onCreated: (name: string) => void;
}

export function CreateUserModal({ open, defaultRole, user, onClose, onCreated }: Props) {
  const isEdit = !!user;
  const curriculums = useCurriculumsQuery('curriculum', { status: 'ACTIVE', page: 0, size: 100 });
  const totalPages = curriculums.data?.totalPages ?? 1;
  const extraCurriculums = useQuery({
    queryKey: ['admin', 'curriculums', 'active-rest', totalPages],
    enabled: open && totalPages > 1,
    staleTime: 60_000,
    queryFn: async () => {
      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          curriculumService.list({ status: 'ACTIVE', page: i + 1, size: 100 }),
        ),
      );
      return rest.flatMap((p) => p.items ?? []);
    },
  });
  const semesters = useSemesterOptions(open);
  const majors = useMajorOptions();

  const {
    register, handleSubmit, reset, watch, setValue, setError, clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: emptyCreateUserValues(defaultRole),
  });

  useEffect(() => {
    if (!open) return;
    reset(
      user
        ? { ...emptyCreateUserValues(user.role), role: user.role, fullName: user.fullName, email: user.email, studentCode: user.role === 'STUDENT' ? user.userId : '' }
        : emptyCreateUserValues(defaultRole),
    );
  }, [open, defaultRole, user, reset]);

  const role = watch('role');
  const studentCode = watch('studentCode');
  const curriculumId = watch('curriculumId');
  const email = watch('email');
  const enrollmentSemesterId = watch('enrollmentSemesterId');
  const expectedGraduationSemesterId = watch('expectedGraduationSemesterId');

  const curriculumList = useMemo(
    () => [...(curriculums.data?.items ?? []), ...(extraCurriculums.data ?? [])],
    [curriculums.data, extraCurriculums.data],
  );
  const semesterList = useMemo(() => sortSemesters(semesters.data ?? []), [semesters.data]);
  const majorList = majors.data ?? [];

  const placement = useStudentPlacement({
    open, role, studentCode, curriculumId, enrollmentSemesterId, expectedGraduationSemesterId,
    curriculumList, semesterList, majorList, setValue,
  });

  const emailRoleConflict = email.trim().length > 0 && hasAllowedEmailDomain(email) && !emailMatchesRole(email, role);
  const emailError = errors.email?.message ?? (emailRoleConflict ? emailRoleErrorMessage(role) : undefined);

  const submit = handleSubmit(async (v) => {
    const isStudent = v.role === 'STUDENT';
    if (isStudent && placement.missingCohortCombo && placement.identity) {
      setError('studentCode', { message: `No active Major + Cohort matches ${placement.identity.majorCode}${placement.identity.cohort.slice(1)}` });
      return;
    }
    if (isStudent && placement.prefixMismatch && placement.identity && placement.selectedCurriculum) {
      setError('curriculumId', {
        message: `Student ID "${placement.identity.majorCode}${placement.identity.cohort.slice(1)}" must match ${placement.selectedCurriculum.majorCode} ${placement.selectedCurriculum.version}`,
      });
      return;
    }
    if (isStudent && placement.graduationConflict) {
      setError('expectedGraduationSemesterId', { message: 'The graduation semester must come after the enrollment semester' });
      return;
    }
    try {
      if (isEdit && user) {
        await adminService.changeUserRole(user.id, { role: v.role, studentCode: isStudent ? v.studentCode.toUpperCase() : undefined });
      } else {
        await adminService.createUser({
          role: v.role,
          email: v.email.trim(),
          fullName: v.fullName.trim(),
          phone: v.phone || undefined,
          ...(isStudent
            ? {
                studentCode: v.studentCode.toUpperCase(),
                curriculumVersionId: v.curriculumId,
                enrollmentSemesterId: v.enrollmentSemesterId,
                expectedGraduationSemesterId: v.expectedGraduationSemesterId || undefined,
                currentSemester: Number(v.currentSemester),
              }
            : { maxAdvisees: Number(v.maxAdvisees) }),
        });
      }
      onCreated(v.fullName.trim());
    } catch (error) {
      setError('root', { message: apiErrorMessage(error) });
    }
  });

  const changeRole = (next: AdminUserRole) => {
    setValue('role', next, { shouldValidate: true });
    if (next === 'STUDENT') {
      setValue('maxAdvisees', '');
    } else {
      setValue('studentCode', '');
      setValue('curriculumId', '');
      setValue('enrollmentSemesterId', '');
      setValue('expectedGraduationSemesterId', '');
      setValue('currentSemester', '');
    }
    clearErrors(['studentCode', 'curriculumId', 'enrollmentSemesterId', 'expectedGraduationSemesterId', 'currentSemester', 'maxAdvisees']);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit user' : 'Create user'} className="max-w-xl">
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-col">
        <CreateUserModalHeader isEdit={isEdit} role={role} onClose={onClose} />
        <div className="space-y-5 overflow-y-auto px-6 py-5">
          <CreateUserAccountSection role={role} email={email} emailError={emailError} register={register} errors={errors} onChangeRole={changeRole} />
          <CreateUserProfileSection
            role={role}
            register={register}
            errors={errors}
            selectedMajor={placement.selectedMajor}
            selectedCohort={placement.selectedCohort}
            majorOptions={placement.majorOptions}
            cohortOptions={placement.cohortOptions}
            onMajorChange={placement.onMajorChange}
            onCohortChange={placement.onCohortChange}
            curriculumList={placement.visibleCurriculums}
            semesterList={semesterList}
            graduationOptions={placement.graduationOptions}
            identity={placement.identity}
            major={placement.major}
            graduationConflict={placement.graduationConflict}
          />
          {errors.root?.message && (
            <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-red-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {errors.root.message}
            </p>
          )}
        </div>
        <CreateUserModalFooter
          isEdit={isEdit}
          isSubmitting={isSubmitting}
          blocked={emailRoleConflict || placement.graduationConflict || placement.prefixMismatch || placement.missingCohortCombo}
          onClose={onClose}
        />
      </form>
    </Modal>
  );
}
