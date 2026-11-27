import { SpinnerGap } from '@phosphor-icons/react';

interface AuthStatusScreenProps {
  message: string;
  /** Show a spinner while work is still in progress. */
  busy?: boolean;
}

/** Full-screen, centered status message used while an auth step resolves. */
export function AuthStatusScreen({ message, busy = false }: AuthStatusScreenProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-white px-6 text-center text-sm text-ink-muted">
      {busy && <SpinnerGap className="size-6 animate-spin text-brand" aria-hidden />}
      <p>{message}</p>
    </div>
  );
}
