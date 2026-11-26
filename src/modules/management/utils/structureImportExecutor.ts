import { apiClient } from '../../../shared/lib/apiClient';
import type { StructureParseResult } from './structureImport';

export interface StructureImportSummary {
  majorsCreated: number;
  cohortsCreated: number;
  coursesLinked: number;
  groupsSaved: number;
  groupCoursesLinked: number;
  skipped: number;
}

export async function executeStructureImport(
  parsed: StructureParseResult,
  _initialMajors?: { id: string; code: string; name: string }[],
): Promise<StructureImportSummary> {
  let summary: StructureImportSummary = {
    majorsCreated: 0,
    cohortsCreated: 0,
    coursesLinked: 0,
    groupsSaved: 0,
    groupCoursesLinked: 0,
    skipped: 0,
  };

  if (parsed.majors.length > 0 || parsed.cohorts.length > 0 || parsed.curriculumLinks.length > 0) {
    const { data } = await apiClient.post<Omit<StructureImportSummary, 'groupsSaved' | 'groupCoursesLinked'>>(
      '/admin/structure/import',
      {
        majors: parsed.majors.map((m) => ({
          code: m.code,
          name: m.name,
          totalCredits: m.totalCredits,
          durationYears: m.durationYears,
          status: m.status,
        })),
        cohorts: parsed.cohorts,
        curriculumLinks: parsed.curriculumLinks,
      },
    );
    summary = { ...summary, ...data };
  }

  if (parsed.flmGroups && parsed.flmGroups.length > 0) {
    const { data } = await apiClient.post<{ groupsSaved: number; coursesLinked: number }>(
      '/admin/structure/import-groups',
      { groups: parsed.flmGroups },
    );
    summary.groupsSaved = data.groupsSaved ?? 0;
    summary.groupCoursesLinked = data.coursesLinked ?? 0;
  }

  return summary;
}
