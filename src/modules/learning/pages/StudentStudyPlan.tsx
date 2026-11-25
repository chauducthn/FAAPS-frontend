// Student Kanban study-plan board with drag-and-drop, prerequisite validation, and XLSX export.

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import StudyPlanBoard from '../components/study-plan/StudyPlanBoard';
import { StudyPlanHero, StudyPlanToolbar } from '../components/study-plan/StudyPlanHeader';
import {
  exportStudyPlanBoard,
  StudyPlanBoardSkeleton,
  StudyPlanErrorState,
  StudyPlanValidationBanner,
} from '../components/study-plan/StudyPlanStates';
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

export default function StudentStudyPlan() {
  const board = useQuery({ queryKey: ['student', 'study-plan-board'], queryFn: fetchBoardData, retry: false });
  const [placements, setPlacements] = useState<Record<string, number> | null>(null);
  const [issues, setIssues] = useState<BoardIssue[]>([]);
  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  const data: BoardData | undefined = board.data;

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
    return items.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
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
        await saveSemesterPlan(semester.id, col.courses.map((c) => c.courseId));
        ok += 1;
      } catch (error) {
        failed.push(`Semester ${col.number}: ${apiMessage(error)}`);
      }
    }
    setSaving(false);
    if (ok > 0) toast.success(`Saved ${ok} semester plan${ok === 1 ? '' : 's'}`, { description: 'Each semester was saved as a new draft version.' });
    for (const f of failed) toast.error('Save failed', { description: f });
  };

  const handleReset = () => {
    if (!data) return;
    setPlacements({});
    saveDraft(data.curriculumId, {});
    setIssues([]);
    setValidated(false);
    toast.success('Board reset to the curriculum default', { description: 'Your drag & drop draft was cleared.' });
  };

  if (board.isLoading) return <StudyPlanBoardSkeleton />;
  if (board.isError || !data) {
    return <StudyPlanErrorState hasNoErrorDetail={board.isError && !board.error} onRetry={() => board.refetch()} />;
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
        onExport={() => exportStudyPlanBoard(data, items, issueIds, totalCredits)}
        onReset={handleReset}
        saving={saving}
        validated={validated}
        issueCount={issues.length}
      />

      <StudyPlanValidationBanner issues={issues} validated={validated} />

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
