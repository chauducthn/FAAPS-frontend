// Study Plan Reviews page for advisors with status tabs, search, and review modal.

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { advisorStudyPlanService } from '../services/advisorStudyPlanService';
import { advisorService } from '../services/advisorService';
import { academicLookupService } from '../services/academicLookupService';
import type { LookupCourse } from '../types/academic-lookup';
import type { StudyPlanDecision } from '../types/study-plan';
import {
  StudyPlanFilterBar,
  StudyPlansHeader,
  type StudyPlanStatusFilter,
} from '../components/study-plans/StudyPlansHeader';
import { StudyPlanList } from '../components/study-plans/StudyPlanListSection';
import { StudyPlanReviewModal } from '../components/study-plans/StudyPlanReviewModal';

export default function AdvisorStudyPlans() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<StudyPlanStatusFilter>('SUBMITTED');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [decision, setDecision] = useState<StudyPlanDecision>('APPROVED');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const plans = useQuery({
    queryKey: ['advisor', 'study-plans', status, page],
    queryFn: () => advisorStudyPlanService.list(status, page, 20),
  });
  const countsQuery = useQuery({
    queryKey: ['advisor', 'study-plans', 'counts'],
    queryFn: () => advisorStudyPlanService.getCounts(),
  });
  const detail = useQuery({
    queryKey: ['advisor', 'study-plan', selectedId],
    queryFn: () => advisorStudyPlanService.detail(selectedId),
    enabled: Boolean(selectedId),
  });
  const selectedStudentId = detail.data?.studentId ?? '';
  const studentDetail = useQuery({
    queryKey: ['advisor', 'student-detail', selectedStudentId],
    queryFn: () => advisorService.getStudentDetail(selectedStudentId),
    enabled: Boolean(selectedStudentId),
  });
  const courseCatalog = useQuery({
    queryKey: ['advisor', 'academic-catalog'],
    queryFn: () => academicLookupService.getCourses(),
    staleTime: 1000 * 60 * 5,
  });

  const courseByCode = useMemo(() => {
    const map = new Map<string, LookupCourse>();
    for (const course of courseCatalog.data ?? []) map.set(course.code, course);
    return map;
  }, [courseCatalog.data]);

  const passedByCode = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const row of studentDetail.data?.transcript ?? []) {
      const done = row.status === 'COMPLETED' || row.status === 'PASSED' || row.creditsEarned > 0;
      if (!done) continue;
      if (!map.has(row.courseCode)) map.set(row.courseCode, row.finalScore);
    }
    return map;
  }, [studentDetail.data]);

  const review = useMutation({
    mutationFn: () => advisorStudyPlanService.decide(selectedId, decision, comment.trim()),
    onSuccess: async () => {
      setMessage('Study plan reviewed successfully.');
      setSelectedId('');
      setComment('');
      setDecision('APPROVED');
      await qc.invalidateQueries({ queryKey: ['advisor', 'study-plans'] });
    },
    onError: (error) => setMessage(apiMessage(error)),
  });

  const submit = () => {
    if (decision !== 'APPROVED' && !comment.trim()) {
      setMessage('A comment is required for rejection or revision requests.');
      return;
    }
    setMessage('');
    review.mutate();
  };

  const switchStatus = (next: StudyPlanStatusFilter) => {
    setStatus(next);
    setPage(0);
  };

  const openReview = (id: string) => {
    setSelectedId(id);
    setDecision('APPROVED');
    setComment('');
    setMessage('');
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = plans.data?.items ?? [];
    if (!q) return items;
    return items.filter(
      (p) =>
        p.studentName?.toLowerCase().includes(q) ||
        p.studentCode?.toLowerCase().includes(q) ||
        p.semesterCode?.toLowerCase().includes(q),
    );
  }, [plans.data, search]);

  return (
    <div className="w-full space-y-6 pb-4">
      <StudyPlansHeader
        counts={countsQuery.data ?? null}
        countsLoading={countsQuery.isLoading}
        countsFailed={countsQuery.isError}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <StudyPlanFilterBar
          status={status}
          search={search}
          onStatusChange={switchStatus}
          onSearchChange={setSearch}
        />

        {message && (
          <p role="status" className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            {message}
          </p>
        )}

        <StudyPlanList
          items={filtered}
          isLoading={plans.isLoading}
          isError={plans.isError}
          search={search}
          page={page}
          totalPages={plans.data?.totalPages ?? 0}
          onPageChange={setPage}
          onOpenReview={openReview}
          onRetry={() => plans.refetch()}
        />
      </section>

      <StudyPlanReviewModal
        open={Boolean(selectedId)}
        detail={detail.data}
        detailLoading={detail.isLoading}
        detailError={detail.isError}
        onRetryDetail={() => detail.refetch()}
        studentDetail={studentDetail.data}
        studentDetailLoading={studentDetail.isLoading}
        courseByCode={courseByCode}
        passedByCode={passedByCode}
        decision={decision}
        comment={comment}
        isSubmitting={review.isPending}
        onDecisionChange={setDecision}
        onCommentChange={setComment}
        onSubmit={submit}
        onClose={() => setSelectedId('')}
      />
    </div>
  );
}
