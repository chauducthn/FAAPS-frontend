// src/pages/advising/AdvisorProfile.tsx
// "My Profile" — redesigned into the Overview design system:
// FPT-orange hero + 2-column identity/edit layout.
// Business rules preserved: read profile via advisorService, update display
// name via API. Extra fields (phone, specialty, department, office) are mock
// supplements until the backend returns them — edited locally.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  CircleCheckBig,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { useAuth } from '../../auth/stores/useAuth';
import { advisorService } from '../services/advisorService';
import { cn } from '@/shared/lib/utils';

// Mock supplements — backend does not return these yet.
const MOCK_EXTRAS = {
  phone: '+84 28 7300 5588',
  specialty: 'Software Engineering',
  department: 'School of Information Technology',
  office: 'Room A-305, Innovation Building',
};

const STATUS_STYLES: Record<string, { pill: string; dot: string; label: string }> = {
  ACTIVE: { pill: 'bg-emerald-100 text-emerald-900 ring-emerald-300', dot: 'bg-emerald-600', label: 'Active' },
  INACTIVE: { pill: 'bg-slate-200 text-slate-800 ring-slate-300', dot: 'bg-slate-500', label: 'Inactive' },
  ON_LEAVE: { pill: 'bg-amber-100 text-amber-900 ring-amber-300', dot: 'bg-amber-500', label: 'On leave' },
};

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatDate(iso: string | null) {
  if (!iso) return 'Not assigned';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdvisorProfile() {
  const qc = useQueryClient();
  const user = useAuth((state) => state.user);
  const setUser = useAuth((state) => state.setUser);
  const profile = useQuery({ queryKey: ['advisor', 'profile'], queryFn: advisorService.getProfile });

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState(MOCK_EXTRAS.phone);
  const [specialty, setSpecialty] = useState(MOCK_EXTRAS.specialty);
  const [department, setDepartment] = useState(MOCK_EXTRAS.department);
  const [office, setOffice] = useState(MOCK_EXTRAS.office);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile.data) setFullName(profile.data.fullName);
  }, [profile.data]);

  const dirty = useMemo(() => {
    if (!profile.data) return false;
    return (
      fullName.trim() !== profile.data.fullName ||
      phone.trim() !== MOCK_EXTRAS.phone ||
      specialty.trim() !== MOCK_EXTRAS.specialty ||
      department.trim() !== MOCK_EXTRAS.department ||
      office.trim() !== MOCK_EXTRAS.office
    );
  }, [profile.data, fullName, phone, specialty, department, office]);

  const update = useMutation({
    mutationFn: () => advisorService.updateProfile(fullName.trim()),
    onSuccess: async (result) => {
      if (user) setUser({ ...user, fullName: result.fullName });
      setMessage('Profile updated successfully. Contact details are saved locally until the backend supports them.');
      await qc.invalidateQueries({ queryKey: ['advisor', 'profile'] });
    },
    onError: (error) => setMessage(apiMessage(error)),
  });

  const data = profile.data;
  const style = data ? (STATUS_STYLES[data.status] ?? STATUS_STYLES.ACTIVE) : STATUS_STYLES.ACTIVE;
  const capacityPct = data && data.maxAdvisees > 0 ? Math.min(100, Math.round((data.activeAdvisees / data.maxAdvisees) * 100)) : 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-4">
      {/* ── Hero — đồng bộ Overview ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 py-7 text-white shadow-lg shadow-orange-500/20 sm:px-8 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-white/15 blur-[1px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-48 size-40 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/30" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span
              aria-hidden
              className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-extrabold text-white ring-1 ring-inset ring-white/40 backdrop-blur-[1px]"
            >
              {data ? initialsOf(data.fullName) : <UserRound className="size-7" strokeWidth={2.25} />}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-[26px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                {profile.isLoading ? 'My Profile' : (data?.fullName ?? 'My Profile')}
              </h1>
              <p className="mt-1.5 max-w-xl truncate text-sm font-medium leading-relaxed text-white/95">
                Academic Advisor
                {data ? ` · ${data.email}` : ''}
              </p>
            </div>
          </div>
          <Link
            to="/advisor/students"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-5 text-sm font-extrabold text-[#c2410c] shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all hover:bg-orange-50 active:scale-[0.98]"
          >
            My Students <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      {profile.isLoading ? (
        <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="h-6 w-1/3 animate-pulse rounded bg-slate-100" />
              <div className="mt-4 space-y-3">
                {[0, 1, 2, 3].map((j) => (
                  <div key={j} className="h-11 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : profile.isError || !data ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
          Could not load your profile.{' '}
          <button type="button" onClick={() => profile.refetch()} className="h-11 font-bold underline">
            Retry
          </button>
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* ── Left: identity card ── */}
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 pb-10 pt-6">
              <span
                aria-hidden
                className="flex size-20 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold text-[#c2410c] shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
              >
                {initialsOf(data.fullName)}
              </span>
            </div>
            <div className="px-6 pb-6">
              <div className="-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="flex items-center gap-1.5 text-lg font-extrabold tracking-tight text-slate-900">
                  {data.fullName}
                  <BadgeCheck className="size-4 shrink-0 text-[#F26F21]" aria-label="Verified advisor" />
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-600">Academic Advisor</p>
                <span
                  className={cn(
                    'mt-3 inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold ring-1 ring-inset',
                    style.pill,
                  )}
                >
                  <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden />
                  {style.label}
                </span>
              </div>

              <ul className="mt-5 space-y-3.5 text-sm">
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-[0.06em] text-slate-500">Email</span>
                    <span className="block truncate font-semibold text-slate-900">{data.email}</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-[0.06em] text-slate-500">Phone</span>
                    <span className="block font-semibold tabular-nums text-slate-900">{phone || '—'}</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Briefcase className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-[0.06em] text-slate-500">Specialty</span>
                    <span className="block font-semibold text-slate-900">{specialty || '—'}</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-[0.06em] text-slate-500">Department</span>
                    <span className="block font-semibold leading-snug text-slate-900">{department || '—'}</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-[0.06em] text-slate-500">Office</span>
                    <span className="block font-semibold leading-snug text-slate-900">{office || '—'}</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-[0.06em] text-slate-500">Advising since</span>
                    <span className="block font-semibold text-slate-900">{formatDate(data.assignmentStartDate)}</span>
                  </span>
                </li>
              </ul>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
                <p className="flex items-center justify-between text-sm font-bold text-slate-900">
                  <span className="inline-flex items-center gap-1.5">
                    <UsersRound className="size-4 text-slate-500" aria-hidden />
                    Advising load
                  </span>
                  <span className="tabular-nums">
                    {data.activeAdvisees}/{data.maxAdvisees}
                  </span>
                </p>
                <div
                  className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-200"
                  role="progressbar"
                  aria-valuenow={capacityPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Advising capacity ${capacityPct}%`}
                >
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-[#F26F21] to-[#ff9a4d]"
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-slate-600">{capacityPct}% of capacity</p>
              </div>
            </div>
          </aside>

          {/* ── Right: edit form ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">Profile settings</h2>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
                  Update how students see you. Your name syncs everywhere instantly.
                </p>
              </div>
              {dirty && (
                <span className="inline-flex w-fit items-center rounded-full bg-[#fff3ea] px-3 py-1.5 text-xs font-bold text-[#c2410c] ring-1 ring-inset ring-orange-200">
                  ● Unsaved changes
                </span>
              )}
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-bold text-slate-900">
                Full name
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={255}
                  placeholder="e.g. Trần Minh Khoa"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-500 focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/30"
                />
              </label>
              <div className="block text-sm font-bold text-slate-900">
                Email
                <p className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-600">
                  <Mail className="size-4 shrink-0 text-slate-500" aria-hidden />
                  <span className="truncate">{data.email}</span>
                </p>
                <p className="mt-1.5 text-xs font-medium text-slate-500">Managed by your institution — contact IT to change it.</p>
              </div>
              <label className="block text-sm font-bold text-slate-900">
                Phone
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={32}
                  inputMode="tel"
                  placeholder="+84 ..."
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium tabular-nums text-slate-900 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-500 focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/30"
                />
              </label>
              <label className="block text-sm font-bold text-slate-900">
                Specialty
                <input
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  maxLength={120}
                  placeholder="e.g. Software Engineering"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-500 focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/30"
                />
              </label>
              <label className="block text-sm font-bold text-slate-900">
                Department
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  maxLength={160}
                  placeholder="e.g. School of Information Technology"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-500 focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/30"
                />
              </label>
              <label className="block text-sm font-bold text-slate-900">
                Office location
                <input
                  value={office}
                  onChange={(e) => setOffice(e.target.value)}
                  maxLength={160}
                  placeholder="e.g. Room A-305"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-500 focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/30"
                />
              </label>
            </div>

            {message && (
              <p role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-relaxed text-slate-700">
                <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                {message}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2.5 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={update.isPending || !fullName.trim() || !dirty}
                onClick={() => { setMessage(''); update.mutate(); }}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#F26F21] px-6 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
              >
                <Save className="size-4" aria-hidden />
                {update.isPending ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
