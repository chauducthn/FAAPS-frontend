import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, GraduationCap, MagnifyingGlass, SlidersHorizontal, X } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { studentAcademicService, type CurriculumCourse } from '../../academic/services/studentAcademicService';
import CourseDetailModal from '../../management/components/courses/CourseDetailModal';
import {
  useMyCurriculum,
  useMyCurriculumCourses,
  useMyProfile,
  useMyTranscript,
} from '../hooks/queries/useStudentQueries';
import { CurriculumCourseTable } from './curriculum/CurriculumCourseTable';
import {
  buildCurriculumCourseDetail,
  buildTranscriptMap,
  groupCoursesBySemester,
} from './curriculum/curriculumCourseHelpers';

const readOnlyRelation = async (): Promise<never> => {
  toast.error('Course relations are read-only for students.');
  throw new Error('Read-only for students');
};

export function StudentCurriculumCoursesCard() {
  const profile = useMyProfile();
  const curriculum = useMyCurriculum();
  const coursesQuery = useMyCurriculumCourses();
  const transcriptQuery = useMyTranscript();

  const [activeSem, setActiveSem] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CurriculumCourse | null>(null);

  const detailQuery = useQuery({
    queryKey: ['student', 'curriculum-course-detail', selectedCourse?.courseId],
    queryFn: () => studentAcademicService.course(selectedCourse!.courseId),
    enabled: !!selectedCourse?.courseId,
    retry: false,
  });

  const allCourses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data]);
  const transcriptByCode = useMemo(() => buildTranscriptMap(transcriptQuery.data), [transcriptQuery.data]);
  const semesters = useMemo(() => groupCoursesBySemester(allCourses, transcriptByCode), [allCourses, transcriptByCode]);

  useEffect(() => {
    if (semesters.length === 0) return;
    if (activeSem !== null && semesters.some((s) => s.sem === activeSem)) return;
    const preferred = profile.data?.currentSemester;
    if (preferred != null && semesters.some((s) => s.sem === preferred)) setActiveSem(preferred);
    else if (semesters.some((s) => s.sem === 1)) setActiveSem(1);
    else setActiveSem(semesters[0].sem);
  }, [semesters, activeSem, profile.data?.currentSemester]);

  const totalCredits = useMemo(() => allCourses.reduce((s, c) => s + c.credits, 0), [allCourses]);
  const isSearching = search.trim().length > 0;

  const visibleCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return semesters.find((s) => s.sem === activeSem)?.courses ?? [];
    return allCourses.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.groupName ?? '').toLowerCase().includes(q),
    );
  }, [allCourses, semesters, activeSem, search]);

  const currentSemInfo = useMemo(() => semesters.find((s) => s.sem === activeSem) ?? null, [semesters, activeSem]);
  const adaptedDetail = useMemo(
    () => buildCurriculumCourseDetail(detailQuery.data, detailQuery.isError, selectedCourse),
    [detailQuery.data, detailQuery.isError, selectedCourse],
  );

  const handleNavigateCourse = (code: string) => {
    const match = allCourses.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (match) setSelectedCourse(match);
    else toast.info(`${code} is not in your active curriculum list.`);
  };

  const isLoading = curriculum.isLoading || coursesQuery.isLoading;
  const noCurriculum = !isLoading && (!curriculum.data || (coursesQuery.isError && allCourses.length === 0));

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
            <BookOpen className="size-4.5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">Curriculum Courses</h2>
              {curriculum.data && (
                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#C2410C]">
                  {curriculum.data.majorCode} · {curriculum.data.version}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-gray-500">
              {curriculum.data
                ? `${curriculum.data.name} · ${allCourses.length} courses · ${totalCredits} credits`
                : 'Courses in your active curriculum.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isLoading && !noCurriculum && (
            <div className="relative w-48 sm:w-56">
              <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search all courses..."
                className="h-8 w-full rounded-lg border border-gray-200 bg-white pr-7 pl-8 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}
          <Link to="/student/profile" className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:border-orange-300 hover:text-[#C2410C]">
            <SlidersHorizontal className="size-3.5" /> Major / Combo
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 border-t border-gray-100 p-5" aria-label="Loading curriculum courses">
          {Array.from({ length: 5 }).map((_, idx) => <div key={idx} className="h-11 w-full animate-pulse rounded-lg bg-gray-100" />)}
        </div>
      ) : noCurriculum ? (
        <div className="flex flex-col items-center gap-3 border-t border-gray-100 px-6 py-12 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-[#F26F21]"><GraduationCap className="size-5" /></span>
          <div>
            <p className="text-sm font-bold text-gray-900">No curriculum assigned yet</p>
            <p className="mt-1 max-w-md text-xs text-gray-500">Select your major, curriculum version, and FLM specialization combo in My Profile to view your courses.</p>
          </div>
          <Link to="/student/profile" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 text-xs font-bold text-white transition-colors hover:bg-[#e05f14]">Go to My Profile</Link>
        </div>
      ) : (
        <>
          {!isSearching ? (
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5">
              <div className="-mb-px flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Semesters">
                {semesters.map(({ sem, allPassed }) => (
                  <button
                    key={sem} type="button" role="tab" aria-selected={sem === activeSem} onClick={() => setActiveSem(sem)}
                    className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
                      sem === activeSem ? 'border-[#F26F21] text-[#F26F21]' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
                    }`}
                  >
                    <span>Sem {sem}</span>
                    {allPassed && <span className="size-1.5 rounded-full bg-emerald-500" title="All courses passed" />}
                  </button>
                ))}
              </div>
              {currentSemInfo && (
                <p className="hidden shrink-0 text-xs text-gray-500 md:block">
                  {currentSemInfo.courses.length} courses · {currentSemInfo.credits} cr
                  {currentSemInfo.passed > 0 && <span className="ml-1.5 font-semibold text-emerald-700">({currentSemInfo.passed}/{currentSemInfo.courses.length} passed)</span>}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between border-y border-gray-100 bg-gray-50/70 px-5 py-2 text-xs text-gray-600">
              <span>Found <strong className="text-gray-900">{visibleCourses.length}</strong> {visibleCourses.length === 1 ? 'course' : 'courses'} matching "{search.trim()}"</span>
              <button type="button" onClick={() => setSearch('')} className="font-semibold text-[#F26F21] hover:underline">Clear search</button>
            </div>
          )}
          <CurriculumCourseTable courses={visibleCourses} transcriptByCode={transcriptByCode} showSemester={isSearching} onSelect={setSelectedCourse} />
        </>
      )}

      <CourseDetailModal
        open={!!selectedCourse} course={adaptedDetail} isLoading={detailQuery.isLoading || detailQuery.isFetching}
        readOnly onClose={() => setSelectedCourse(null)} onNavigate={handleNavigateCourse}
        onAddRelation={readOnlyRelation} onUpdateRelation={readOnlyRelation} onRemoveRelation={readOnlyRelation}
      />
    </section>
  );
}
