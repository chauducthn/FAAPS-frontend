// CSV export helper for AdvisorReports.

import { toast } from 'sonner';
import { buildCsv, csvFilename, downloadCsv } from '@/shared/lib/csv';
import type { AdvisorReportOverview, SemesterGpaPoint, StatusSlice } from '../../types/reports';

export function exportAdvisorReportsCsv(
  overview: AdvisorReportOverview | undefined,
  slices: StatusSlice[],
  semesters: SemesterGpaPoint[] | undefined,
) {
  if (!overview) {
    toast.error('Chưa có dữ liệu tổng quan để xuất.');
    return;
  }
  const csv = buildCsv([
    {
      title: 'Overview',
      rows: [
        ['Metric', 'Value'],
        ['Assigned students', overview.totalStudents],
        ['Active students', overview.activeStudents],
        ['At-risk students', overview.atRiskStudents],
        ['Probation', overview.probationCount],
        ['Suspended', overview.suspendedCount],
        ['Average GPA', overview.avgGpa.toFixed(2)],
        ['Pending requests', overview.pendingRequests],
        ['Open appointments', overview.openAppointments],
        ['Completed appointments', overview.completedAppointments],
        ['No-show appointments', overview.noShowCount],
      ],
    },
    ...(slices.length > 0
      ? [
          {
            title: 'Status distribution',
            rows: [
              ['Status', 'Students', 'Percent'],
              ...slices.map((s) => [s.label, s.count, `${s.percent}%`]),
            ],
          },
        ]
      : []),
    ...((semesters?.length ?? 0) > 0
      ? [
          {
            title: 'GPA trend',
            rows: [
              ['Semester', 'Code', 'Avg GPA', 'Min GPA', 'Max GPA', 'Students'],
              ...(semesters ?? []).map((s) => [
                s.name,
                s.code,
                s.avgGpa.toFixed(2),
                s.minGpa.toFixed(2),
                s.maxGpa.toFixed(2),
                s.studentCount,
              ]),
            ],
          },
        ]
      : []),
  ]);
  downloadCsv(csv, csvFilename('advisor-reports'));
  toast.success('Đã xuất báo cáo CSV.');
}
