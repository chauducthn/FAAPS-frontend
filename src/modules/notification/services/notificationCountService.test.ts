import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/lib/apiClient';
import { advisorService } from '@/modules/advising/services/advisorService';
import { notificationService } from '@/modules/advising/services/assignmentService';
import { studentService } from '@/modules/learning/services/studentService';

vi.mock('@/shared/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), put: vi.fn() },
}));
vi.mock('@/shared/lib/csrf', () => ({ getCsrfHeaders: vi.fn() }));

describe('notification unread-count contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue({ data: { unreadCount: 3 } });
  });

  it.each([
    ['student', studentService.getUnreadNotificationCount, '/student/notifications/unread-count'],
    ['advisor', advisorService.getUnreadNotificationCount, '/advisor/notifications/unread-count'],
    ['admin', notificationService.unreadCount, '/admin/notifications/unread-count'],
  ])('uses the dedicated %s endpoint', async (_role, request, endpoint) => {
    await expect(request()).resolves.toBe(3);
    expect(apiClient.get).toHaveBeenCalledWith(endpoint);
  });
});
