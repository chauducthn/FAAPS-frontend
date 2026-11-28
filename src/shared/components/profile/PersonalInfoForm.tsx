import { useEffect, useState } from 'react';
import { EnvelopeSimple as Mail, FloppyDisk as Save } from '@phosphor-icons/react';
import { modalButtonClass } from '@/shared/components/ui/ModalParts';
import { isValidOptionalPhone } from '@/shared/validation/identity';
import { ProfileCard, profileFieldErrorClass, profileInputClass, profileLabelClass, profileReadonlyClass } from './ProfileCard';

export interface PersonalInfoValues {
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string | null;
  specialization?: string;
}

interface PersonalInfoFormProps {
  email: string;
  dateOfBirth?: string | null;
  initialValues: PersonalInfoValues;
  editableEmailAndDob?: boolean;
  showSpecialization?: boolean;
  isSaving?: boolean;
  onSave: (values: PersonalInfoValues) => void;
}

function formatDob(value?: string | null): string {
  if (!value) return 'Not provided';
  const [y, m, d] = value.split('-');
  return y && m && d ? `${d}/${m}/${y}` : value;
}

export function PersonalInfoForm({
  email,
  dateOfBirth,
  initialValues,
  editableEmailAndDob = false,
  showSpecialization = false,
  isSaving = false,
  onSave,
}: PersonalInfoFormProps) {
  const [fullName, setFullName] = useState(initialValues.fullName);
  const [phone, setPhone] = useState(initialValues.phone);
  const [emailValue, setEmailValue] = useState(email);
  const [dobValue, setDobValue] = useState(dateOfBirth ?? '');
  const [specialization, setSpecialization] = useState(initialValues.specialization ?? '');

  useEffect(() => {
    setFullName(initialValues.fullName);
    setPhone(initialValues.phone);
    setEmailValue(email);
    setDobValue(dateOfBirth ?? '');
    setSpecialization(initialValues.specialization ?? '');
  }, [initialValues.fullName, initialValues.phone, initialValues.specialization, email, dateOfBirth]);

  const trimmedName = fullName.trim();
  const trimmedEmail = emailValue.trim();
  const phoneValid = isValidOptionalPhone(phone);
  const nameValid = trimmedName.length >= 2 && trimmedName.length <= 255;
  const emailValid = !editableEmailAndDob || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const dirty =
    trimmedName !== initialValues.fullName.trim() ||
    phone.trim() !== initialValues.phone.trim() ||
    (editableEmailAndDob &&
      (trimmedEmail !== email.trim() || dobValue !== (dateOfBirth ?? ''))) ||
    (showSpecialization && specialization.trim() !== (initialValues.specialization ?? '').trim());

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dirty || !nameValid || !phoneValid || !emailValid || isSaving) return;
    await onSave({
      fullName: trimmedName,
      phone: phone.trim(),
      email: editableEmailAndDob ? trimmedEmail : undefined,
      dateOfBirth: editableEmailAndDob ? (dobValue || null) : undefined,
      specialization: showSpecialization ? specialization.trim() : undefined,
    });
  };

  const handleReset = () => {
    setFullName(initialValues.fullName);
    setPhone(initialValues.phone);
    setEmailValue(email);
    setDobValue(dateOfBirth ?? '');
    setSpecialization(initialValues.specialization ?? '');
  };

  const invalid = !nameValid || !phoneValid || !emailValid;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ProfileCard
        title="Personal information"
        description="Keep your display name and contact details up to date."
        aside={
          dirty && (
            <span className="inline-flex items-center rounded-sm bg-brand-soft px-1.5 py-0.5 text-[11px] font-medium text-brand-ink">
              Unsaved changes
            </span>
          )
        }
        footer={
          <>
            <button type="button" disabled={!dirty || isSaving} onClick={handleReset} className={modalButtonClass('secondary')}>
              Reset
            </button>
            <button type="submit" disabled={!dirty || invalid || isSaving} className={modalButtonClass('primary')}>
              <Save className="size-4" aria-hidden />
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </>
        }
      >
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
          <label className={profileLabelClass}>
            Full name <span className="text-brand">*</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={255}
              aria-invalid={!nameValid}
              className={profileInputClass}
            />
            {!nameValid && <span className={profileFieldErrorClass}>Enter at least 2 characters.</span>}
          </label>
          <label className={profileLabelClass}>
            Phone
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
              placeholder="0901234567"
              aria-invalid={!phoneValid}
              className={profileInputClass}
            />
            {!phoneValid && <span className={profileFieldErrorClass}>Enter a valid phone number (8 to 15 digits).</span>}
          </label>

          {editableEmailAndDob ? (
            <label className={profileLabelClass}>
              Email <span className="text-brand">*</span>
              <input
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                maxLength={255}
                aria-invalid={!emailValid}
                className={profileInputClass}
              />
              {!emailValid && <span className={profileFieldErrorClass}>Enter a valid email address.</span>}
            </label>
          ) : (
            <div>
              <p className={profileLabelClass}>Email</p>
              <p className={profileReadonlyClass}>
                <Mail className="size-4 shrink-0 text-ink-subtle" aria-hidden />
                <span className="truncate">{email}</span>
              </p>
            </div>
          )}
          {editableEmailAndDob ? (
            <label className={profileLabelClass}>
              Date of birth
              <input
                type="date"
                value={dobValue}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDobValue(e.target.value)}
                className={profileInputClass}
              />
            </label>
          ) : (
            <div>
              <p className={profileLabelClass}>Date of birth</p>
              <p className={profileReadonlyClass}>{formatDob(dateOfBirth)}</p>
            </div>
          )}

          {showSpecialization && (
            <label className={`${profileLabelClass} sm:col-span-2`}>
              Specialty
              <input
                value={specialization}
                onChange={(event) => setSpecialization(event.target.value)}
                maxLength={120}
                placeholder="e.g. Software Engineering"
                className={profileInputClass}
              />
            </label>
          )}
        </div>
      </ProfileCard>
    </form>
  );
}
