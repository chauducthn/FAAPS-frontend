import { ArrowLeft, ArrowRight, Check, SpinnerGap as Loader2 } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

export const RULE_FORM_STEPS = [
  { id: 1, label: 'Identity' },
  { id: 2, label: 'Condition' },
  { id: 3, label: 'Actions' },
  { id: 4, label: 'Enforcement' },
] as const;

export function RuleFormStepNav({
  step,
  onJumpStep,
}: {
  step: number;
  onJumpStep: (target: number) => void;
}) {
  return (
    <nav aria-label="Rule creation steps" className="border-b border-gray-100 bg-white px-6 py-3">
      <ol className="flex items-center gap-2">
        {RULE_FORM_STEPS.map((item, idx) => {
          const active = step === item.id;
          const completed = step > item.id;
          return (
            <li key={item.id} className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => onJumpStep(item.id)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex min-w-0 items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors',
                  active ? 'bg-orange-50/80' : 'hover:bg-gray-50',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors',
                    active ? 'bg-[#F26F21] text-white' : completed ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500',
                  )}
                >
                  {completed ? <Check className="size-3.5" weight="bold" aria-hidden /> : item.id}
                </span>
                <span className={cn('truncate text-xs font-semibold', active ? 'text-[#C2410C]' : completed ? 'text-gray-800' : 'text-gray-500')}>
                  {item.label}
                </span>
              </button>
              {idx < RULE_FORM_STEPS.length - 1 && (
                <span className={cn('h-px flex-1', completed ? 'bg-emerald-300' : 'bg-gray-200')} aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function RuleFormFooter({
  step,
  isCreate,
  readOnly,
  isLoading,
  canAdvance,
  canSubmit,
  hasCondError,
  onBack,
  onClose,
  onNext,
}: {
  step: number;
  isCreate: boolean;
  readOnly: boolean;
  isLoading?: boolean;
  canAdvance: boolean;
  canSubmit: boolean;
  hasCondError: boolean;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5 border-t border-gray-100 bg-white px-6 py-3.5">
      <span className="text-xs font-medium text-gray-500 tabular-nums">
        Step {step} of {RULE_FORM_STEPS.length}
      </span>
      <div className="flex items-center gap-2">
        {step > 1 ? (
          <button type="button" onClick={onBack} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <ArrowLeft className="size-3.5" aria-hidden /> Back
          </button>
        ) : (
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50">
            {readOnly ? 'Close' : 'Cancel'}
          </button>
        )}

        {step < RULE_FORM_STEPS.length ? (
          <button type="button" onClick={onNext} disabled={!canAdvance} className="inline-flex h-9 min-w-28 items-center justify-center gap-1.5 rounded-lg bg-[#F26F21] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55">
            Next <ArrowRight className="size-3.5" aria-hidden />
          </button>
        ) : !readOnly ? (
          <button
            type="submit"
            disabled={!canSubmit}
            title={hasCondError ? 'Answer every required question to continue' : undefined}
            className="inline-flex h-9 min-w-32 items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? 'Saving…' : isCreate ? 'Create rule' : 'Save changes'}
          </button>
        ) : (
          <button type="button" onClick={onClose} className="h-9 rounded-lg bg-[#F26F21] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14]">
            Close
          </button>
        )}
      </div>
    </div>
  );
}
