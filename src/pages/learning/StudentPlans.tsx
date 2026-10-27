import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiMessage } from '../../lib/apiMessage';
import { studentAcademicService, type LearningTask } from '../../services/studentAcademicService';

const emptyTask = (): LearningTask => ({ title: '', description: '', dueDate: null, resourceUrl: '' });

export default function StudentPlans() {
  const qc = useQueryClient();
  const semesters = useQuery({ queryKey: ['student', 'semesters'], queryFn: studentAcademicService.semesters });
  const curriculum = useQuery({ queryKey: ['student', 'curriculum-courses'], queryFn: studentAcademicService.curriculumCourses, retry: false });
  const studyPlans = useQuery({ queryKey: ['student', 'study-plans'], queryFn: studentAcademicService.studyPlans });
  const coursePlans = useQuery({ queryKey: ['student', 'course-plans'], queryFn: studentAcademicService.coursePlans });
  const [semesterId, setSemesterId] = useState('');
  const [planType, setPlanType] = useState('REGULAR');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courseId, setCourseId] = useState('');
  const [goal, setGoal] = useState('');
  const [tasks, setTasks] = useState<LearningTask[]>([emptyTask()]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedCoursePlan, setSelectedCoursePlan] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const versions = useQuery({ queryKey: ['student', 'study-plan-versions', selectedPlan], queryFn: () => studentAcademicService.studyPlanVersions(selectedPlan), enabled: !!selectedPlan });
  const courseVersions = useQuery({ queryKey: ['student', 'course-plan-versions', selectedCoursePlan], queryFn: () => studentAcademicService.coursePlanVersions(selectedCoursePlan), enabled: !!selectedCoursePlan });
  const run = async (action: () => Promise<unknown>, keys: string[]) => {
    setBusy(true); setMessage('');
    try { await action(); setMessage('Saved successfully.'); await Promise.all(keys.map((key) => qc.invalidateQueries({ queryKey: ['student', key] }))); }
    catch (error) { setMessage(apiMessage(error)); }
    finally { setBusy(false); }
  };
  const toggleCourse = (id: string) => setSelectedCourses((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const updateTask = (index: number, field: keyof LearningTask, value: string) => setTasks((items) => items.map((task, i) => i === index ? { ...task, [field]: value || null } : task));
  return <div className="space-y-6">
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Curriculum study plan</h2>
      <p className="mt-1 text-sm text-gray-600">Choose courses for a semester. Saving creates a new version; submit after resolving validation issues.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <label className="text-sm">Semester <select className="ml-2 rounded border p-2" value={semesterId} onChange={(e) => setSemesterId(e.target.value)}><option value="">Choose semester</option>{semesters.data?.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</select></label>
        <label className="text-sm">Type <select className="ml-2 rounded border p-2" value={planType} onChange={(e) => setPlanType(e.target.value)}>{['REGULAR', 'MAKEUP', 'ACCELERATED', 'REDUCED'].map((type) => <option key={type}>{type}</option>)}</select></label>
      </div>
      {curriculum.isLoading ? <p className="mt-3">Loading curriculum...</p> : curriculum.isError ? <p className="mt-3 text-sm text-amber-700">Your curriculum has not been assigned yet.</p> : curriculum.data?.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{curriculum.data.map((c) => <label key={c.courseId} className="rounded border p-2 text-sm"><input type="checkbox" checked={selectedCourses.includes(c.courseId)} onChange={() => toggleCourse(c.courseId)} /> <strong>{c.code}</strong> · {c.name} ({c.credits} credits)</label>)}</div> : <p className="mt-3 text-sm">No courses in your curriculum.</p>}
      <button disabled={busy || !semesterId || selectedCourses.length === 0} onClick={() => run(() => studentAcademicService.saveStudyPlan({ semesterId, planType, courseIds: selectedCourses }), ['study-plans'])} className="mt-4 rounded bg-orange-600 px-4 py-2 text-sm text-white disabled:opacity-50">Save new version</button>
      <h3 className="mt-5 font-semibold">Current plans</h3>
      {studyPlans.isError ? <p role="alert" className="text-red-700">Could not load plans.</p> : studyPlans.data?.length ? <ul className="mt-2 space-y-2">{studyPlans.data.map((plan) => <li key={plan.header.id} className="rounded border p-3 text-sm">
        <p><strong>{plan.header.semesterCode}</strong> · version {plan.header.version} · {plan.header.status} · {plan.header.totalCredits} credits</p>
        <p>{plan.courses.map((course) => course.code).join(', ')}</p>
        {plan.issues.length > 0 && <ul className="mt-1 text-amber-700">{plan.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
        <div className="mt-2 flex gap-3"><button className="text-orange-700 underline" onClick={() => setSelectedPlan(plan.header.id)}>Versions</button>
          <button className="text-orange-700 underline" onClick={async () => { try { const issues = await studentAcademicService.validateStudyPlan(plan.header.id); setMessage(issues.length === 0 ? 'Plan is valid.' : issues.join(' · ')); } catch (error) { setMessage(apiMessage(error)); } }}>Validate</button>
          {plan.header.status === 'DRAFT' && <button disabled={busy || plan.issues.length > 0} className="text-orange-700 underline disabled:opacity-50" onClick={() => run(() => studentAcademicService.submitStudyPlan(plan.header.id), ['study-plans'])}>Submit</button>}</div>
      </li>)}</ul> : <p className="mt-2 text-sm text-gray-600">No study plans yet.</p>}
      {selectedPlan && <div className="mt-3 rounded bg-gray-50 p-3 text-sm"><button onClick={() => setSelectedPlan('')} className="float-right">Close</button><h4 className="font-semibold">Plan versions</h4>{versions.isError ? <p>Could not load versions.</p> : versions.data?.map((p) => <p key={p.header.id}>Version {p.header.version} · {p.header.status} · {p.courses.map((c) => c.code).join(', ')}</p>)}</div>}
    </section>
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Course learning plan</h2>
      <label className="mt-3 block text-sm">Course <select className="ml-2 max-w-full rounded border p-2" value={courseId} onChange={(e) => setCourseId(e.target.value)}><option value="">Choose course</option>{curriculum.data?.map((c) => <option key={c.courseId} value={c.courseId}>{c.code} · {c.name}</option>)}</select></label>
      <label className="mt-3 block text-sm">Learning goal<textarea className="mt-1 w-full rounded border p-2" rows={2} maxLength={10000} value={goal} onChange={(e) => setGoal(e.target.value)} /></label>
      <h3 className="mt-3 font-semibold">Tasks</h3>
      {tasks.map((task, index) => <div key={index} className="mt-2 grid gap-2 rounded border p-3 sm:grid-cols-2">
        <input aria-label={`Task ${index + 1} title`} className="rounded border p-2 text-sm" placeholder="Task title" maxLength={255} value={task.title} onChange={(e) => updateTask(index, 'title', e.target.value)} />
        <input aria-label={`Task ${index + 1} due date`} className="rounded border p-2 text-sm" type="date" value={task.dueDate ?? ''} onChange={(e) => updateTask(index, 'dueDate', e.target.value)} />
        <textarea aria-label={`Task ${index + 1} description`} className="rounded border p-2 text-sm" placeholder="Description" maxLength={10000} value={task.description ?? ''} onChange={(e) => updateTask(index, 'description', e.target.value)} />
        <input aria-label={`Task ${index + 1} resource URL`} className="rounded border p-2 text-sm" placeholder="Resource URL" maxLength={1000} value={task.resourceUrl ?? ''} onChange={(e) => updateTask(index, 'resourceUrl', e.target.value)} />
        {tasks.length > 1 && <button className="text-left text-sm text-red-700" onClick={() => setTasks((items) => items.filter((_, i) => i !== index))}>Remove task</button>}
      </div>)}
      <div className="mt-3 flex gap-2"><button disabled={tasks.length >= 100} className="rounded border px-3 py-2 text-sm disabled:opacity-50" onClick={() => setTasks((items) => [...items, emptyTask()])}>Add task</button>
        <button disabled={busy || !courseId || tasks.some((task) => !task.title.trim())} className="rounded bg-orange-600 px-3 py-2 text-sm text-white disabled:opacity-50" onClick={() => run(() => studentAcademicService.saveCoursePlan({ courseId, learningGoal: goal, tasks }), ['course-plans'])}>Save new version</button></div>
      <h3 className="mt-5 font-semibold">Current course plans</h3>
      {coursePlans.isError ? <p role="alert" className="text-red-700">Could not load course plans.</p> : coursePlans.data?.length ? <ul className="mt-2 space-y-2">{coursePlans.data.map((plan) => <li key={plan.header.id} className="rounded border p-3 text-sm"><strong>{plan.header.courseCode}</strong> · {plan.header.courseName} · version {plan.header.version}<p>{plan.tasks.length} tasks · {plan.header.learningGoal || 'No goal'}</p><button className="mt-1 text-orange-700 underline" onClick={() => setSelectedCoursePlan(plan.header.id)}>Versions</button></li>)}</ul> : <p className="mt-2 text-sm text-gray-600">No course learning plans yet.</p>}
      {selectedCoursePlan && <div className="mt-3 rounded bg-gray-50 p-3 text-sm"><button className="float-right" onClick={() => setSelectedCoursePlan('')}>Close</button><h4 className="font-semibold">Course plan versions</h4>{courseVersions.isError ? <p>Could not load versions.</p> : courseVersions.data?.map((p) => <p key={p.header.id}>Version {p.header.version} · {p.tasks.map((t) => t.title).join(', ')}</p>)}</div>}
    </section>
    {message && <p role="status" className="rounded bg-white p-3 text-sm">{message}</p>}
  </div>;
}
