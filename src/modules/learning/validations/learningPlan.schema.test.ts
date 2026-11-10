import { describe, expect, it } from 'vitest';
import { learningTaskSchema } from './learningPlan.schema';

const base = { description: '', dueDate: '', resourceUrl: '' };

describe('learningTaskSchema', () => {
  it('accepts a complete task', () => {
    const parsed = learningTaskSchema.safeParse({
      title: 'Read chapter 3',
      description: 'Pages 41-68, focus on examples',
      dueDate: '2026-11-20',
      resourceUrl: 'https://example.com/notes',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts a title-only task', () => {
    expect(learningTaskSchema.safeParse({ title: 'Revise flashcards', ...base }).success).toBe(true);
  });

  it('rejects a blank or oversized title', () => {
    expect(learningTaskSchema.safeParse({ title: '   ', ...base }).success).toBe(false);
    expect(learningTaskSchema.safeParse({ title: 'a'.repeat(256), ...base }).success).toBe(false);
  });

  it('rejects an invalid link or deadline', () => {
    expect(
      learningTaskSchema.safeParse({ title: 'Task', ...base, resourceUrl: 'not a url' }).success,
    ).toBe(false);
    expect(learningTaskSchema.safeParse({ title: 'Task', ...base, dueDate: '2026-02-30' }).success).toBe(
      false,
    );
  });

  it('accepts a link without a scheme', () => {
    expect(
      learningTaskSchema.safeParse({ title: 'Task', ...base, resourceUrl: 'example.com/notes' }).success,
    ).toBe(true);
  });
});
