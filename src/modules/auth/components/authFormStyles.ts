/** Shared visual tokens for every auth form control, so all auth pages look identical. */

const focusRing = 'focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15';

export const authInputClass =
  'block h-11 w-full rounded-md border border-line bg-white px-3.5 text-sm text-ink-primary ' +
  `placeholder:text-ink-subtle transition-[border-color,box-shadow] ${focusRing}`;

export const authSelectClass =
  'block h-11 w-full min-w-0 appearance-none rounded-md border border-line bg-white pl-3 pr-9 text-sm ' +
  'text-ink-primary ' +
  `transition-[border-color,box-shadow] ${focusRing}`;

export const authLabelClass = 'block text-[13px] font-medium text-ink-secondary';

export const authErrorTextClass = 'mt-1.5 text-xs text-red-600';

const buttonBase =
  'flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

export const authPrimaryButtonClass = `${buttonBase} bg-brand text-white hover:bg-brand-hover`;

export const authSecondaryButtonClass = `${buttonBase} border border-line bg-white text-ink-primary hover:bg-surface-hover`;

export const authTextLinkClass = 'font-semibold text-brand-ink transition-colors hover:text-brand';
