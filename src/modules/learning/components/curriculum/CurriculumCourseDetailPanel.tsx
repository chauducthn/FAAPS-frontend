import { useState, type ReactNode } from 'react';
import { ArrowSquareOut, BookOpen, CaretDown, GitBranch, GraduationCap, Info } from '@phosphor-icons/react';
import type { TranscriptRow } from '../../../academic/services/studentAcademicService';
import type { CourseDetail } from '../../../academic/types/course';
import type { EffectiveCurriculumCourse, EligibilityResult, RegularBlockMeta } from './curriculumBlockRules';
import { classifyStatus, type AttemptSummary } from './curriculumCourseHelpers';
import { CourseJourneySection } from './CourseJourneySection';
import { CourseRelationsContent } from './CourseRelationsContent';
import { FormattedCourseText } from './FormattedCourseText';

interface Props {
  selected: EffectiveCurriculumCourse | null;
  termLabel?: string;
  activeSem?: number;
  detail: CourseDetail | null;
  transcriptRow?: TranscriptRow;
  attemptHistory?: AttemptSummary;
  regularBlocks: RegularBlockMeta[];
  availableTerms: { sem: number; label: string }[];
  isLoading: boolean;
  isSavingSchedule: boolean;
  validatePlacement: (course: EffectiveCurriculumCourse, targetSem: number, block: RegularBlockMeta) => EligibilityResult;
  onNavigate: (code: string) => void;
  onSchedule: (course: EffectiveCurriculumCourse, targetSem: number, targetBlock: RegularBlockMeta) => void;
  onScheduleToTerm: (course: EffectiveCurriculumCourse, targetSem: number) => void;
  onResetCourse: (courseCode: string) => void;
}

function StatusPill({ row }: { row?: TranscriptRow }) {
  const kind = classifyStatus(row);
  const score = row?.finalScore != null ? ` · ${row.finalScore.toFixed(1)}` : '';
  if (kind === 'PASSED') return <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Passed{score}</span>;
  if (kind === 'IN_PROGRESS') return <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">Studying</span>;
  if (kind === 'FAILED') return <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">Failed{score}</span>;
  return <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">Not taken</span>;
}

function DetailAccordion({
  title,
  icon,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon?: ReactNode;
  badge?: string | number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-gray-50/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
      >
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-600">
          {icon}
          {title}
          {badge !== undefined && (
            <span className="rounded-full bg-gray-200/70 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-gray-700">
              {badge}
            </span>
          )}
        </span>
        <CaretDown className={`size-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-gray-200/70 bg-white px-3 py-3">{children}</div>}
    </div>
  );
}

export function CurriculumCourseDetailPanel(props: Props) {
  const {
    selected, termLabel, activeSem, detail, transcriptRow, attemptHistory,
    regularBlocks, availableTerms, isLoading, isSavingSchedule,
    validatePlacement, onNavigate, onSchedule, onScheduleToTerm, onResetCourse,
  } = props;
  if (!selected) {
    return (
      <div className="flex h-full min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-[#F26F21]">
          <BookOpen className="size-5" />
        </span>
        <p className="mt-3 text-sm font-bold text-gray-900">Select a course</p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-gray-500">
          Click any course card on the left to view credits, prerequisites, syllabus link, and schedule options.
        </p>
      </div>
    );
  }

  const prereqs = (detail?.relations ?? []).filter((r) => r.kind === 'PREREQUISITE');
  const replacements = (detail?.relations ?? []).filter((r) => r.kind === 'REPLACEMENT');
  const referencedBy = detail?.referencedBy ?? [];

  return (
    <aside className="flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs lg:h-full">
      <div className="shrink-0 border-b border-gray-100 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-orange-50 px-2.5 py-1 font-mono text-sm font-bold text-[#C2410C]">{selected.code}</span>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-700">
              {termLabel ?? `Sem ${selected.semesterNumber}`}
            </span>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-700">{detail?.credits ?? selected.credits} cr</span>
          </div>
          <StatusPill row={transcriptRow} />
        </div>

        <div className="mt-2.5 flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-snug text-gray-900">{detail?.name ?? selected.name}</h3>
          {detail?.materialLink && (
            <a
              href={detail.materialLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Open FLM Syllabus / Materials"
              aria-label="Open FLM Syllabus / Materials"
              className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-orange-200/80 bg-orange-50/70 text-[#C2410C] transition-colors hover:bg-orange-100"
            >
              <ArrowSquareOut className="size-4" />
            </a>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          {selected.groupName ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 font-semibold text-indigo-700">
              <GraduationCap className="size-3.5" /> {selected.groupName}
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-600">
              {selected.mandatory ? 'Mandatory' : 'Elective'}
            </span>
          )}
        </div>
      </div>

      <div key={selected.code} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-4 text-xs">
        {isLoading && (
          <div className="space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-14 w-full animate-pulse rounded-lg bg-gray-100" />
          </div>
        )}

        <CourseJourneySection
          course={selected}
          activeSem={activeSem}
          history={attemptHistory}
          regularBlocks={regularBlocks}
          availableTerms={availableTerms}
          isSaving={isSavingSchedule}
          validatePlacement={validatePlacement}
          onSchedule={onSchedule}
          onScheduleToTerm={onScheduleToTerm}
          onResetCourse={onResetCourse}
        />

        {(prereqs.length > 0 || replacements.length > 0 || referencedBy.length > 0) && (
          <DetailAccordion
            title="Relations"
            icon={<GitBranch className="size-3.5 text-[#F26F21]" />}
            badge={prereqs.length + replacements.length + referencedBy.length}
            defaultOpen
          >
            <CourseRelationsContent
              prereqs={prereqs}
              replacements={replacements}
              referencedBy={referencedBy}
              onNavigate={onNavigate}
            />
          </DetailAccordion>
        )}

        {detail?.description && (
          <DetailAccordion title="Description" icon={<Info className="size-3.5 text-[#F26F21]" />} defaultOpen>
            <FormattedCourseText text={detail.description} />
          </DetailAccordion>
        )}

        {detail?.learningOutcomes && (
          <DetailAccordion title="Learning Outcomes">
            <FormattedCourseText text={detail.learningOutcomes} />
          </DetailAccordion>
        )}
      </div>
    </aside>
  );
}
