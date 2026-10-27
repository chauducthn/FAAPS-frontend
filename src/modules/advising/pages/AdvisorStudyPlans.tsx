import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../shared/components/ui/Modal';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { advisorStudyPlanService } from '../services/advisorStudyPlanService';
import type { StudyPlanDecision } from '../types/study-plan';

const statuses = ['SUBMITTED', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'];

export default function AdvisorStudyPlans() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('SUBMITTED');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [decision, setDecision] = useState<StudyPlanDecision>('APPROVED');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const plans = useQuery({ queryKey: ['advisor', 'study-plans', status, page],
    queryFn: () => advisorStudyPlanService.list(status, page) });
  const detail = useQuery({ queryKey: ['advisor', 'study-plan', selectedId],
    queryFn: () => advisorStudyPlanService.detail(selectedId), enabled: !!selectedId });
  const review = useMutation({
    mutationFn: () => advisorStudyPlanService.decide(selectedId, decision, comment),
    onSuccess: async () => {
      setMessage('Study plan reviewed successfully.'); setSelectedId(''); setComment('');
      await qc.invalidateQueries({ queryKey: ['advisor', 'study-plans'] });
    },
    onError: (error) => setMessage(apiMessage(error)),
  });
  const submit = () => {
    if (decision !== 'APPROVED' && !comment.trim()) {
      setMessage('A comment is required for rejection or revision requests.'); return;
    }
    setMessage(''); review.mutate();
  };

  return <div className="mx-auto max-w-6xl space-y-5">
    <header><p className="text-xs text-gray-500">Advisor / Study Plans</p>
      <h1 className="mt-1 text-2xl font-semibold">Study Plan Reviews</h1>
      <p className="mt-1 text-sm text-gray-600">Review submitted plans from students assigned to you.</p></header>
    <label className="block text-sm">Status <select className="ml-2 rounded border bg-white p-2"
      value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
      {statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
    {message && <p role="status" className="rounded bg-white p-3 text-sm">{message}</p>}
    <section className="overflow-hidden rounded-xl bg-white shadow-sm">
      {plans.isLoading ? <p className="p-5">Loading study plans...</p> : plans.isError ?
        <p role="alert" className="p-5 text-red-700">Could not load study plans.</p> : plans.data?.items.length ?
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-600">
          <tr><th className="p-3">Student</th><th className="p-3">Semester</th><th className="p-3">Version</th>
            <th className="p-3">Credits</th><th className="p-3">Submitted</th><th className="p-3">Action</th></tr></thead>
          <tbody>{plans.data.items.map((plan) => <tr key={plan.id} className="border-t">
            <td className="p-3"><strong>{plan.studentName}</strong><div className="text-gray-500">{plan.studentCode}</div></td>
            <td className="p-3">{plan.semesterCode}</td><td className="p-3">{plan.version}</td>
            <td className="p-3">{plan.totalCredits}</td>
            <td className="p-3">{plan.submittedAt ? new Date(plan.submittedAt).toLocaleString() : '—'}</td>
            <td className="p-3"><button className="text-orange-700 underline" onClick={() => setSelectedId(plan.id)}>View</button></td>
          </tr>)}</tbody></table></div> : <p className="p-5 text-gray-600">No study plans with this status.</p>}
      {plans.data && plans.data.totalPages > 1 && <footer className="flex justify-end gap-3 border-t p-3 text-sm">
        <button disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</button>
        <span>Page {page + 1} of {plans.data.totalPages}</span>
        <button disabled={page + 1 >= plans.data.totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
      </footer>}
    </section>
    <Modal open={!!selectedId} onClose={() => setSelectedId('')} title="Study plan review">
      <div className="overflow-y-auto p-6">{detail.isLoading ? <p>Loading...</p> : detail.isError ?
        <p className="text-red-700">Could not load this study plan.</p> : detail.data && <div className="space-y-4">
          <div><h2 className="text-xl font-semibold">{detail.data.studentName}</h2><p className="text-sm text-gray-600">{detail.data.studentCode} · {detail.data.plan.header.semesterCode} · {detail.data.plan.header.totalCredits} credits</p></div>
          <div>{detail.data.plan.courses.map((course) => <p key={course.id} className="border-b py-2 text-sm"><strong>{course.code}</strong> · {course.name} · {course.credits} credits</p>)}</div>
          {detail.data.plan.issues.length > 0 && <div className="rounded bg-amber-50 p-3 text-sm text-amber-900"><strong>Validation warnings</strong>{detail.data.plan.issues.map((issue) => <p key={issue}>{issue}</p>)}</div>}
          {detail.data.plan.header.status === 'SUBMITTED' && <><label className="block text-sm">Decision
            <select className="mt-1 w-full rounded border p-2" value={decision} onChange={(e) => setDecision(e.target.value as StudyPlanDecision)}>
              <option value="APPROVED">Approve</option><option value="NEEDS_REVISION">Request revision</option><option value="REJECTED">Reject</option>
            </select></label><label className="block text-sm">Comment
              <textarea className="mt-1 w-full rounded border p-2" rows={4} maxLength={10000} value={comment} onChange={(e) => setComment(e.target.value)} /></label>
            <button disabled={review.isPending} onClick={submit} className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-50">Confirm decision</button></>}
        </div>}</div>
    </Modal>
  </div>;
}
