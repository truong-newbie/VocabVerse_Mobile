import { api } from '@/api/client';
import type { ApiResponse, UserResponse } from '@/types';

export const userApi = {
  getMe: () =>
    api.get<ApiResponse<UserResponse>>('/users/me').then(r => r.data.data),
};
