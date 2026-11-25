import { NavLink } from 'react-router';
import { type LucideIcon } from 'lucide-react';
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
  onNavigate?: () => void;
}

export function PortalSidebar({ navSections, onNavigate }: PortalSidebarProps) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Portal navigation">
      {navSections.map((section, idx) => (
        <div key={section.title ?? idx} className="flex flex-col">
          {section.title && (
            <p
              className={cn(
                'px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]',
                idx === 0 ? 'pt-1' : 'pt-4',
              )}
            >
              {section.title}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map(({ label, to, icon: Icon, end, badge }) =>
              to ? (
                <NavLink
                  key={label}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-2.5 rounded-r-lg border-l-[3px] border-transparent py-2 pl-3 pr-3',
                      'text-[13px] font-medium text-[var(--ink-muted)] transition-colors',
                      'hover:bg-[var(--surface-hover)] hover:text-[var(--ink-primary)]',
                      isActive &&
                        'border-[var(--brand)] bg-[var(--brand-soft)] font-semibold text-[var(--brand)]',
                      isActive && 'hover:bg-[var(--brand-soft)]',
                    )
                  }
                >
                  <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {badge != null && badge > 0 && (
                    <span
                      className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] px-1.5 text-[11px] font-bold tabular-nums text-white"
                      aria-label={`${badge} pending`}
                    >
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </NavLink>
              ) : (
                <span
                  key={label}
                  aria-disabled="true"
                  title="Coming soon"
                  className="flex cursor-not-allowed items-center gap-2.5 rounded-r-lg border-l-[3px] border-transparent py-2 pl-3 pr-3 text-[13px] font-medium text-[var(--ink-muted)]/50"
                >
                  <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                </span>
              ),
            )}
          </div>
        </div>
      ))}
    </nav>
  );
}
