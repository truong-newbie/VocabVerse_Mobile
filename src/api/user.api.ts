import { api } from '@/api/client';
import type { ApiResponse } from '@/types';
import type {
  ChangePasswordRequest,
  NotificationSettings,
  UpdateProfileRequest,
  UserResponse,
  UserStatsResponse,
} from '@/types';

export const userApi = {
  getMe: () =>
    api.get<ApiResponse<UserResponse>>('/users/me').then(r => r.data.data),

  updateMe: (req: UpdateProfileRequest) =>
    api
      .patch<ApiResponse<UserResponse>>('/users/me', req)
      .then(r => r.data.data),

  changePassword: (req: ChangePasswordRequest) =>
    api
      .post<ApiResponse<{ ok: true }>>('/users/me/password', req)
      .then(r => r.data.data),

  getNotificationSettings: () =>
    api
      .get<ApiResponse<NotificationSettings>>('/users/me/notifications')
      .then(r => r.data.data),

  updateNotificationSettings: (req: NotificationSettings) =>
    api
      .put<ApiResponse<NotificationSettings>>('/users/me/notifications', req)
      .then(r => r.data.data),

  registerPushToken: (token: string, platform: 'ios' | 'android' | 'web') =>
    api
      .post<ApiResponse<{ ok: true }>>('/users/me/push-tokens', {
        token,
        platform,
      })
      .then(r => r.data.data),

  unregisterPushToken: (token: string) =>
    api
      .delete<ApiResponse<{ ok: true }>>(
        `/users/me/push-tokens/${encodeURIComponent(token)}`
      )
      .then(r => r.data.data),

  getStats: () =>
    api
      .get<ApiResponse<UserStatsResponse>>('/users/me/stats')
      .then(r => r.data.data),
};
