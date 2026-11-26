import { useEffect, useState } from 'react';
import { EnvelopeSimple as Mail, FloppyDisk as Save, UserCircle } from '@phosphor-icons/react';
import { isValidOptionalPhone } from '@/shared/validation/identity';

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

const inputCls =
  'mt-1.5 h-9.5 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 outline-none transition-colors focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/15 aria-[invalid=true]:border-red-400';

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

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
            <UserCircle className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Personal information</h2>
            <p className="text-xs text-gray-500">Keep your display name and contact details up to date.</p>
          </div>
        </div>
        {dirty && (
          <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-[#C2410C] ring-1 ring-inset ring-orange-200">
            Unsaved changes
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-gray-700">
            Full name <span className="text-red-500">*</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={255} aria-invalid={!nameValid} className={inputCls} />
            {!nameValid && <span className="mt-1 block text-xs font-normal text-red-600">Enter at least 2 characters.</span>}
          </label>
          <label className="block text-xs font-semibold text-gray-700">
            Phone
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} placeholder="0901234567" aria-invalid={!phoneValid} className={inputCls} />
            {!phoneValid && <span className="mt-1 block text-xs font-normal text-red-600">Enter a valid phone number (8 to 15 digits).</span>}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {editableEmailAndDob ? (
            <label className="block text-xs font-semibold text-gray-700">
              Email <span className="text-red-500">*</span>
              <input type="email" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} maxLength={255} aria-invalid={!emailValid} className={inputCls} />
              {!emailValid && <span className="mt-1 block text-xs font-normal text-red-600">Enter a valid email address.</span>}
            </label>
          ) : (
            <div>
              <p className="text-xs font-semibold text-gray-700">Email</p>
              <p className="mt-1.5 flex h-9.5 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 text-[13px] text-gray-600">
                <Mail className="size-4 shrink-0 text-gray-400" aria-hidden />
                <span className="truncate">{email}</span>
              </p>
            </div>
          )}
          {editableEmailAndDob ? (
            <label className="block text-xs font-semibold text-gray-700">
              Date of birth
              <input type="date" value={dobValue} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDobValue(e.target.value)} className={inputCls} />
            </label>
          ) : (
            <div>
              <p className="text-xs font-semibold text-gray-700">Date of birth</p>
              <p className="mt-1.5 flex h-9.5 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 text-[13px] text-gray-600">
                {formatDob(dateOfBirth)}
              </p>
            </div>
          )}
        </div>

        {showSpecialization && (
          <label className="block text-xs font-semibold text-gray-700">
            Specialty
            <input
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
              maxLength={120}
              placeholder="e.g. Software Engineering"
              className={inputCls}
            />
          </label>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            disabled={!dirty || isSaving}
            onClick={handleReset}
            className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={!dirty || !nameValid || !phoneValid || !emailValid || isSaving}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14] disabled:opacity-50"
          >
            <Save className="size-4" aria-hidden />
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
