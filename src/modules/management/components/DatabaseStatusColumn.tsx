import type { ReactNode } from 'react';
import {
  BookOpen,
  CalendarBlank,
  Database,
  FolderOpen,
  GraduationCap,
  Heartbeat,
  Stack as Layers,
  ShieldCheck,
  User as UserRound,
  Users,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { DatabaseOverview } from '../services/database.service';

interface Props {
  data?: DatabaseOverview;
  isLoading: boolean;
  isError: boolean;
  dataUpdatedAt: number;
}

function EntityCell({ icon, label, value, isLoading }: {
  icon: ReactNode; label: string; value?: number; isLoading: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 bg-white px-3.5 py-2">
      <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-ink-muted">
        <span className="shrink-0 text-ink-subtle [&_svg]:size-4">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      {isLoading ? (
        <span className="h-4 w-9 animate-pulse rounded-sm bg-line-soft" />
      ) : (
        <span className="text-sm font-semibold tabular-nums text-ink-primary">
          {(value ?? 0).toLocaleString('en-US')}
        </span>
      )}
    </div>
  );
}

export function DatabaseStatusColumn({ data, isLoading, isError, dataUpdatedAt }: Props) {
  const scopes = data?.scopes ?? [];
  const totalRows = scopes.reduce((sum, s) => sum + s.rowCount, 0);
  const populatedModules = scopes.filter((s) => s.rowCount > 0).length;
  const maxRows = Math.max(...scopes.map((s) => s.rowCount), 1);
  const syncedAt = dataUpdatedAt > 0
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  const statusTone = isError
    ? 'bg-red-50 text-red-700 ring-red-600/15'
    : isLoading
      ? 'bg-surface-page text-ink-muted ring-line'
      : 'bg-emerald-50 text-emerald-700 ring-emerald-600/15';
  const dotTone = isError ? 'bg-red-500' : isLoading ? 'bg-ink-subtle' : 'bg-emerald-500';
  const statusLabel = isError ? 'Unreachable' : isLoading ? 'Checking' : 'Healthy';

  const entities = [
    { label: 'Users', value: data?.users, icon: <Users /> },
    { label: 'Students', value: data?.students, icon: <GraduationCap /> },
    { label: 'Advisors', value: data?.advisors, icon: <UserRound /> },
    { label: 'Majors', value: data?.majors, icon: <Layers /> },
    { label: 'Cohorts', value: data?.cohorts, icon: <FolderOpen /> },
    { label: 'Courses', value: data?.courses, icon: <BookOpen /> },
    { label: 'Semesters', value: data?.semesters, icon: <CalendarBlank /> },
    { label: 'Tables', value: data?.totalTables, icon: <Database /> },
  ];

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <section className="shrink-0 overflow-hidden rounded-lg border border-line bg-white shadow-2xs">
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
          <div className="flex items-center gap-2">
            <span
              className={
                'flex size-7 shrink-0 items-center justify-center rounded-md ' +
                'bg-surface-page text-ink-secondary ring-1 ring-line'
              }
            >
              <Heartbeat className="size-4" aria-hidden />
            </span>
            <h3 className="text-sm font-semibold tracking-tight text-ink-primary">Database Health</h3>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
              statusTone,
            )}
          >
            <span className={cn('size-1.5 rounded-full', dotTone)} aria-hidden />
            {statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-px bg-line">
          <div className="bg-white px-3.5 py-2.5">
            <p className="text-xs font-medium text-ink-muted">Total rows</p>
            <p className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums text-ink-primary">
              {isLoading ? '—' : totalRows.toLocaleString('en-US')}
            </p>
          </div>
          <div className="bg-white px-3.5 py-2.5">
            <p className="text-xs font-medium text-ink-muted">Tables</p>
            <p className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums text-ink-primary">
              {isLoading ? '—' : (data?.totalTables ?? 0).toLocaleString('en-US')}
            </p>
          </div>
          <div className="bg-white px-3.5 py-2.5">
            <p className="text-xs font-medium text-ink-muted">Active modules</p>
            <p className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums text-ink-primary">
              {isLoading ? '—' : `${populatedModules}/${scopes.length}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-page/60 px-4 py-2 text-[13px]">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-ink-muted">
            <ShieldCheck className="size-4 shrink-0 text-emerald-600" aria-hidden />
            <span className="truncate font-mono font-medium text-ink-secondary">
              {data?.preservedAdminEmail ?? 'current admin'}
            </span>
          </span>
          <span className="shrink-0 text-xs tabular-nums text-ink-subtle">Synced {syncedAt}</span>
        </div>
      </section>

      <section className="shrink-0 overflow-hidden rounded-lg border border-line bg-white shadow-2xs">
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
            Entities &amp; Records
          </h3>
          <span className="text-xs tabular-nums text-ink-subtle">8 groups</span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-line">
          {entities.map((item) => (
            <EntityCell key={item.label} {...item} isLoading={isLoading} />
          ))}
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-white shadow-2xs">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
            Row Distribution
          </h3>
          <span className="text-xs font-medium tabular-nums text-ink-muted">
            {totalRows.toLocaleString('en-US')} rows
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-between gap-1.5 overflow-hidden px-4 py-2.5">
          {isLoading ? (
            [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-4 animate-pulse rounded-sm bg-line-soft" />)
          ) : scopes.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-ink-subtle">No module metrics available.</p>
          ) : (
            scopes.map((scope) => {
              const pct = totalRows > 0 ? Math.round((scope.rowCount / totalRows) * 100) : 0;
              const widthPct = scope.rowCount > 0 ? Math.max(4, Math.round((scope.rowCount / maxRows) * 100)) : 0;
              return (
                <div key={scope.id} className="flex items-center gap-3 text-[13px]">
                  <span className="w-48 shrink-0 truncate font-medium text-ink-secondary" title={scope.label}>
                    {scope.label}
                  </span>
                  <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-line-soft">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${widthPct}%` }} />
                  </div>
                  <span className="w-24 shrink-0 text-right text-xs tabular-nums text-ink-muted">
                    {scope.rowCount.toLocaleString('en-US')} ({pct}%)
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
