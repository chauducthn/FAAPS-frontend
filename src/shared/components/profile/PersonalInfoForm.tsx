import { useEffect, useState } from 'react';
import { EnvelopeSimple as Mail, FloppyDisk as Save } from '@phosphor-icons/react';
import { isValidOptionalPhone } from '@/shared/validation/identity';

export interface PersonalInfoValues {
  fullName: string;
  phone: string;
  specialization?: string;
}

interface PersonalInfoFormProps {
  email: string;
  dateOfBirth?: string | null;
  initialValues: PersonalInfoValues;
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
  showSpecialization = false,
  isSaving = false,
  onSave,
}: PersonalInfoFormProps) {
  const [fullName, setFullName] = useState(initialValues.fullName);
  const [phone, setPhone] = useState(initialValues.phone);
  const [specialization, setSpecialization] = useState(initialValues.specialization ?? '');

  useEffect(() => {
    setFullName(initialValues.fullName);
    setPhone(initialValues.phone);
    setSpecialization(initialValues.specialization ?? '');
  }, [initialValues.fullName, initialValues.phone, initialValues.specialization]);

  const trimmedName = fullName.trim();
  const phoneValid = isValidOptionalPhone(phone);
  const nameValid = trimmedName.length >= 2 && trimmedName.length <= 255;
  const dirty =
    trimmedName !== initialValues.fullName.trim() ||
    phone.trim() !== initialValues.phone.trim() ||
    (showSpecialization && specialization.trim() !== (initialValues.specialization ?? '').trim());

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dirty || !nameValid || !phoneValid || isSaving) return;
    await onSave({
      fullName: trimmedName,
      phone: phone.trim(),
      specialization: showSpecialization ? specialization.trim() : undefined,
    });
  };

  const handleReset = () => {
    setFullName(initialValues.fullName);
    setPhone(initialValues.phone);
    setSpecialization(initialValues.specialization ?? '');
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">Personal information</h2>
          <p className="mt-1 text-sm text-slate-600">
            Keep your display name and contact details up to date.
          </p>
        </div>
        {dirty && (
          <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#c2410c] ring-1 ring-orange-200">
            Unsaved changes
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-700">
            Full name <span className="text-red-500">*</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              maxLength={255}
              aria-invalid={!nameValid}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-[var(--brand)] aria-[invalid=true]:border-red-400"
            />
            {!nameValid && (
              <span className="mt-1 block text-xs font-normal text-red-600">
                Enter at least 2 characters.
              </span>
            )}
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Phone
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              maxLength={20}
              placeholder="0901234567"
              aria-invalid={!phoneValid}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-[var(--brand)] aria-[invalid=true]:border-red-400"
            />
            {!phoneValid && (
              <span className="mt-1 block text-xs font-normal text-red-600">
                Enter a valid phone number (8 to 15 digits).
              </span>
            )}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-700">Email</p>
            <p className="mt-1.5 flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
              <Mail className="size-4 shrink-0 text-slate-400" aria-hidden />
              <span className="truncate">{email}</span>
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-700">Date of birth</p>
            <p className="mt-1.5 flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
              {formatDob(dateOfBirth)}
            </p>
          </div>
        </div>

        {showSpecialization && (
          <label className="block text-xs font-semibold text-slate-700">
            Specialty
            <input
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
              maxLength={120}
              placeholder="e.g. Software Engineering"
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-[var(--brand)]"
            />
          </label>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={!dirty || isSaving}
            onClick={handleReset}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={!dirty || !nameValid || !phoneValid || isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--brand-hover)] disabled:opacity-50"
          >
            <Save className="size-4" aria-hidden />
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
