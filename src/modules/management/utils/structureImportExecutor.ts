import { majorService } from '../services/major.service';
import { cohortService } from '../services/cohort.service';
import { curriculumService } from '../services/curriculum.service';
import type { StructureParseResult } from './structureImport';

export interface StructureImportSummary {
  majorsCreated: number;
  cohortsCreated: number;
  coursesLinked: number;
  skipped: number;
}

const majorKey = (code: string, name: string) => `${code.trim().toUpperCase()}::${name.trim().toLowerCase()}`;
const cohortKey = (majorId: string, version: string) => `${majorId}::${version.trim().toUpperCase()}`;

export async function executeStructureImport(
  parsed: StructureParseResult,
  initialMajors: { id: string; code: string; name: string }[],
): Promise<StructureImportSummary> {
  const majorIdByKey = new Map(initialMajors.map((m) => [majorKey(m.code, m.name), m.id]));
  let majorsCreated = 0;
  let cohortsCreated = 0;
  let coursesLinked = 0;
  let skipped = 0;

  for (const major of parsed.majors) {
    const key = majorKey(major.code, major.name);
    if (majorIdByKey.has(key)) continue;
    try {
      const created = await majorService.createMajor(major);
      majorIdByKey.set(key, created.id);
      majorsCreated++;
    } catch {
      skipped++;
    }
  }

  const cohortIdByKey = new Map<string, string>();
  if (parsed.cohorts.length > 0 || parsed.curriculumLinks.length > 0) {
    try {
      const existingCohorts = await cohortService.list({ page: 0, size: 200 });
      for (const c of existingCohorts.items) {
        cohortIdByKey.set(cohortKey(c.majorId, c.version), c.id);
      }
    } catch {
      // Proceed with creations even if pre-fetch fails.
    }
  }

  for (const cohort of parsed.cohorts) {
    const mId = cohort.majorId ?? majorIdByKey.get(majorKey(cohort.majorCode, cohort.majorName));
    if (!mId) {
      skipped++;
      continue;
    }
    const cKey = cohortKey(mId, cohort.version);
    if (cohortIdByKey.has(cKey)) continue;
    try {
      const created = await cohortService.create({
        majorId: mId,
        version: cohort.version,
        name: cohort.majorName,
        effectiveFromSemesterId: cohort.effectiveFromSemesterId,
        effectiveToSemesterId: cohort.effectiveToSemesterId,
        description: null,
        isCurrent: cohort.isCurrent,
        status: cohort.status,
      });
      cohortIdByKey.set(cKey, created.id);
      cohortsCreated++;
    } catch {
      skipped++;
    }
  }

  const groupedLinks = new Map<string, { cohortId: string; term: number; courseIds: string[] }>();
  for (const link of parsed.curriculumLinks) {
    const mId = majorIdByKey.get(majorKey(link.majorCode, link.majorName));
    const cId = mId ? cohortIdByKey.get(cohortKey(mId, link.version)) : undefined;
    if (!cId) {
      skipped++;
      continue;
    }
    const gKey = `${cId}::${link.term}`;
    const entry = groupedLinks.get(gKey) ?? { cohortId: cId, term: link.term, courseIds: [] };
    entry.courseIds.push(link.courseId);
    groupedLinks.set(gKey, entry);
  }

  for (const group of groupedLinks.values()) {
    try {
      await curriculumService.addCourses(group.cohortId, {
        courseIds: group.courseIds,
        semesterNumber: group.term,
      });
      coursesLinked += group.courseIds.length;
    } catch {
      skipped += group.courseIds.length;
    }
  }

  return { majorsCreated, cohortsCreated, coursesLinked, skipped };
}
