import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth.api';
import { storage } from '@/api/storage';
import type { LoginResponse } from '@/types';

jest.mock('@/api/auth.api', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('@/api/storage', () => ({
  storage: {
    saveSession: jest.fn(() => Promise.resolve()),
    loadSession: jest.fn(() => Promise.resolve(null)),
    clearSession: jest.fn(() => Promise.resolve()),
  },
}));

const mockLoginResponse: LoginResponse = {
  accessToken: 'access-1',
  tokenType: 'Bearer',
  expiresIn: 3600,
  refreshToken: 'refresh-1',
  user: {
    id: 'user-1',
    email: 'test@example.com',
    fullName: 'Tester',
    role: 'USER',
  },
};

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state between tests
    useAuthStore.setState({
      status: 'loading',
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
    });
  });

  it('initialize sets unauthenticated when no session is stored', async () => {
    (storage.loadSession as jest.Mock).mockResolvedValueOnce(null);
    await useAuthStore.getState().initialize();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });

  it('initialize restores session from storage', async () => {
    (storage.loadSession as jest.Mock).mockResolvedValueOnce({
      accessToken: 'a',
      refreshToken: 'r',
      user: mockLoginResponse.user,
    });
    await useAuthStore.getState().initialize();
    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(mockLoginResponse.user);
  });

  it('login persists the session and sets authenticated', async () => {
    (authApi.login as jest.Mock).mockResolvedValueOnce(mockLoginResponse);
    await useAuthStore.getState().login({
      email: 'test@example.com',
      password: 'password',
    });
    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.accessToken).toBe('access-1');
    expect(storage.saveSession).toHaveBeenCalled();
  });

  it('login surfaces server error message', async () => {
    (authApi.login as jest.Mock).mockRejectedValueOnce({
      success: false,
      message: 'Bad creds',
      errorCode: 'AUTH_001',
    });
    await expect(
      useAuthStore.getState().login({ email: 'x@x.com', password: '12345678' })
    ).rejects.toMatchObject({ message: 'Bad creds' });
    expect(useAuthStore.getState().error).toBe('Bad creds');
  });

  it('logout clears storage and resets state', async () => {
    (authApi.logout as jest.Mock).mockResolvedValueOnce({});
    useAuthStore.setState({
      status: 'authenticated',
      user: mockLoginResponse.user,
      accessToken: 'a',
      refreshToken: 'r',
    });
    await useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.user).toBeNull();
    expect(storage.clearSession).toHaveBeenCalled();
  });
});
