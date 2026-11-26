import { Moon, Sun } from '@phosphor-icons/react';
import { useTheme } from '@/shared/stores/useTheme';
import { cn } from '@/shared/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggleTheme);
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg border border-gray-200',
        'bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40',
        className,
      )}
    >
      {isDark ? (
        <Sun className="size-4 text-amber-400" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </button>
  );
}
