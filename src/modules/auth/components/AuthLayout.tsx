import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from '@phosphor-icons/react';
import { Logo } from '@/shared/components/common/Logo';
import { ThemeToggle } from '@/shared/components/common/ThemeToggle';
import { cn } from '@/shared/lib/utils';
import { AuthShowcase } from './AuthShowcase';

interface AuthLayoutProps {
  title: string;
  description?: ReactNode;
  back?: { to: string; label: string };
  /** `wide` fits multi-column forms such as registration; the photo panel then appears only on xl screens. */
  width?: 'default' | 'wide';
  /** Which side the campus photo sits on; pages on opposite sides swap places during the route transition. */
  photoSide?: 'left' | 'right';
  footer?: ReactNode;
  children: ReactNode;
}

const GRID_COLUMNS = {
  default: { right: 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]', left: 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]' },
  wide: { right: 'xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]', left: 'xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]' },
} as const;

const BACK_LINK_CLASS =
  'group mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors ' +
  'hover:text-ink-primary';

/** Split-screen shell shared by every authentication page: form on the left, campus photo on the right. */
export function AuthLayout(props: AuthLayoutProps) {
  const { title, description, back, width = 'default', photoSide = 'right', footer, children } = props;
  const isWide = width === 'wide';

  return (
    <div className={cn('grid min-h-svh bg-white text-ink-primary antialiased', GRID_COLUMNS[width][photoSide])}>
      <div className="flex min-h-svh flex-col bg-white [view-transition-name:auth-panel]">
        <header className="flex h-16 shrink-0 items-center justify-between px-6 sm:px-10">
          <Logo className="[view-transition-name:brand-logo]" />
          <ThemeToggle className="rounded-md" />
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-12 pt-6 sm:px-10">
          <div className={cn('auth-enter w-full', isWide ? 'max-w-[42rem]' : 'max-w-[24rem]')}>
            {back && (
              <Link to={back.to} viewTransition className={BACK_LINK_CLASS}>
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
                {back.label}
              </Link>
            )}
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-ink-primary">{title}</h1>
            {description && <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>}

            <div className="mt-7">{children}</div>

            {footer && <div className="mt-6 text-sm text-ink-muted">{footer}</div>}
          </div>
        </main>
      </div>

      <AuthShowcase className={cn(isWide ? 'xl:block' : 'lg:block', photoSide === 'left' && 'order-first')} />
    </div>
  );
}
