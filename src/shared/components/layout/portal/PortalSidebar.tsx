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
                'px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-subtle',
                idx === 0 ? 'pt-1' : 'pt-4',
              )}
            >
              {section.title}
            </p>
          )}
          {collapsed && idx > 0 && (
            <div className="my-2 border-t border-line" aria-hidden />
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
                      'group relative flex items-center rounded-md text-[13px] font-medium text-ink-muted transition-colors',
                      'hover:bg-surface-hover hover:text-ink-primary [&>svg]:text-ink-subtle hover:[&>svg]:text-ink-secondary',
                      collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3 py-2',
                      isActive && 'bg-line-soft font-semibold text-ink-primary hover:bg-line-soft [&>svg]:!text-brand',
                      isActive &&
                        !collapsed &&
                        'before:absolute before:inset-y-2 before:-left-px before:w-0.5 before:rounded-full before:bg-brand',
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
                        className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-sm bg-brand px-1.5 text-[11px] font-semibold tabular-nums text-white"
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
                    'flex cursor-not-allowed items-center text-[13px] font-medium text-ink-subtle',
                    collapsed ? 'justify-center rounded-md px-0 py-2.5' : 'gap-2.5 rounded-md px-3 py-2',
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
