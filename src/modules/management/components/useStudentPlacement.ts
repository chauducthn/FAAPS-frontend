import { useEffect, useMemo, useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import {
  isAfterSemester,
  parseStudentId,
  suggestCurrentSemester,
  suggestGraduationSemester,
  type SemesterLike,
} from '../utils/accountRules';
import type { AdminUserRole } from '../types/admin';
import type { CreateUserValues } from './createUserSchema';

interface CurriculumOption {
  id: string;
  majorCode: string;
  majorName: string;
  version: string;
  name: string;
  effectiveFromSemesterId: string;
  effectiveToSemesterId?: string | null;
}

interface PlacementArgs {
  open: boolean;
  role: AdminUserRole;
  studentCode: string;
  curriculumId: string;
  enrollmentSemesterId: string;
  expectedGraduationSemesterId: string;
  curriculumList: CurriculumOption[];
  semesterList: SemesterLike[];
  majorList: { id: string; code: string; name: string }[];
  setValue: UseFormSetValue<CreateUserValues>;
}

export function useStudentPlacement({
  open,
  role,
  studentCode,
  curriculumId,
  enrollmentSemesterId,
  expectedGraduationSemesterId,
  curriculumList,
  semesterList,
  majorList,
  setValue,
}: PlacementArgs) {
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelectedMajor('');
    setSelectedCohort('');
  }, [open]);

  const identity = useMemo(() => parseStudentId(studentCode), [studentCode]);

  const majorOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of majorList) map.set(m.code, m.name);
    for (const c of curriculumList) if (!map.has(c.majorCode)) map.set(c.majorCode, c.majorName);
    return [...map.entries()]
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [majorList, curriculumList]);

  const cohortOptions = useMemo(() => {
    const base = selectedMajor ? curriculumList.filter((c) => c.majorCode === selectedMajor) : curriculumList;
    return [...new Set(base.map((c) => c.version))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [curriculumList, selectedMajor]);

  const visibleCurriculums = useMemo(
    () =>
      curriculumList.filter(
        (c) => (!selectedMajor || c.majorCode === selectedMajor) && (!selectedCohort || c.version === selectedCohort),
      ),
    [curriculumList, selectedMajor, selectedCohort],
  );

  const selectedCurriculum = curriculumList.find((c) => c.id === curriculumId);
  const cohortMismatch =
    role === 'STUDENT' && !!identity && !!selectedCurriculum && selectedCurriculum.version !== identity.cohort;
  const missingCohort =
    role === 'STUDENT' && !!identity && curriculumList.length > 0
    && !curriculumList.some((c) => c.version === identity.cohort);

  // When Student ID is typed, auto-narrow Cohort (Major is chosen independently from campus/group).
  useEffect(() => {
    if (role !== 'STUDENT' || !identity) return;
    setSelectedCohort(identity.cohort);
    const cohortMatches = curriculumList.filter(
      (c) => (!selectedMajor || c.majorCode === selectedMajor) && c.version === identity.cohort,
    );
    if (cohortMatches.length === 1) {
      setValue('curriculumId', cohortMatches[0].id, { shouldValidate: true });
    } else if (selectedCurriculum && selectedCurriculum.version !== identity.cohort) {
      setValue('curriculumId', '', { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity?.code, role, curriculumList]);

  // When Curriculum is selected (manually or via Student ID), auto-fill Enrollment, Current, Expected graduation.
  useEffect(() => {
    if (role !== 'STUDENT' || !selectedCurriculum) return;
    setSelectedMajor(selectedCurriculum.majorCode);
    setSelectedCohort(selectedCurriculum.version);
    const enrollId = selectedCurriculum.effectiveFromSemesterId;
    if (enrollId) {
      setValue('enrollmentSemesterId', enrollId, { shouldValidate: true });
      const curSem = suggestCurrentSemester(semesterList, enrollId);
      setValue('currentSemester', String(curSem), { shouldValidate: true });
      const grad =
        (selectedCurriculum.effectiveToSemesterId &&
          semesterList.find((s) => s.id === selectedCurriculum.effectiveToSemesterId)) ||
        suggestGraduationSemester(semesterList, enrollId);
      if (grad) setValue('expectedGraduationSemesterId', grad.id, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCurriculum?.id, role]);

  // When Enrollment semester changes, recalculate Current semester & Expected graduation (still editable by admin).
  useEffect(() => {
    if (role !== 'STUDENT' || !enrollmentSemesterId) return;
    const curSem = suggestCurrentSemester(semesterList, enrollmentSemesterId);
    setValue('currentSemester', String(curSem), { shouldValidate: true });
    const suggestion = suggestGraduationSemester(semesterList, enrollmentSemesterId);
    if (suggestion) setValue('expectedGraduationSemesterId', suggestion.id, { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentSemesterId, role, semesterList]);

  const onMajorChange = (code: string) => {
    setSelectedMajor(code);
    const cohortsForMajor = curriculumList.filter((c) => !code || c.majorCode === code).map((c) => c.version);
    const nextCohort = selectedCohort && cohortsForMajor.includes(selectedCohort) ? selectedCohort : '';
    setSelectedCohort(nextCohort);
    const matches = curriculumList.filter((c) => (!code || c.majorCode === code) && (!nextCohort || c.version === nextCohort));
    setValue('curriculumId', matches.length === 1 ? matches[0].id : '', { shouldValidate: true });
  };

  const onCohortChange = (version: string) => {
    setSelectedCohort(version);
    const matches = curriculumList.filter(
      (c) => (!selectedMajor || c.majorCode === selectedMajor) && (!version || c.version === version),
    );
    setValue('curriculumId', matches.length === 1 ? matches[0].id : '', { shouldValidate: true });
  };

  const enrolled = semesterList.find((s) => s.id === enrollmentSemesterId);
  const graduating = semesterList.find((s) => s.id === expectedGraduationSemesterId);
  const graduationConflict = !isAfterSemester(graduating, enrolled);
  const graduationOptions = useMemo(() => {
    const enrolledStart = enrolled?.startDate;
    return enrolledStart ? semesterList.filter((s) => !s.startDate || s.startDate > enrolledStart) : semesterList;
  }, [semesterList, enrolled]);

  return {
    identity,
    selectedMajor,
    selectedCohort,
    majorOptions,
    cohortOptions,
    visibleCurriculums,
    selectedCurriculum,
    cohortMismatch,
    missingCohort,
    graduationConflict,
    graduationOptions,
    onMajorChange,
    onCohortChange,
  };
}
