import { useEffect, useMemo, useState } from 'react';
import { useCurriculumsQuery, useSemesterOptions } from '../../academic/hooks/queries/useCurriculumsQuery';
import { useMajorOptions } from '../hooks/queries/useAdminDashboard';
import type { AdminUserRole } from '../types/admin';
import {
  parseStudentId,
  sortSemesters,
  suggestCurrentSemester,
  suggestGraduationSemester,
} from '../utils/accountRules';

export function useSetRolePlacement(open: boolean, target: AdminUserRole, studentCode: string) {
  const curriculums = useCurriculumsQuery('curriculum', { status: 'ACTIVE', page: 0, size: 100 });
  const semesters = useSemesterOptions(open);
  const majors = useMajorOptions();

  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('');
  const [curriculumId, setCurriculumId] = useState('');
  const [enrollmentSemesterId, setEnrollmentSemesterId] = useState('');
  const [currentSemester, setCurrentSemester] = useState('1');
  const [expectedGraduationSemesterId, setExpectedGraduationSemesterId] = useState('');

  const resetPlacement = () => {
    setSelectedMajor('');
    setSelectedCohort('');
    setCurriculumId('');
    setEnrollmentSemesterId('');
    setCurrentSemester('1');
    setExpectedGraduationSemesterId('');
  };

  const curriculumList = useMemo(() => curriculums.data?.items ?? [], [curriculums.data]);
  const semesterList = useMemo(() => sortSemesters(semesters.data ?? []), [semesters.data]);
  const majorOptions = useMemo(() => {
    const known = new Map((majors.data ?? []).map((m) => [m.code, m.name]));
    const codes = new Set([...known.keys(), ...curriculumList.map((c) => c.majorCode)]);
    return [...codes].sort().map((code) => ({ code, name: known.get(code) ?? code }));
  }, [majors.data, curriculumList]);

  const identity = useMemo(() => parseStudentId(studentCode), [studentCode]);
  const cohortOptions = useMemo(() => {
    const pool = selectedMajor ? curriculumList.filter((c) => c.majorCode === selectedMajor) : curriculumList;
    return [...new Set(pool.map((c) => c.version))].sort();
  }, [curriculumList, selectedMajor]);

  const visibleCurriculums = useMemo(() => {
    const cohort = identity?.cohort ?? selectedCohort;
    return curriculumList.filter((c) => {
      if (selectedMajor && c.majorCode !== selectedMajor) return false;
      if (cohort && c.version !== cohort) return false;
      return true;
    });
  }, [curriculumList, selectedMajor, selectedCohort, identity]);

  const applyEnrollment = (enrollId: string) => {
    setEnrollmentSemesterId(enrollId);
    if (!enrollId) return;
    setCurrentSemester(String(suggestCurrentSemester(semesterList, enrollId)));
    const grad = suggestGraduationSemester(semesterList, enrollId);
    if (grad) setExpectedGraduationSemesterId(grad.id);
  };

  useEffect(() => {
    if (!open || target !== 'STUDENT' || !identity) return;
    setSelectedCohort(identity.cohort);
    const matches = curriculumList.filter(
      (c) => (!selectedMajor || c.majorCode === selectedMajor) && c.version === identity.cohort,
    );
    const match = matches.length === 1 ? matches[0] : undefined;
    if (match) {
      setSelectedMajor(match.majorCode);
      setCurriculumId(match.id);
      if (match.effectiveFromSemesterId) applyEnrollment(match.effectiveFromSemesterId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, target, identity, selectedMajor, curriculumList, semesterList]);

  const enrollIdx = semesterList.findIndex((s) => s.id === enrollmentSemesterId);
  const graduationOptions = useMemo(
    () => (enrollIdx >= 0 ? semesterList.slice(enrollIdx + 1) : semesterList),
    [semesterList, enrollIdx],
  );
  const graduationConflict = useMemo(() => {
    if (!enrollmentSemesterId || !expectedGraduationSemesterId) return false;
    const gradIdx = semesterList.findIndex((s) => s.id === expectedGraduationSemesterId);
    return enrollIdx >= 0 && gradIdx >= 0 && gradIdx <= enrollIdx;
  }, [enrollmentSemesterId, expectedGraduationSemesterId, semesterList, enrollIdx]);

  const selectedCurriculum = curriculumList.find((item) => item.id === curriculumId);

  const onCurriculumChange = (id: string) => {
    setCurriculumId(id);
    const found = curriculumList.find((c) => c.id === id);
    if (found) {
      setSelectedMajor(found.majorCode);
      setSelectedCohort(found.version);
    }
    if (found?.effectiveFromSemesterId) applyEnrollment(found.effectiveFromSemesterId);
  };

  return {
    selectedMajor, selectedCohort, majorOptions, cohortOptions,
    curriculumId, visibleCurriculums, selectedCurriculum,
    enrollmentSemesterId, semesterList, currentSemester,
    expectedGraduationSemesterId, graduationOptions, identity, graduationConflict,
    resetPlacement,
    onMajorChange: (m: string) => { setSelectedMajor(m); setCurriculumId(''); },
    onCohortChange: (c: string) => { setSelectedCohort(c); setCurriculumId(''); },
    onCurriculumChange,
    onEnrollmentChange: applyEnrollment,
    onCurrentSemesterChange: setCurrentSemester,
    onGraduationChange: setExpectedGraduationSemesterId,
  };
}
