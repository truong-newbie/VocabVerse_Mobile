import { create } from 'zustand';
import { authApi } from '@/api/auth.api';
import { extractApiError, storage } from '@/api';
import type { AuthSession, LoginRequest, RegisterRequest, UserInfo } from '@/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
  initialize: () => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,
  accessToken: null,
  refreshToken: null,
  error: null,

  initialize: async () => {
    const session = await storage.loadSession();
    if (session) {
      set({
        status: 'authenticated',
        user: session.user,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      });
    } else {
      set({ status: 'unauthenticated' });
    }
  },

  login: async data => {
    set({ error: null });
    try {
      const response = await authApi.login(data);
      const session: AuthSession = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      };
      await storage.saveSession(session);
      set({
        status: 'authenticated',
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    } catch (e) {
      const err = extractApiError(e);
      set({ error: err.message });
      throw err;
    }
  },

  register: async data => {
    set({ error: null });
    try {
      await authApi.register(data);
      await get().login({ email: data.email, password: data.password });
    } catch (e) {
      const err = extractApiError(e);
      set({ error: err.message });
      throw err;
    }
  },

  logout: async () => {
    const refreshToken = get().refreshToken;
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // ignore network failure on logout
    } finally {
      await storage.clearSession();
      get().reset();
    }
  },

  reset: () => {
    set({
      status: 'unauthenticated',
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
    });
  },
}));