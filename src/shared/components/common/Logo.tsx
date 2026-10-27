import { Link } from 'react-router';
import { cn } from '@/shared/lib/utils';
import logo from '@/assets/faaps-logo.png';

interface LogoProps {
  className?: string;
  to?: string;
}

export function Logo({ className, to = '/' }: LogoProps) {
  return (
    <Link to={to} className={cn('flex items-center gap-2', className)} aria-label="FAAPS - Home">
      <img src={logo} alt="FAAPS" className="h-9 w-auto" />
    </Link>
  );
}
