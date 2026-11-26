import { apiClient } from '../../../shared/lib/apiClient';
import type { StructureParseResult } from './structureImport';

export interface StructureImportSummary {
  majorsCreated: number;
  cohortsCreated: number;
  coursesLinked: number;
  skipped: number;
}

export async function executeStructureImport(
  parsed: StructureParseResult,
  _initialMajors?: { id: string; code: string; name: string }[],
): Promise<StructureImportSummary> {
  const { data } = await apiClient.post<StructureImportSummary>('/admin/structure/import', {
    majors: parsed.majors.map((m) => ({
      code: m.code,
      name: m.name,
      totalCredits: m.totalCredits,
      durationYears: m.durationYears,
      status: m.status,
    })),
    cohorts: parsed.cohorts,
    curriculumLinks: parsed.curriculumLinks,
  });
  return data;
}
