import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/app/config';
import type { AuthSession } from '@/types/auth';

export const storage = {
  async saveSession(session: AuthSession): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, session.accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken],
      [STORAGE_KEYS.USER, JSON.stringify(session.user)],
    ]);
  },

  async loadSession(): Promise<AuthSession | null> {
    const [[, accessToken], [, refreshToken], [, userJson]] =
      await AsyncStorage.multiGet([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
      ]);
    if (!accessToken || !refreshToken || !userJson) return null;
    return {
      accessToken,
      refreshToken,
      user: JSON.parse(userJson),
    };
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
  },
};
