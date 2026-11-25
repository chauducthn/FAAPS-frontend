import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { emailMatchesRole, STUDENT_ID_PATTERN } from '../utils/accountRules';
import { TableBody, TableCell, TableHead, TableRow, TableShell } from '../../../shared/components/common/table/TablePrimitives';
import type { AdminUserRole } from '../types/admin';

export interface BulkRoleDraft {
  userId: string;
  fullName: string;
  currentRole: AdminUserRole;
  currentEmail: string;
  email: string;
  studentCode: string;
  curriculumId: string;
}

export function getRowIssue(
  row: BulkRoleDraft,
  targetRole: AdminUserRole,
  availability: Record<string, boolean>,
  duplicateEmails: Set<string>,
): string | null {
  const normalized = row.email.trim().toLowerCase();
  if (!normalized || !emailMatchesRole(normalized, targetRole)) {
    return targetRole === 'STUDENT' ? 'Must end with @fpt.edu.vn' : 'Must end with @fe.edu.vn';
  }
  if (duplicateEmails.has(normalized)) return 'Duplicate in this batch';
  if (normalized !== row.currentEmail.trim().toLowerCase() && availability[normalized] === false) {
    return 'Email already exists';
  }
  if (targetRole === 'STUDENT') {
    if (!STUDENT_ID_PATTERN.test(row.studentCode.trim().toUpperCase())) return 'Invalid Student ID';
    if (!row.curriculumId) return 'Select curriculum';
  }
  return null;
}

export function BulkSetRoleTable({
  drafts,
  targetRole,
  availability,
  duplicateEmails,
  curriculumList,
  onUpdateRow,
}: {
  drafts: BulkRoleDraft[];
  targetRole: AdminUserRole;
  availability: Record<string, boolean>;
  duplicateEmails: Set<string>;
  curriculumList: { id: string; majorCode: string; version: string; name: string }[];
  onUpdateRow: (userId: string, patch: Partial<BulkRoleDraft>) => void;
}) {
  const isStudent = targetRole === 'STUDENT';

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <TableShell>
        <thead>
          <tr>
            <TableHead>Account</TableHead>
            <TableHead>Target Email</TableHead>
            {isStudent && <TableHead>Student ID</TableHead>}
            {isStudent && <TableHead>Curriculum</TableHead>}
            <TableHead>Validation</TableHead>
          </tr>
        </thead>
        <TableBody>
          {drafts.map((row) => {
            const issue = getRowIssue(row, targetRole, availability, duplicateEmails);
            return (
              <TableRow key={row.userId}>
                <TableCell>
                  <p className="font-semibold text-[var(--ink-primary)]">{row.fullName}</p>
                  <p className="text-[11px] text-[var(--ink-subtle)]">{row.currentRole}</p>
                </TableCell>
                <TableCell>
                  <input
                    type="email"
                    value={row.email}
                    onChange={(e) => onUpdateRow(row.userId, { email: e.target.value })}
                    aria-label={`Email for ${row.fullName}`}
                    className="h-8 w-52 rounded-lg border border-gray-200 px-2.5 text-xs text-gray-900 focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]/30"
                  />
                </TableCell>
                {isStudent && (
                  <TableCell>
                    <input
                      value={row.studentCode}
                      maxLength={8}
                      placeholder="SE173012"
                      onChange={(e) => onUpdateRow(row.userId, { studentCode: e.target.value.toUpperCase() })}
                      aria-label={`Student ID for ${row.fullName}`}
                      className="h-8 w-28 rounded-lg border border-gray-200 px-2.5 font-mono text-xs uppercase text-gray-900 focus:border-[var(--brand)] focus:outline-none"
                    />
                  </TableCell>
                )}
                {isStudent && (
                  <TableCell>
                    <select
                      value={row.curriculumId}
                      onChange={(e) => onUpdateRow(row.userId, { curriculumId: e.target.value })}
                      aria-label={`Curriculum for ${row.fullName}`}
                      className="h-8 w-44 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-800 focus:border-[var(--brand)] focus:outline-none"
                    >
                      <option value="">Select…</option>
                      {curriculumList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.majorCode} {c.version}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                )}
                <TableCell>
                  {issue ? (
                    <span className="inline-flex items-center gap-1 font-medium text-red-600">
                      <AlertTriangle className="size-3.5 shrink-0" /> {issue}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                      <CheckCircle2 className="size-3.5 shrink-0" /> Ready
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </TableShell>
    </div>
  );
}
