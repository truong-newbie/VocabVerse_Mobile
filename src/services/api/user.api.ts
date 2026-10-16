import { api } from '@/services/api';
import type { ApiResponse, UserResponse } from '@/types';

export const userApi = {
  getMe: () => api.get<ApiResponse<UserResponse>>('/users/me').then(r => r.data.data),
};