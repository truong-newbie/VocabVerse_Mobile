import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/app/config';
import { storage } from '@/api/storage';
import type { AuthSession } from '@/types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiSet: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() =>
    Promise.resolve([
      [STORAGE_KEYS.ACCESS_TOKEN, null],
      [STORAGE_KEYS.REFRESH_TOKEN, null],
      [STORAGE_KEYS.USER, null],
    ])
  ),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

const mockSession: AuthSession = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  user: {
    id: 'user-1',
    email: 'test@example.com',
    fullName: 'Tester',
    role: 'USER',
  },
};

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves session by writing tokens + user to AsyncStorage', async () => {
    await storage.saveSession(mockSession);
    expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
      [STORAGE_KEYS.ACCESS_TOKEN, mockSession.accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, mockSession.refreshToken],
      [STORAGE_KEYS.USER, JSON.stringify(mockSession.user)],
    ]);
  });

  it('returns null when nothing is stored', async () => {
    (AsyncStorage.multiGet as jest.Mock).mockResolvedValueOnce([
      [STORAGE_KEYS.ACCESS_TOKEN, null],
      [STORAGE_KEYS.REFRESH_TOKEN, null],
      [STORAGE_KEYS.USER, null],
    ]);
    const session = await storage.loadSession();
    expect(session).toBeNull();
  });

  it('returns the loaded session when all keys are present', async () => {
    (AsyncStorage.multiGet as jest.Mock).mockResolvedValueOnce([
      [STORAGE_KEYS.ACCESS_TOKEN, mockSession.accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, mockSession.refreshToken],
      [STORAGE_KEYS.USER, JSON.stringify(mockSession.user)],
    ]);
    const session = await storage.loadSession();
    expect(session).toEqual(mockSession);
  });

  it('clears the session by removing the keys', async () => {
    await storage.clearSession();
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
  });
});
