import { userApi } from '@/api/user.api';
import type { ApiResponse } from '@/types';

jest.mock('@/api/client', () => {
  const api = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
  return { api };
});

import { api } from '@/api/client';
const mockedApi = api as jest.Mocked<typeof api>;

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

describe('userApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getMe GETs /users/me', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({
        id: 'u-1',
        email: 'a@b.com',
        fullName: 'A',
        avatarUrl: null,
        role: 'USER' as const,
        status: 'ACTIVE' as const,
      }),
    });
    const me = await userApi.getMe();
    expect(me.email).toBe('a@b.com');
    expect(mockedApi.get).toHaveBeenCalledWith('/users/me');
  });

  it('updateMe PATCHes the body', async () => {
    mockedApi.patch.mockResolvedValueOnce({
      data: ok({
        id: 'u-1',
        email: 'a@b.com',
        fullName: 'New Name',
        avatarUrl: null,
        role: 'USER' as const,
        status: 'ACTIVE' as const,
      }),
    });
    const r = await userApi.updateMe({ fullName: 'New Name' });
    expect(r.fullName).toBe('New Name');
    expect(mockedApi.patch).toHaveBeenCalledWith('/users/me', {
      fullName: 'New Name',
    });
  });

  it('changePassword POSTs current and new password', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: ok({ ok: true as const }) });
    await userApi.changePassword({
      currentPassword: 'old',
      newPassword: 'new-pass-1',
    });
    expect(mockedApi.post).toHaveBeenCalledWith('/users/me/password', {
      currentPassword: 'old',
      newPassword: 'new-pass-1',
    });
  });

  it('getNotificationSettings and updateNotificationSettings', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({
        reviewReminders: true,
        streakReminders: true,
        roleplayReminders: false,
      }),
    });
    const ns = await userApi.getNotificationSettings();
    expect(ns.reviewReminders).toBe(true);

    mockedApi.put.mockResolvedValueOnce({
      data: ok({
        reviewReminders: true,
        streakReminders: false,
        roleplayReminders: true,
      }),
    });
    const updated = await userApi.updateNotificationSettings({
      reviewReminders: true,
      streakReminders: false,
      roleplayReminders: true,
    });
    expect(updated.streakReminders).toBe(false);
    expect(mockedApi.put).toHaveBeenCalledWith(
      '/users/me/notifications',
      expect.objectContaining({ reviewReminders: true })
    );
  });

  it('registerPushToken POSTs the platform', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: ok({ ok: true as const }) });
    await userApi.registerPushToken('ExponentPushToken[abc]', 'android');
    expect(mockedApi.post).toHaveBeenCalledWith('/users/me/push-tokens', {
      token: 'ExponentPushToken[abc]',
      platform: 'android',
    });
  });

  it('unregisterPushToken DELETEs by token', async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: ok({ ok: true as const }) });
    await userApi.unregisterPushToken('a.b.c');
    expect(mockedApi.delete).toHaveBeenCalledWith(
      '/users/me/push-tokens/a.b.c'
    );
  });

  it('getStats GETs /users/me/stats', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({
        userId: 'u-1',
        totalCollections: 3,
        totalVocabulary: 120,
        totalReviews: 410,
        totalQuizzes: 12,
        totalTyping: 4,
        totalRoleplay: 1,
        currentStreak: 5,
        longestStreak: 14,
        joinedAt: '2025-01-01T00:00:00Z',
      }),
    });
    const s = await userApi.getStats();
    expect(s.currentStreak).toBe(5);
  });
});
