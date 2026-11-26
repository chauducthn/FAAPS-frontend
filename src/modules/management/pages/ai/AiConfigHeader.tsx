import type { ReactNode } from 'react';
import { Check, Plus, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export { AiConfigFilterBar } from './AiConfigFilterBar';

function StatTile({
  icon,
  label,
  value,
  meta,
  tone,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  meta?: string;
  tone: 'slate' | 'emerald' | 'orange';
  active?: boolean;
  onClick?: () => void;
}) {
  const iconTone: Record<typeof tone, string> = {
    slate: 'bg-gray-100 text-gray-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-orange-50 text-[#C2410C]',
  };
  const activeTone: Record<typeof tone, string> = {
    slate: 'border-gray-400 bg-gray-50/70',
    emerald: 'border-emerald-400/70 bg-emerald-50/40',
    orange: 'border-[#F26F21]/60 bg-orange-50/40',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 text-left transition-colors',
        onClick && 'cursor-pointer',
        active ? activeTone[tone] : 'border-gray-200/80 hover:border-gray-300',
      )}
    >
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', iconTone[tone])}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-lg font-bold leading-none tabular-nums text-gray-900">{value}</span>
          {meta && <span className="truncate text-xs text-gray-400">{meta}</span>}
        </div>
      </div>
    </div>
  );
}

export function AiConfigTopBar({
  total,
  active,
  chat,
  shownCount,
  isFetching,
  status,
  purpose,
  onClearAll,
  onToggleActive,
  onToggleChat,
  onCreate,
}: {
  total?: number;
  active: number;
  chat: number;
  shownCount: number;
  isFetching: boolean;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  purpose: string;
  onClearAll: () => void;
  onToggleActive: () => void;
  onToggleChat: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-3">
        <StatTile
          icon={<Sparkles className="size-4" />}
          label="Total configurations"
          value={total !== undefined ? String(total) : '—'}
          meta={isFetching ? 'Refreshing…' : `${shownCount} on page`}
          tone="slate"
          active={status === 'ALL' && purpose === 'ALL'}
          onClick={onClearAll}
        />
        <StatTile
          icon={<Check className="size-4" />}
          label="Active on page"
          value={String(active)}
          meta="serving live traffic"
          tone="emerald"
          active={status === 'ACTIVE'}
          onClick={onToggleActive}
        />
        <StatTile
          icon={<Zap className="size-4" />}
          label="Chat on page"
          value={String(chat)}
          meta="CHAT purpose"
          tone="orange"
          active={purpose === 'CHAT'}
          onClick={onToggleChat}
        />
      </div>

      <div className="flex shrink-0 items-center justify-end">
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50"
        >
          <Plus className="size-4" strokeWidth={2.25} /> New configuration
        </button>
      </div>
    </div>
  );
}
