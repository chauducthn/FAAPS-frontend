import { Link } from 'react-router';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const ctaVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white shadow-sm hover:bg-brand-hover',
        outline: 'border border-line bg-white text-ink-primary hover:bg-surface-hover',
        light: 'bg-white text-brand-ink shadow-sm hover:bg-brand-soft',
        outlineLight: 'border border-white/35 bg-transparent text-white hover:bg-white/10',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'sm' },
  }
);

interface CTAButtonProps extends VariantProps<typeof ctaVariants> {
  to?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

/** Shared navigation button. Landing only links to /login and never handles OAuth. */
export function CTAButton({ to = '/login', variant, size, className, children, onClick }: CTAButtonProps) {
  return (
    <Link to={to} onClick={onClick} viewTransition className={cn(ctaVariants({ variant, size }), className)}>
      {children}
    </Link>
  );
}
