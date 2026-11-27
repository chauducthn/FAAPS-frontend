import { ChartBar, CheckCircle, Clock, ShieldCheck } from '@phosphor-icons/react';
import type { CourseDetail } from '../../../academic/types/course';

interface ParsedGradingItem {
  name: string;
  meta: string | null;
  weight: string | null;
  criteria: string | null;
  duration: string | null;
  note: string | null;
  raw: string;
}

function parseGradingLine(line: string): ParsedGradingItem {
  const clean = line.replace(/^•\s*/, '').trim();
  const [leftRaw, rightRaw] = clean.split('|').map((s) => s.trim());

  // Pattern: "Practice 1 (on-going, 1 part): 20.0%"
  const headMatch = leftRaw.match(/^(.+?)(?:\s*\(([^)]+)\))?\s*:\s*([0-9.]+%?)$/);
  const name = headMatch ? headMatch[1].trim() : leftRaw;
  const meta = headMatch?.[2]?.trim() ?? null;
  const weight = headMatch?.[3]?.trim() ?? null;

  let criteria: string | null = null;
  let duration: string | null = null;
  const notes: string[] = [];

  if (rightRaw) {
    for (const part of rightRaw.split('·').map((p) => p.trim()).filter(Boolean)) {
      if (/^criteria\s*:/i.test(part)) {
        criteria = part.replace(/^criteria\s*:/i, '').trim();
      } else if (/^duration\s*:/i.test(part)) {
        duration = part.replace(/^duration\s*:/i, '').trim();
      } else {
        notes.push(part);
      }
    }
  }

  return {
    name,
    meta,
    weight,
    criteria,
    duration,
    note: notes.length > 0 ? notes.join(' · ') : null,
    raw: clean,
  };
}

export function CourseGradingTab({ course }: { course: CourseDetail }) {
  if (!course.gradingStructure) {
    return (
      <div className="rounded-lg border border-line bg-white px-6 py-12 text-center text-xs text-ink-subtle">
        No grading structure or pass criteria recorded for {course.code} yet.
      </div>
    );
  }

  const lines = course.gradingStructure
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const passCriteria = lines.filter((l) => l.toLowerCase().startsWith('pass criteria'));
  const items = lines
    .filter((l) => !l.toLowerCase().startsWith('pass criteria'))
    .map(parseGradingLine);

  const totalWeight = items.reduce((sum, it) => {
    const num = it.weight ? parseFloat(it.weight) : Number.NaN;
    return Number.isFinite(num) ? sum + num : sum;
  }, 0);

  return (
    <div className="space-y-3">
      {passCriteria.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-900">
          <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-600" weight="fill" aria-hidden />
          <div className="space-y-0.5">
            {passCriteria.map((text, idx) => (
              <p key={idx} className="font-medium leading-relaxed">
                {text}
              </p>
            ))}
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-line bg-white">
        <header className="flex items-center justify-between gap-2 border-b border-line-soft px-4 py-2.5">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink-primary">
            <ChartBar className="size-4 text-brand" /> Grading components
          </h3>
          {totalWeight > 0 && (
            <span className="rounded-sm bg-line-soft px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-ink-secondary">
              Total {Math.round(totalWeight)}%
            </span>
          )}
        </header>

        <ul className="divide-y divide-line-soft">
          {items.map((item, idx) => (
            <li key={idx} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-ink-primary">{item.name}</span>
                    {item.meta && (
                      <span className="rounded-sm bg-surface-page px-1.5 py-0.5 text-[11px] font-medium text-ink-muted ring-1 ring-inset ring-line">
                        {item.meta}
                      </span>
                    )}
                  </div>

                  {(item.criteria || item.duration) && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-secondary">
                      {item.criteria && (
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="size-3.5 text-ink-subtle" aria-hidden />
                          <span className="text-ink-muted">Min:</span>
                          <span className="font-mono font-semibold text-ink-primary">{item.criteria}</span>
                        </span>
                      )}
                      {item.duration && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5 text-ink-subtle" aria-hidden />
                          <span>{item.duration}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {item.note && (
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{item.note}</p>
                  )}
                </div>

                {item.weight && (
                  <span className="shrink-0 rounded-sm bg-brand-soft px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-brand-ink">
                    {item.weight}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
