import type { EffectiveCurriculumCourse, RegularBlockMeta } from './curriculumBlockRules';

const PE_SEQ_RE = /^(VOV|COV)(\d+)$/i;

export function formatTermShort(sem: number): string {
  if (sem === 99) return 'Draft';
  return sem < 0 ? `Prep ${-sem}` : sem === 0 ? 'Prep 1' : `Sem ${sem}`;
}

function termChronoRank(sem: number, prepCount: number): number {
  if (sem < 0) return -sem; // Prep 1 (-1) => 1, Prep 2 (-2) => 2
  if (sem === 0) return 1;
  return prepCount + sem; // Sem 1 => prepCount + 1
}

function blockChronoPhase(blockType: string | undefined): number {
  const t = (blockType ?? 'MAIN').toUpperCase();
  if (t === 'INTENSIVE') return 2; // Block 3W runs after 10W / 5W
  return 1; // Block 10W (MAIN) and Block 5W (FAST)
}

export function buildEffectivePrereqMap(
  allCourses: EffectiveCurriculumCourse[],
  dbPrereqMap: Record<string, string[]> | undefined,
): Map<string, Set<string>> {
  const activeCodes = new Set(allCourses.map((c) => c.code.trim().toUpperCase()));
  const map = new Map<string, Set<string>>();

  const addEdge = (courseCode: string, prereqCode: string) => {
    const c = courseCode.toUpperCase();
    const p = prereqCode.toUpperCase();
    if (c === p || !activeCodes.has(c) || !activeCodes.has(p)) return;
    let set = map.get(c);
    if (!set) { set = new Set(); map.set(c, set); }
    set.add(p);
  };

  for (const [code, prereqs] of Object.entries(dbPrereqMap ?? {})) {
    for (const p of prereqs) addEdge(code, p);
  }

  // Implicit sequential PE chain (e.g. VOV114 -> VOV124 -> VOV134, COV111 -> COV121 -> COV131)
  const peByPrefix = new Map<string, { code: string; num: number }[]>();
  for (const c of allCourses) {
    const m = PE_SEQ_RE.exec(c.code.trim());
    if (!m) continue;
    const prefix = m[1].toUpperCase();
    const list = peByPrefix.get(prefix) ?? [];
    list.push({ code: c.code.trim().toUpperCase(), num: Number(m[2]) });
    peByPrefix.set(prefix, list);
  }
  for (const list of peByPrefix.values()) {
    list.sort((a, b) => a.num - b.num);
    for (let i = 1; i < list.length; i++) {
      addEdge(list[i].code, list[i - 1].code);
    }
  }

  return map;
}

export interface PrereqCheckContext {
  allCourses: EffectiveCurriculumCourse[];
  dbPrereqMap: Record<string, string[]> | undefined;
  passedCodes: Set<string>;
  inProgressCodes?: Set<string>;
  draftBlockByCode?: Map<string, string>;
  poolCodes?: Set<string>;
  currentSem?: number;
  prepCount: number;
  regularBlocks: RegularBlockMeta[];
}

export function validatePrerequisiteOrder(
  course: EffectiveCurriculumCourse,
  targetSem: number,
  targetBlock: RegularBlockMeta,
  ctx: PrereqCheckContext,
): string | null {
  const code = course.code.trim().toUpperCase();
  const prereqMap = buildEffectivePrereqMap(ctx.allCourses, ctx.dbPrereqMap);
  const courseByCode = new Map(ctx.allCourses.map((c) => [c.code.trim().toUpperCase(), c]));
  const blockTypeByCode = new Map(ctx.regularBlocks.map((b) => [b.code.toUpperCase(), b.blockType]));
  const defaultMainCode = (ctx.regularBlocks.find((b) => b.blockType === 'MAIN') ?? ctx.regularBlocks[0])?.code ?? 'BLOCK_10W';
  const draftSem = Math.max(1, ctx.currentSem ?? 1);

  const isSatisfied = (cCode: string) => ctx.passedCodes.has(cCode) || (ctx.inProgressCodes?.has(cCode) ?? false);
  const getEffectiveSem = (c: EffectiveCurriculumCourse, cCode: string) =>
    ctx.draftBlockByCode?.has(cCode) ? draftSem : c.semesterNumber;
  const getBlockType = (c: EffectiveCurriculumCourse, cCode: string) => {
    const bCode = ctx.draftBlockByCode?.get(cCode) ?? c.placement?.blockCode ?? defaultMainCode;
    return blockTypeByCode.get(bCode.toUpperCase()) ?? 'MAIN';
  };
  const formatSemLabel = (c: EffectiveCurriculumCourse, cCode: string) =>
    ctx.draftBlockByCode?.has(cCode) ? 'Draft' : formatTermShort(c.semesterNumber);

  const targetRank = termChronoRank(targetSem, ctx.prepCount);
  const targetPhase = blockChronoPhase(targetBlock.blockType);
  const targetIsFast = targetBlock.blockType.toUpperCase() === 'FAST';

  // 1. Forward check: all unpassed prerequisites of `course` must finish before `course` starts
  for (const prereqCode of prereqMap.get(code) ?? []) {
    if (isSatisfied(prereqCode)) continue;
    const p = courseByCode.get(prereqCode);
    if (!p) continue;
    if (ctx.poolCodes?.has(prereqCode)) {
      return `${course.code} requires ${p.code} first (${p.code} is in Course Pool — schedule ${p.code} first).`;
    }
    const pSem = getEffectiveSem(p, prereqCode);
    const pRank = termChronoRank(pSem, ctx.prepCount);
    const pBlockType = getBlockType(p, prereqCode);
    const pPhase = blockChronoPhase(pBlockType);

    if (targetRank < pRank) {
      return `${course.code} requires ${p.code} first (${p.code} is in ${formatSemLabel(p, prereqCode)}).`;
    }
    if (targetRank === pRank) {
      const validSameTerm = targetPhase > pPhase || (targetIsFast && pBlockType.toUpperCase() === 'FAST');
      if (!validSameTerm) {
        return `${course.code} cannot run in parallel with prerequisite ${p.code} in ${targetBlock.shortName} — place it in Block 3W or a later term.`;
      }
    }
  }

  // 2. Reverse check: `course` cannot be moved into or after a scheduled dependent course's parallel/earlier slot
  for (const [depCode, prereqs] of prereqMap.entries()) {
    if (!prereqs.has(code)) continue;
    if (isSatisfied(depCode) || ctx.poolCodes?.has(depCode)) continue;
    const dep = courseByCode.get(depCode);
    if (!dep) continue;
    const dSem = getEffectiveSem(dep, depCode);
    const dRank = termChronoRank(dSem, ctx.prepCount);
    const dBlockType = getBlockType(dep, depCode);
    const dPhase = blockChronoPhase(dBlockType);

    if (targetRank > dRank) {
      return `Cannot move ${course.code} after ${dep.code} (${formatSemLabel(dep, depCode)}) because ${dep.code} requires ${course.code}.`;
    }
    if (targetRank === dRank) {
      const validSameTerm = targetPhase < dPhase || (targetIsFast && dBlockType.toUpperCase() === 'FAST');
      if (!validSameTerm) {
        return `Cannot place ${course.code} in parallel with or after ${dep.code} (${dep.code} requires ${course.code}).`;
      }
    }
  }

  return null;
}
