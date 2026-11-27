import { Check, Cpu, Plus, Scan, Sparkle as Sparkles, Lightning as Zap } from '@phosphor-icons/react';

import { AdminTabBar } from '../../components/AdminTabBar';
import { AdminStatTile } from '../../components/AdminStatTile';

export { AiConfigFilterBar } from './AiConfigFilterBar';

const StatTile = AdminStatTile;

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
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            <Plus className="size-4" /> New configuration
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
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
    </div>
  );
}
