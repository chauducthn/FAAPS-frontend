import { Suspense, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { SidebarSimple as PanelLeftClose, SidebarSimple as PanelLeftOpen, X } from '@phosphor-icons/react';
import { Logo } from '@/shared/components/common/Logo';
import { cn } from '@/shared/lib/utils';
import { ForceChangePasswordModal } from '@/modules/auth/components/ForceChangePasswordModal';
import { PortalHeader } from './PortalHeader';
import { PortalSidebar, type PortalNavItem, type PortalNavSection } from './PortalSidebar';
import { usePortalLogoFlip } from './usePortalLogoFlip';

export { PortalSidebar, type PortalNavItem, type PortalNavSection };

const SIDEBAR_STORAGE_KEY = 'faaps-sidebar-collapsed';

const TOGGLE_CLASS =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-ink-subtle transition-colors ' +
  'hover:bg-line-soft hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';

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
  /**
   * Keep the shell exactly one viewport tall and scroll inside the page area only.
   * Pages mark their working region with `.admin-fill` to make it take the remaining height.
   */
  contained?: boolean;
}

export default function PortalLayout({
  navSections,
  homePath,
  roleLabel,
  profilePath,
  headerExtra,
  contained = false,
}: PortalLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsedState);
  const { pathname } = useLocation();
  const resolvedProfilePath = profilePath ?? `${homePath}/profile`;
  const activeItem = useMemo(() => findActiveNavItem(navSections, pathname), [navSections, pathname]);

  const { logoRef, capture: captureLogo } = usePortalLogoFlip(collapsed);

  const toggleCollapsed = () => {
    captureLogo();
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  };

  return (
    <div className={cn('flex bg-surface-page font-sans', contained ? 'h-svh overflow-hidden' : 'min-h-screen')}>
      <aside
        className={cn(
          'sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-line bg-white',
          'motion-safe:transition-[width] motion-safe:duration-200 lg:flex',
          collapsed ? 'w-[72px]' : 'w-[248px]',
        )}
      >
        <div className="relative flex h-16 shrink-0 items-center justify-end border-b border-line pr-5">
          {!collapsed && (
            <div ref={logoRef} className="absolute inset-y-0 left-4 flex w-max items-center">
              <Logo to={homePath} />
            </div>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={TOGGLE_CLASS}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden />
            )}
          </button>
        </div>
        <div className={cn('flex-1 overflow-y-auto', collapsed ? 'p-2.5' : 'px-3 py-4')}>
          <PortalSidebar navSections={navSections} homePath={homePath} collapsed={collapsed} />
        </div>
      </aside>

      <div className={cn('flex min-w-0 flex-1 flex-col', contained && 'min-h-0')}>
        <PortalHeader
          roleLabel={roleLabel}
          profilePath={resolvedProfilePath}
          activeItem={activeItem}
          headerExtra={headerExtra}
          homePath={homePath}
          showLogo={collapsed}
          logoRef={logoRef}
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
                  className="rounded-md p-2 text-ink-secondary hover:bg-line-soft"
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

        <main
          data-contained-main={contained || undefined}
          className={cn(
            'min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-7',
            contained && 'flex min-h-0 flex-col overflow-y-auto overscroll-contain',
          )}
        >
          <Suspense fallback={<p className="text-sm text-ink-subtle">Loading page...</p>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <ForceChangePasswordModal />
    </div>
  );
}
