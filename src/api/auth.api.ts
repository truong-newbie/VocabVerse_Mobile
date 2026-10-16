import { api } from '@/api/client';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@/types';

export const authApi = {
  login: (data: LoginRequest) =>
    api
      .post<ApiResponse<LoginResponse>>('/auth/login', data)
      .then(r => r.data.data),

  register: (data: RegisterRequest) =>
    api
      .post<ApiResponse<LoginResponse>>('/auth/register', data)
      .then(r => r.data.data),

  refresh: (data: RefreshTokenRequest) =>
    api
      .post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', data)
      .then(r => r.data.data),

  logout: (refreshToken: string) =>
    api
      .post<ApiResponse<void>>('/auth/logout', { refreshToken })
      .then(r => r.data),
};
