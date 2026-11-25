import { NavLink } from 'react-router';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface PortalNavItem {
  label: string;
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
                'px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#98a2b3]',
                idx === 0 ? 'pt-1' : 'pt-5',
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
                      'text-sm font-medium text-[#555f6f] transition-colors hover:bg-gray-50 hover:text-[#151c27]',
                      isActive &&
                        'border-[#f37021] bg-[#fff7ed] font-semibold text-[#f37021] hover:bg-[#fff7ed]',
                    )
                  }
                >
                  <Icon className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
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
                  className="flex cursor-not-allowed items-center gap-2.5 rounded-r-lg border-l-[3px] border-transparent py-2 pl-3 pr-3 text-sm font-medium text-[var(--ink-muted)]/50"
                >
                  <Icon className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
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
