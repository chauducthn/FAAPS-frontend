import { Suspense, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { SidebarSimple as PanelLeftClose, SidebarSimple as PanelLeftOpen, X } from '@phosphor-icons/react';
import { Logo } from '@/shared/components/common/Logo';
import { cn } from '@/shared/lib/utils';
import { ForceChangePasswordModal } from '@/modules/auth/components/ForceChangePasswordModal';
import { PortalHeader } from './PortalHeader';
import { PortalSidebar, type PortalNavItem, type PortalNavSection } from './PortalSidebar';

export { PortalSidebar, type PortalNavItem, type PortalNavSection };

const SIDEBAR_STORAGE_KEY = 'faaps-sidebar-collapsed';

function readCollapsedState(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
}

function findActiveNavItem(sections: PortalNavSection[], pathname: string): PortalNavItem | undefined {
  let bestMatch: PortalNavItem | undefined;
  let bestLen = -1;
  for (const section of sections) {
    for (const item of section.items) {
      if (!item.to) continue;
      const matches = item.end
        ? pathname === item.to
        : pathname === item.to || pathname.startsWith(`${item.to}/`);
      if (matches && item.to.length > bestLen) {
        bestMatch = item;
        bestLen = item.to.length;
      }
    }
  }
  return bestMatch;
}

interface PortalLayoutProps {
  navSections: PortalNavSection[];
  homePath: string;
  roleLabel: string;
  profilePath?: string;
  headerExtra?: React.ReactNode;
}

export default function PortalLayout({
  navSections,
  homePath,
  roleLabel,
  profilePath,
  headerExtra,
}: PortalLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsedState);
  const { pathname } = useLocation();
  const resolvedProfilePath = profilePath ?? `${homePath}/profile`;
  const activeItem = useMemo(() => findActiveNavItem(navSections, pathname), [navSections, pathname]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-[var(--surface-page)] font-sans">
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[#e5e7eb] bg-white',
          'transition-[width] duration-200 lg:flex',
          collapsed ? 'w-[72px]' : 'w-[248px]',
        )}
      >
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-[#e5e7eb]',
            collapsed ? 'justify-center px-2' : 'justify-between gap-2 px-4',
          )}
        >
          {!collapsed && <Logo to={homePath} />}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden />
            )}
          </button>
        </div>
        <div className={cn('flex-1 overflow-y-auto', collapsed ? 'p-2.5' : 'p-4')}>
          <PortalSidebar navSections={navSections} homePath={homePath} collapsed={collapsed} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalHeader
          roleLabel={roleLabel}
          profilePath={resolvedProfilePath}
          activeItem={activeItem}
          headerExtra={headerExtra}
          onOpenMenu={() => setMenuOpen(true)}
        />

        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-[260px] overflow-y-auto bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <Logo to={homePath} />
                <button
                  type="button"
                  className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                >
                  <X className="size-5" />
                </button>
              </div>
              <PortalSidebar
                navSections={navSections}
                homePath={homePath}
                onNavigate={() => setMenuOpen(false)}
              />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-8">
          <Suspense fallback={<p className="text-sm text-gray-500">Loading page...</p>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <ForceChangePasswordModal />
    </div>
  );
}
