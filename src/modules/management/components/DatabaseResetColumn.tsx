import { useMemo, useState } from 'react';
import { Warning as AlertTriangle, Stack as Layers, Trash as Trash2 } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { ADMIN_TAB_ACTIVE_COUNT_CLASS, ADMIN_TAB_LIST_CLASS, adminTabClass } from './AdminTabBar';
import type { DatabaseResetScope } from '../services/database.service';

type ModuleGroupKey = 'all' | 'users' | 'academic' | 'learning';

const GROUP_IDS: Record<Exclude<ModuleGroupKey, 'all'>, Set<string>> = {
  users: new Set(['USERS', 'ASSIGNMENTS', 'ADVISING']),
  academic: new Set(['CURRICULUMS', 'COURSES', 'ACADEMIC_RULES']),
  learning: new Set(['STUDENT_RECORDS', 'ATTENDANCE', 'AI_DATA']),
};

const GROUP_TABS: { key: ModuleGroupKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'users', label: 'Users & Advising' },
  { key: 'academic', label: 'Academic' },
  { key: 'learning', label: 'Learning & AI' },
];

const MODULE_CARD_CLASS =
  'flex flex-col justify-between gap-3 rounded-lg border border-line bg-surface-page/50 p-3.5 ' +
  'transition-colors hover:border-ink-subtle/50 hover:bg-surface-hover';

const RESET_MODULE_BTN_CLASS =
  'inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 ' +
  'text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 ' +
  'disabled:cursor-not-allowed disabled:border-line disabled:text-ink-subtle disabled:hover:bg-white';

const RESET_ALL_BTN_CLASS =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-red-600 px-3.5 text-[13px] ' +
  'font-semibold text-white transition-colors hover:bg-red-700 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40';

const MODULE_ICON_CLASS =
  'flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand ' +
  'ring-1 ring-inset ring-brand/20';

const DANGER_ICON_CLASS =
  'flex size-9 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-600 ' +
  'ring-1 ring-inset ring-red-600/15';

function matchesGroup(scopeId: string, group: ModuleGroupKey): boolean {
  if (group === 'all') return true;
  if (GROUP_IDS[group].has(scopeId)) return true;
  if (group === 'learning') {
    return !GROUP_IDS.users.has(scopeId) && !GROUP_IDS.academic.has(scopeId);
  }
  return false;
}

interface Props {
  scopes: DatabaseResetScope[];
  preservedAdminEmail?: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onResetScope: (scope: DatabaseResetScope) => void;
  onResetAll: () => void;
}

export function DatabaseResetColumn({
  scopes, preservedAdminEmail, isLoading, isError, onRetry, onResetScope, onResetAll,
}: Props) {
  const [group, setGroup] = useState<ModuleGroupKey>('all');

  const visibleScopes = useMemo(
    () => scopes.filter((scope) => matchesGroup(scope.id, group)),
    [scopes, group],
  );

  return (
    <div className="flex min-h-0 flex-col gap-4 xl:h-full xl:overflow-hidden">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-white shadow-2xs">
        <div className="flex shrink-0 flex-col gap-3 border-b border-line px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={MODULE_ICON_CLASS}>
              <Layers className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold tracking-tight text-ink-primary">Reset by Module</h3>
              <p className="truncate text-xs text-ink-muted">
                Clear records for an individual domain while keeping the rest intact.
              </p>
            </div>
          </div>

          <div role="tablist" aria-label="Module groups" className={cn(ADMIN_TAB_LIST_CLASS, 'self-start')}>
            {GROUP_TABS.map(({ key, label }) => {
              const active = group === key;
              const count = scopes.filter((s) => matchesGroup(s.id, key)).length;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setGroup(key)}
                  className={adminTabClass(active)}
                >
                  <span>{label}</span>
                  <span
                    className={cn(
                      'rounded-sm px-1.5 py-px text-[11px] font-semibold tabular-nums',
                      active ? ADMIN_TAB_ACTIVE_COUNT_CLASS : 'bg-line-soft text-ink-muted',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2" aria-label="Loading modules">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg border border-line bg-surface-page" />
              ))}
            </div>
          ) : isError ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-ink-primary">Could not load database overview.</p>
              <p className="mt-1 text-xs text-ink-muted">Check your connection and try again.</p>
              <button
                type="button"
                onClick={onRetry}
                className={
                  'mt-4 inline-flex h-9 items-center rounded-md border border-line bg-white ' +
                  'px-3.5 text-[13px] font-medium text-ink-secondary hover:bg-surface-hover'
                }
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleScopes.map((scope) => (
                <div key={scope.id} className={MODULE_CARD_CLASS}>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-ink-primary">{scope.label}</h4>
                    {scope.description && (
                      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
                        {scope.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-line-soft pt-2.5">
                    <span className="text-[13px] tabular-nums text-ink-muted">
                      {scope.rowCount.toLocaleString()} rows · {scope.tables.length} tables
                    </span>
                    <button
                      type="button"
                      disabled={scope.rowCount === 0}
                      onClick={() => onResetScope(scope)}
                      className={RESET_MODULE_BTN_CLASS}
                    >
                      <Trash2 className="size-3.5" aria-hidden /> Reset
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        className={
          'flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-lg ' +
          'border border-red-200 bg-red-50/40 px-4 py-3.5 shadow-2xs'
        }
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className={DANGER_ICON_CLASS}>
            <AlertTriangle className="size-[18px]" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-red-900">Reset Entire Database</h3>
            <p className="text-[13px] text-red-700/85">
              Keeps <span className="font-mono font-semibold">{preservedAdminEmail ?? 'current admin'}</span>, roles &amp; categories.
            </p>
          </div>
        </div>
        <button type="button" onClick={onResetAll} className={RESET_ALL_BTN_CLASS}>
          <Trash2 className="size-4" aria-hidden /> Reset all
        </button>
      </section>
    </div>
  );
}
