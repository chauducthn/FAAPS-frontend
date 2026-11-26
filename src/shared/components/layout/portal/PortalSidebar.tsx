import { NavLink } from 'react-router';
import { type Icon as LucideIcon } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

export interface PortalNavItem {
  label: string;
  description?: string;
  to?: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: number;
}

export interface PortalNavSection {
  title?: string;
  items: PortalNavItem[];
}

interface PortalSidebarProps {
  navSections: PortalNavSection[];
  homePath: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function PortalSidebar({ navSections, collapsed = false, onNavigate }: PortalSidebarProps) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Portal navigation">
      {navSections.map((section, idx) => (
        <div key={section.title ?? idx} className="flex flex-col">
          {section.title && !collapsed && (
            <p
              className={cn(
                'px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]',
                idx === 0 ? 'pt-1' : 'pt-4',
              )}
            >
              {section.title}
            </p>
          )}
          {collapsed && idx > 0 && (
            <div className="my-2 border-t border-[var(--line-soft)]" aria-hidden />
          )}
          <div className="space-y-0.5">
            {section.items.map(({ label, to, icon: Icon, end, badge }) =>
              to ? (
                <NavLink
                  key={label}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  title={collapsed ? label : undefined}
                  aria-label={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center text-[13px] font-medium text-[var(--ink-muted)] transition-colors',
                      'hover:bg-[var(--surface-hover)] hover:text-[var(--ink-primary)]',
                      collapsed
                        ? 'justify-center rounded-lg px-0 py-2.5'
                        : 'gap-2.5 rounded-r-lg border-l-[3px] border-transparent py-2 pl-3 pr-3',
                      isActive &&
                        'bg-[var(--brand-soft)] font-semibold text-[var(--brand)] hover:bg-[var(--brand-soft)]',
                      isActive && !collapsed && 'border-[var(--brand)]',
                    )
                  }
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
                  {badge != null && badge > 0 && (
                    collapsed ? (
                      <span
                        className="absolute right-2 top-2 size-2 rounded-full bg-[var(--brand)]"
                        aria-label={`${badge} pending`}
                      />
                    ) : (
                      <span
                        className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] px-1.5 text-[11px] font-bold tabular-nums text-white"
                        aria-label={`${badge} pending`}
                      >
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )
                  )}
                </NavLink>
              ) : (
                <span
                  key={label}
                  aria-disabled="true"
                  title={collapsed ? `${label} (Coming soon)` : 'Coming soon'}
                  className={cn(
                    'flex cursor-not-allowed items-center text-[13px] font-medium text-[var(--ink-muted)]/50',
                    collapsed
                      ? 'justify-center rounded-lg px-0 py-2.5'
                      : 'gap-2.5 rounded-r-lg border-l-[3px] border-transparent py-2 pl-3 pr-3',
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
                </span>
              ),
            )}
          </div>
        </div>
      ))}
    </nav>
  );
}
