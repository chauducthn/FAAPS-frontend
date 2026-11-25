import type { RestrDraft } from './ruleRestrictionDraft';
import {
  RULE_NUM_CLASS,
  RuleFormField,
  RuleFormSection,
  RuleToggleChip,
} from './RuleFormPrimitives';

const CHIPS: { key: Exclude<keyof RestrDraft, 'maxCreditsNextSemester' | 'maxExtraCredits'>; label: string; hint: string }[] = [
  { key: 'blockRegistration', label: 'Block registration', hint: 'Stop the action' },
  { key: 'blockFinalExam', label: 'Block final exam', hint: 'Attendance gate' },
  { key: 'notifyAdvisor', label: 'Notify advisor', hint: 'Email the advisor' },
  { key: 'requireMeeting', label: 'Require meeting', hint: 'Student meets advisor' },
  { key: 'requireDeanApproval', label: 'Require dean approval', hint: 'Manual sign-off' },
  { key: 'keepHighestScore', label: 'Keep highest score', hint: 'For retakes' },
  { key: 'allowExtraCredits', label: 'Allow extra credits', hint: 'Fast-track perk' },
  { key: 'warnOnly', label: 'Warn only', hint: 'No hard block' },
];

interface Props {
  restr: RestrDraft;
  disabled: boolean;
  errors: Partial<Record<string, string>>;
  setR: <K extends keyof RestrDraft>(key: K, value: RestrDraft[K]) => void;
}

export function RuleRestrictionSection({ restr, disabled, errors, setR }: Props) {
  return (
    <RuleFormSection title="When triggered" hint="What the system does when a student hits this rule.">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {CHIPS.map((c) => (
          <RuleToggleChip
            key={c.key}
            checked={restr[c.key]}
            onChange={(v) => setR(c.key, v)}
            disabled={disabled}
            label={c.label}
            hint={c.hint}
          />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <RuleFormField label="Cap credits next semester" error={errors.maxCreditsNextSemester} hint="Leave empty for no cap.">
          <input
            type="number"
            min={1}
            max={60}
            value={restr.maxCreditsNextSemester}
            disabled={disabled}
            onChange={(e) => setR('maxCreditsNextSemester', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 12"
            aria-label="Cap credits next semester"
            className={RULE_NUM_CLASS}
          />
        </RuleFormField>
        <RuleFormField label="Extra credits granted" error={errors.maxExtraCredits} hint="Leave empty for none.">
          <input
            type="number"
            min={1}
            max={30}
            value={restr.maxExtraCredits}
            disabled={disabled}
            onChange={(e) => setR('maxExtraCredits', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 6"
            aria-label="Extra credits granted"
            className={RULE_NUM_CLASS}
          />
        </RuleFormField>
      </div>
    </RuleFormSection>
  );
}
