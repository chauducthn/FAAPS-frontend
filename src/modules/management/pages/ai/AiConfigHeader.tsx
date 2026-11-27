import { Check, Cpu, Lightning as Zap, Plus, Scan, Sparkle as Sparkles } from '@phosphor-icons/react';
import { AdminStatTile } from '../../components/AdminStatTile';
import { AdminTabBar } from '../../components/AdminTabBar';

export { AiConfigFilterBar } from './AiConfigFilterBar';

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
  onSelectPurpose,
  presetCount = 0,
  onOpenPresets,
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
  onSelectPurpose?: (purpose: string) => void;
  presetCount?: number;
  onOpenPresets?: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="space-y-4">
      <AdminTabBar
        ariaLabel="AI configuration purpose tabs"
        activeKey={purpose}
        onChange={(next) => (onSelectPurpose ? onSelectPurpose(next) : next === 'ALL' ? onClearAll() : onToggleChat())}
        tabs={[
          { key: 'ALL', label: 'All configs', icon: Sparkles, count: total, badgeTone: 'slate' },
          { key: 'CHAT', label: 'Chat', icon: Zap, badgeTone: 'orange' },
          { key: 'EMBEDDING', label: 'Embedding', icon: Cpu, badgeTone: 'slate' },
          { key: 'OCR', label: 'OCR', icon: Scan, badgeTone: 'slate' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {onOpenPresets && presetCount > 0 && (
              <button
                type="button"
                onClick={onOpenPresets}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover"
              >
                <Sparkles className="size-4 text-brand" />
                <span>Presets</span>
                <span className="rounded-sm bg-brand-soft px-1.5 py-px text-[11px] font-semibold tabular-nums text-brand-ink">
                  {presetCount}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-brand px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <Plus className="size-4" /> New configuration
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <AdminStatTile
          icon={<Sparkles className="size-4" />}
          label="Total configurations"
          value={total !== undefined ? String(total) : '—'}
          meta={isFetching ? 'Refreshing…' : `${shownCount} on page`}
          tone="neutral"
          active={status === 'ALL' && purpose === 'ALL'}
          onClick={onClearAll}
        />
        <AdminStatTile
          icon={<Check className="size-4" />}
          label="Active on page"
          value={String(active)}
          meta="serving live traffic"
          tone="success"
          active={status === 'ACTIVE'}
          onClick={onToggleActive}
        />
        <AdminStatTile
          icon={<Zap className="size-4" />}
          label="Chat on page"
          value={String(chat)}
          meta="CHAT purpose"
          tone="brand"
          active={purpose === 'CHAT'}
          onClick={onToggleChat}
        />
      </div>
    </div>
  );
}
