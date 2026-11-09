import { describe, expect, it } from 'vitest';
import { sortChatMessages } from './useAiStudentQueries';
import type { AiChatMessage } from '../../types/ai-student';

const msg = (id: string, sender: AiChatMessage['sender'], createdAt: string) => ({ id, sender, createdAt }) as AiChatMessage;

describe('sortChatMessages', () => {
  it('orders by time', () => {
    const sorted = sortChatMessages([msg('b', 'USER', '2026-11-08T10:00:05'), msg('a', 'ASSISTANT', '2026-11-08T10:00:01')]);
    expect(sorted.map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('puts the student message first when the answer has the same timestamp', () => {
    const sorted = sortChatMessages([msg('answer', 'ASSISTANT', '2026-11-08T10:00:00'), msg('question', 'USER', '2026-11-08T10:00:00')]);
    expect(sorted.map((m) => m.id)).toEqual(['question', 'answer']);
  });

  it('does not change the original array', () => {
    const original = [msg('answer', 'ASSISTANT', '2026-11-08T10:00:00'), msg('question', 'USER', '2026-11-08T10:00:00')];
    sortChatMessages(original);
    expect(original[0].id).toBe('answer');
  });
});
