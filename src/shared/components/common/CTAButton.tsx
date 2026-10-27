import { Link } from 'react-router';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const ctaVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-orange-600 text-white shadow-sm hover:bg-orange-700',
        outline: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
        light: 'bg-white text-orange-700 shadow-sm hover:bg-orange-50',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        lg: 'px-8 py-3 text-base',
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
    <Link to={to} onClick={onClick} className={cn(ctaVariants({ variant, size }), className)}>
      {children}
    </Link>
  );
}
