import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentAcademicService } from '../../academic/services/studentAcademicService';

export default function StudentCourses() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const catalog = useQuery({ queryKey: ['student', 'courses', search, page], queryFn: () => studentAcademicService.courses(search, page) });
  const curriculum = useQuery({ queryKey: ['student', 'curriculum'], queryFn: studentAcademicService.curriculum, retry: false });
  const curriculumCourses = useQuery({ queryKey: ['student', 'curriculum-courses'], queryFn: studentAcademicService.curriculumCourses, retry: false });
  const detail = useQuery({ queryKey: ['student', 'course', selectedId], queryFn: () => studentAcademicService.course(selectedId!), enabled: !!selectedId });
  return <div className="space-y-5">
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Curriculum requirements</h2>
      {curriculum.isLoading ? <p>Loading...</p> : curriculum.isError ? <p className="mt-2 text-sm text-gray-600">Your academic curriculum has not been assigned yet.</p> :
        <><p className="mt-2 text-sm">{curriculum.data?.majorCode} · {curriculum.data?.name} ({curriculum.data?.version})</p>
          {curriculumCourses.isError ? <p role="alert" className="text-red-700">Could not load curriculum courses.</p> : curriculumCourses.data?.length ? <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th>Term</th><th>Course</th><th>Credits</th><th>Requirement</th></tr></thead><tbody>
            {curriculumCourses.data.map((row) => <tr key={row.courseId} className="border-t"><td>{row.semesterNumber}</td><td>{row.code} · {row.name}</td><td>{row.credits}</td><td>{row.mandatory ? 'Mandatory' : row.groupName || 'Elective'}</td></tr>)}
          </tbody></table></div> : <p className="mt-2 text-sm text-gray-600">No courses are listed for this curriculum.</p>}</>}
    </section>
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Course catalog</h2>
      <input aria-label="Search courses" placeholder="Search code or name" className="mt-3 w-full rounded border p-2 text-sm" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
      {catalog.isLoading ? <p className="mt-3">Loading...</p> : catalog.isError ? <p role="alert" className="mt-3 text-red-700">Could not load courses.</p> : catalog.data?.length ? <div className="mt-3 space-y-2">
        {catalog.data.map((course) => <button key={course.id} onClick={() => setSelectedId(course.id)} className="block w-full rounded border p-3 text-left text-sm hover:border-orange-500"><strong>{course.code}</strong> · {course.name} · {course.credits} credits</button>)}
        <div className="flex items-center gap-3"><button disabled={page === 0} onClick={() => setPage(page - 1)} className="disabled:opacity-40">Previous</button><span>Page {page + 1}</span><button disabled={catalog.data.length < 20} onClick={() => setPage(page + 1)} className="disabled:opacity-40">Next</button></div>
      </div> : <p className="mt-3 text-sm text-gray-600">No matching courses.</p>}
    </section>
    {selectedId && <section className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex justify-between"><h2 className="text-lg font-semibold">Course details</h2><button onClick={() => setSelectedId(null)}>Close</button></div>
      {detail.isLoading ? <p>Loading...</p> : detail.isError ? <p role="alert" className="text-red-700">Could not load course detail.</p> : detail.data && <div className="mt-3 space-y-2 text-sm">
        <p><strong>{detail.data.course.code} · {detail.data.course.name}</strong></p>
        <p>{detail.data.course.credits} credits · {detail.data.course.category}</p>
        <p>{detail.data.course.description || 'No description provided.'}</p>
        <p><strong>Objectives:</strong> {detail.data.course.objectives || 'Not provided'}</p>
        <p><strong>Learning outcomes:</strong> {detail.data.course.learningOutcomes || 'Not provided'}</p>
        <h3 className="font-semibold">Prerequisites</h3>
        {detail.data.prerequisites.length ? <ul>{detail.data.prerequisites.map((row) => <li key={row.id}>{row.courseCode} · group {row.groupNo} · {row.type}</li>)}</ul> : <p>None recorded.</p>}
      </div>}
    </section>}
  </div>;
}
