import { describe, expect, it } from 'vitest';
import { matchCurriculums } from './curriculumMatch';

const choices = [
  { id: 'se19', version: 'K19', name: 'SE K19', majorCode: 'SE', majorName: 'Software Engineering' },
  { id: 'se18', version: 'K18', name: 'SE K18', majorCode: 'SE', majorName: 'Software Engineering' },
  { id: 'ai19', version: 'K19', name: 'AI K19', majorCode: 'AI', majorName: 'Artificial Intelligence' },
];

describe('matchCurriculums', () => {
  it('offers the curriculums of the major in the Student ID and prefers the same cohort', () => {
    const result = matchCurriculums('se190001', choices);
    expect(result.matched).toBe(true);
    expect(result.options.map((item) => item.id)).toEqual(['se19', 'se18']);
    expect(result.preferredId).toBe('se19');
  });

  it('does not prefer anything when the cohort has no curriculum', () => {
    const result = matchCurriculums('SE220001', choices);
    expect(result.options).toHaveLength(2);
    expect(result.preferredId).toBeNull();
  });

  it('falls back to every curriculum when the prefix matches no major', () => {
    const result = matchCurriculums('SS190001', choices);
    expect(result).toEqual({ options: choices, matched: false, preferredId: null });
  });

  it('falls back to every curriculum while the Student ID is still empty', () => {
    expect(matchCurriculums('', choices).matched).toBe(false);
  });
});
