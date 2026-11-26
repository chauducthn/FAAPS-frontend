// Bulk role-change modal with auto-suggested emails, live uniqueness checks, and inline edits.
import { useEffect, useMemo, useState } from 'react';
import { ArrowsLeftRight as ArrowLeftRight, CaretDown as ChevronDown, SpinnerGap as Loader2, X } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useCurriculumsQuery } from '../../academic/hooks/queries/useCurriculumsQuery';
import { adminService } from '../services/adminService';
import { emailMatchesRole, suggestRoleEmail } from '../utils/accountRules';
import type { AdminUserRole, AdminUserSummary } from '../types/admin';
import { BulkSetRoleTable, getRowIssue, type BulkRoleDraft } from './BulkSetRoleTable';
import { useBulkEmailAvailability } from './useRoleEmailCheck';

interface Props {
  targets: AdminUserSummary[] | null;
  onClose: () => void;
  onDone: () => void;
}

function buildDrafts(targets: AdminUserSummary[], role: AdminUserRole): BulkRoleDraft[] {
  return targets.map((u) => ({
    userId: u.id,
    fullName: u.fullName,
    currentRole: u.role,
    currentEmail: u.email,
    email: emailMatchesRole(u.email, role) ? u.email : suggestRoleEmail(u.email, role),
    studentCode: u.role === 'STUDENT' ? u.userId : '',
    curriculumId: '',
  }));
}

export function BulkSetRoleModal({ targets, onClose, onDone }: Props) {
  const open = !!targets && targets.length > 0;
  const curriculums = useCurriculumsQuery('curriculum', { status: 'ACTIVE', page: 0, size: 100 });
  const [targetRole, setTargetRole] = useState<AdminUserRole>('ADVISOR');
  const [drafts, setDrafts] = useState<BulkRoleDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targets || targets.length === 0) return;
    const defaultRole: AdminUserRole = targets.some((t) => t.role === 'STUDENT') ? 'ADVISOR' : 'STUDENT';
    setTargetRole(defaultRole);
    setDrafts(buildDrafts(targets, defaultRole));
    setError(null);
  }, [targets]);

  const { availability, checking } = useBulkEmailAvailability(open, drafts);

  const duplicateEmails = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of drafts) {
      const key = d.email.trim().toLowerCase();
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([k]) => k));
  }, [drafts]);

  const curriculumList = useMemo(() => curriculums.data?.items ?? [], [curriculums.data]);
  const hasIssues = drafts.some((d) => getRowIssue(d, targetRole, availability, duplicateEmails) !== null);

  if (!open || !targets) return null;

  const handleRoleChange = (nextRole: AdminUserRole) => {
    setTargetRole(nextRole);
    setDrafts(buildDrafts(targets, nextRole));
    setError(null);
  };

  const updateRow = (userId: string, patch: Partial<BulkRoleDraft>) => {
    setDrafts((prev) => prev.map((r) => (r.userId === userId ? { ...r, ...patch } : r)));
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const items = drafts.map((d) => {
        const curriculum = curriculumList.find((c) => c.id === d.curriculumId);
        return {
          userId: d.userId,
          email: d.email.trim().toLowerCase(),
          ...(targetRole === 'STUDENT'
            ? {
                studentCode: d.studentCode.trim().toUpperCase(),
                curriculumVersionId: curriculum?.id,
                enrollmentSemesterId: curriculum?.effectiveFromSemesterId ?? undefined,
              }
            : {}),
        };
      });
      const res = await adminService.bulkChangeUserRole(targetRole, items);
      const conflicts = res.results.filter((r) => r.status !== 'UPDATED');
      if (conflicts.length > 0) {
        toast.warning(`Updated ${res.updated} account(s). ${conflicts.length} skipped: ${conflicts[0].reason ?? 'conflict'}`);
      } else {
        toast.success(`Updated role for ${res.updated} account${res.updated === 1 ? '' : 's'}.`);
      }
      onDone();
      onClose();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={() => !submitting && onClose()} title="Bulk set role" className="max-w-3xl">
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21] ring-1 ring-orange-200/70">
            <ArrowLeftRight className="size-4.5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-gray-900">Bulk set role</h2>
            <p className="text-xs text-gray-500">
              Review target emails for {targets.length} selected account{targets.length === 1 ? '' : 's'}.
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
          <X className="size-4" />
        </button>
      </div>

      <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-medium text-gray-700">Target role:</span>
            <div className="relative">
              <select
                value={targetRole}
                onChange={(e) => handleRoleChange(e.target.value as AdminUserRole)}
                aria-label="Bulk target role"
                className="h-9 appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-[13px] font-medium text-gray-800 focus:border-[#F26F21] focus:outline-none"
              >
                <option value="ADVISOR">Advisor (@fe.edu.vn)</option>
                <option value="STUDENT">Student (@fpt.edu.vn)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          {checking && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Loader2 className="size-3.5 animate-spin" /> Checking email uniqueness…
            </span>
          )}
        </div>

        <BulkSetRoleTable
          drafts={drafts}
          targetRole={targetRole}
          availability={availability}
          duplicateEmails={duplicateEmails}
          curriculumList={curriculumList}
          onUpdateRow={updateRow}
        />

        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-6 py-3.5">
        <button type="button" disabled={submitting} onClick={onClose} className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting || checking || hasIssues}
          onClick={() => void submit()}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#F26F21] px-4 text-sm font-semibold text-white hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? 'Updating…' : `Apply to ${targets.length} account${targets.length === 1 ? '' : 's'}`}
        </button>
      </div>
    </Modal>
  );
}
