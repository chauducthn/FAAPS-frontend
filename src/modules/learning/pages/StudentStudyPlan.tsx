// src/modules/learning/pages/StudentStudyPlan.tsx
// /student/study-plan — the student's Kanban study-plan board.
// Semester columns 1..9 plus a Course Pool (semester 0) for unplaced courses.
// Reuses the Admin roadmap board language (FPT Cam) with HTML5 drag & drop,
// client-side prerequisite-order validation, real study-plan save API and a
// client-generated XLSX export (the backend exposes no study-plan export).

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CircleAlert, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import StudyPlanBoard from '../components/study-plan/StudyPlanBoard';
import { StudyPlanHero, StudyPlanToolbar } from '../components/study-plan/StudyPlanHeader';
import type { StudyPlanColumn, ViewItem } from '../components/study-plan/types';
import { creditsOf } from '../components/study-plan/utils';
import {
  BOARD_POOL,
  BOARD_SEMESTERS,
  fetchBoardData,
  loadDraft,
  saveDraft,
  saveSemesterPlan,
  validateBoard,
  type BoardData,
  type BoardIssue,
} from '../services/studentStudyPlanService';
import { buildStudyPlanXlsx, downloadBlob, type XlsxRow } from '../utils/studyPlanXlsx';

export default function StudentStudyPlan() {
  const board = useQuery({ queryKey: ['student', 'study-plan-board'], queryFn: fetchBoardData, retry: false });
  const [placements, setPlacements] = useState<Record<string, number> | null>(null);
  const [issues, setIssues] = useState<BoardIssue[]>([]);
  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  const data: BoardData | undefined = board.data;

  // Apply the saved draft once the real curriculum arrives.
  useEffect(() => {
    if (data && placements === null) setPlacements(loadDraft(data.curriculumId) ?? {});
  }, [data, placements]);

  const items: ViewItem[] = useMemo(() => {
    if (!data) return [];
    const bad = new Set(issues.map((i) => i.courseId));
    return data.courses.map((c) => ({
      ...c,
      semesterNumber: placements?.[c.courseId] ?? c.semesterNumber,
      invalid: bad.has(c.courseId),
    }));
  }, [data, placements, issues]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );
  }, [items, search]);

  const columns = useMemo(() => {
    const cols: StudyPlanColumn[] = [
      { number: BOARD_POOL, courses: [] },
      ...Array.from({ length: BOARD_SEMESTERS }, (_, i) => ({ number: i + 1, courses: [] as ViewItem[] })),
    ];
    for (const c of filtered) {
      const col = cols.find((k) => k.number === c.semesterNumber) ?? cols[0];
      col.courses.push(c);
    }
    for (const col of cols) col.courses.sort((a, b) => a.code.localeCompare(b.code));
    return cols;
  }, [filtered]);

  const totalCredits = creditsOf(items.filter((c) => c.semesterNumber > 0));
  const issueIds = useMemo(() => new Set(issues.map((i) => i.courseId)), [issues]);

  const move = (courseId: string, semesterNumber: number) => {
    if (!data) return;
    setPlacements((prev) => {
      const next = { ...(prev ?? {}) };
      if (semesterNumber === BOARD_POOL) delete next[courseId];
      else {
        const original = data.courses.find((c) => c.courseId === courseId)?.semesterNumber ?? BOARD_POOL;
        if (semesterNumber === original) delete next[courseId];
        else next[courseId] = semesterNumber;
      }
      saveDraft(data.curriculumId, next);
      return next;
    });
    setValidated(false);
  };

  const handleValidate = () => {
    if (!data) return;
    const found = validateBoard(items, data.passedCodes);
    setIssues(found);
    setValidated(true);
    if (found.length > 0) {
      toast.error(`Plan validation failed: ${found.length} prerequisite issue${found.length === 1 ? '' : 's'}`, {
        description: 'Move the highlighted courses to a later semester, then validate again. Saving is blocked until every issue is resolved.',
      });
    } else {
      toast.success('Study plan is valid', {
        description: `${items.filter((c) => c.semesterNumber > 0).length} courses placed across ${new Set(items.filter((c) => c.semesterNumber > 0).map((c) => c.semesterNumber)).size} semesters — every prerequisite is satisfied in an earlier semester.`,
      });
    }
  };

  const handleSave = async () => {
    if (!data || saving) return;
    const found = validateBoard(items, data.passedCodes);
    setIssues(found);
    setValidated(true);
    if (found.length > 0) {
      toast.error('Cannot save: resolve prerequisite issues first', {
        description: `${found.length} course${found.length === 1 ? '' : 's'} placed before their prerequisites. Saving is blocked.`,
      });
      return;
    }
    const ordered = [...data.semesters].sort((a, b) => a.startDate.localeCompare(b.startDate));
    const targets = columns.filter((c) => c.number > 0 && c.courses.length > 0);
    if (targets.length === 0) {
      toast.error('Nothing to save', { description: 'Drag at least one course from the pool into a semester.' });
      return;
    }
    setSaving(true);
    let ok = 0;
    const failed: string[] = [];
    for (const col of targets) {
      const semester = ordered[col.number - 1];
      if (!semester) {
        failed.push(`Semester ${col.number} (no semester record)`);
        continue;
      }
      try {
        await saveSemesterPlan(
          semester.id,
          col.courses.map((c) => c.courseId),
        );
        ok += 1;
      } catch (error) {
        failed.push(`Semester ${col.number}: ${apiMessage(error)}`);
      }
    }
    setSaving(false);
    if (ok > 0) toast.success(`Saved ${ok} semester plan${ok === 1 ? '' : 's'}`, { description: 'Each semester was saved as a new draft version.' });
    for (const f of failed) toast.error('Save failed', { description: f });
  };

  const handleExport = () => {
    if (!data || items.length === 0) {
      toast.error('Nothing to export', { description: 'Your curriculum has no courses to export yet.' });
      return;
    }
    const rows: XlsxRow[] = [
      ['Semester', 'Course Code', 'Course Name', 'Credits', 'Prerequisites', 'Status'],
      ...[...items]
        .sort((a, b) => a.semesterNumber - b.semesterNumber || a.code.localeCompare(b.code))
        .map((c): XlsxRow => [
          c.semesterNumber === BOARD_POOL ? 'Course Pool (unplaced)' : `Semester ${c.semesterNumber}`,
          c.code,
          c.name,
          c.credits,
          c.prerequisites.length > 0 ? c.prerequisites.map((p) => p.code).join(', ') : 'None',
          issueIds.has(c.courseId) ? 'PREREQUISITE ISSUE' : c.semesterNumber === BOARD_POOL ? 'Unplaced' : 'Planned',
        ]),
      [],
      ['Total planned credits', totalCredits, '', '', '', ''],
      ['Curriculum', `${data.majorCode} — ${data.curriculumName}`, '', '', '', ''],
    ];
    const stamp = new Date().toISOString().slice(0, 10);
    downloadBlob(buildStudyPlanXlsx(rows), `study-plan-${data.majorCode.toLowerCase()}-${stamp}.xlsx`);
    toast.success('Study plan exported', { description: `${items.length} courses exported to XLSX.` });
  };

  const handleReset = () => {
    if (!data) return;
    setPlacements({});
    saveDraft(data.curriculumId, {});
    setIssues([]);
    setValidated(false);
    toast.success('Board reset to the curriculum default', {
      description: 'Your drag & drop draft was cleared.',
    });
  };

  if (board.isLoading) return <BoardSkeleton />;
  if (board.isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <CircleAlert className="size-6" />
        </span>
        <div>
          <p className="text-sm font-bold text-gray-900">Could not load your study plan</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
            {board.isError && !board.error
              ? 'Your academic curriculum has not been assigned yet. The board appears after assignment.'
              : 'The board failed to load. Check your connection and retry.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => board.refetch()}
          className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
        >
          Retry loading
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <StudyPlanHero
        majorCode={data.majorCode}
        curriculumName={data.curriculumName}
        placedCount={items.filter((c) => c.semesterNumber > 0).length}
        totalCount={items.length}
        totalCredits={totalCredits}
        validated={validated}
        issueCount={issues.length}
      />

      <StudyPlanToolbar
        search={search}
        onSearchChange={setSearch}
        onValidate={handleValidate}
        onSave={() => void handleSave()}
        onExport={handleExport}
        onReset={handleReset}
        saving={saving}
        validated={validated}
        issueCount={issues.length}
      />

      {/* Validation banner */}
      {issues.length > 0 && (
        <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3.5">
          <p className="flex items-center gap-2 text-sm font-extrabold text-red-900">
            <ShieldAlert className="size-4 shrink-0" aria-hidden />
            Prerequisite check failed — saving is blocked ({issues.length})
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm font-medium leading-relaxed text-red-900">
            {issues.map((issue) => (
              <li key={issue.courseId}>{issue.message}</li>
            ))}
          </ul>
        </div>
      )}
      {validated && issues.length === 0 && (
        <p role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-950">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          Plan is valid — every prerequisite is satisfied in an earlier semester. You can save now.
        </p>
      )}

      {/* Board */}
      <StudyPlanBoard
        columns={columns}
        columnCount={BOARD_SEMESTERS}
        courseCount={items.length}
        totalCredits={totalCredits}
        dropTarget={dropTarget}
        onMove={move}
        onDragState={setDropTarget}
      />
    </div>
  );
}

/* ---------- Skeletons ---------- */

function BoardSkeleton() {
  return (
    <div className="w-full space-y-5" aria-label="Loading study plan">
      <div className="rounded-2xl bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 py-7">
        <div className="h-7 w-56 animate-pulse rounded bg-white/30" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-white/20" />
      </div>
      <div className="h-16 animate-pulse rounded-2xl bg-white shadow-sm" />
      <div className="flex gap-4 overflow-hidden" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-[280px] shrink-0 space-y-2.5 rounded-2xl border border-gray-200/80 bg-white p-3">
            <div className="h-8 animate-pulse rounded-xl bg-orange-50" style={{ animationDelay: `${i * 70}ms` }} />
            {[0, 1, 2].map((j) => (
              <div key={j} className="h-20 animate-pulse rounded-xl bg-gray-100" style={{ animationDelay: `${(i * 3 + j) * 60}ms` }} />
            ))}
          </div>
        ))}
      </div>
      <p className="text-center text-[11px] font-medium text-gray-400">Loading your study plan...</p>
    </div>
  );
}
