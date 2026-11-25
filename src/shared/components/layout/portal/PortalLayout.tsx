import { Suspense, useState } from 'react';
import { Outlet } from 'react-router';
import { X } from 'lucide-react';
import { Logo } from '@/shared/components/common/Logo';
import { PortalHeader } from './PortalHeader';
import { PortalSidebar, type PortalNavItem, type PortalNavSection } from './PortalSidebar';

export { PortalSidebar, type PortalNavItem, type PortalNavSection };

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
  const resolvedProfilePath = profilePath ?? `${homePath}/profile`;

  return (
    <div className="flex min-h-screen bg-[var(--surface-page)] font-sans">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-[#e5e7eb] px-4">
          <Logo to={homePath} />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <PortalSidebar navSections={navSections} homePath={homePath} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalHeader
          roleLabel={roleLabel}
          profilePath={resolvedProfilePath}
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
    </div>
  );
}
