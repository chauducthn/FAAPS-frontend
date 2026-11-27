// Bulk role-change modal with auto-suggested emails, live uniqueness checks, and inline edits.
import { useEffect, useMemo, useState } from 'react';
import { ArrowsLeftRight as ArrowLeftRight, CaretDown as ChevronDown, SpinnerGap as Loader2 } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { InlineAlert } from '../../../shared/components/ui/InlineAlert';
import { ModalFooter, ModalHeader, modalButtonClass } from '../../../shared/components/ui/ModalParts';
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
      <ModalHeader
        title="Bulk set role"
        description={`Review target emails for ${targets.length} selected account${targets.length === 1 ? '' : 's'}.`}
        icon={<ArrowLeftRight />}
        onClose={onClose}
        closeDisabled={submitting}
      />

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-medium text-ink-secondary">Target role:</span>
            <div className="relative">
              <select
                value={targetRole}
                onChange={(e) => handleRoleChange(e.target.value as AdminUserRole)}
                aria-label="Bulk target role"
                className={
                  'h-9 appearance-none rounded-md border border-line bg-white pl-3 pr-8 text-[13px] font-medium ' +
                  'text-ink-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15'
                }
              >
                <option value="ADVISOR">Advisor (@fe.edu.vn)</option>
                <option value="STUDENT">Student (@fpt.edu.vn)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
            </div>
          </div>
          {checking && (
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
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
          <InlineAlert tone="error" role="alert">
            {error}
          </InlineAlert>
        )}
      </div>

      <ModalFooter>
        <button type="button" disabled={submitting} onClick={onClose} className={modalButtonClass('secondary')}>
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting || checking || hasIssues}
          onClick={() => void submit()}
          className={modalButtonClass('primary')}
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? 'Updating…' : `Apply to ${targets.length} account${targets.length === 1 ? '' : 's'}`}
        </button>
      </ModalFooter>
    </Modal>
  );
}
