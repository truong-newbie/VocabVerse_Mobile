/**
 * The settings store is the only piece of cross-screen state
 * outside of auth and UI. These tests pin:
 * - default values on first hydrate
 * - the round-trip through AsyncStorage for each setter
 * - reset() restoring defaults and clearing the persisted blob
 */
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
      setItem: jest.fn((key: string, value: string) => {
        store.set(key, value);
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        store.delete(key);
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store.clear();
        return Promise.resolve();
      }),
      __reset: () => store.clear(),
    },
  };
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsStore } from '@/stores/settingsStore';

const storage = AsyncStorage as unknown as {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
  clear: jest.Mock;
};

describe('useSettingsStore', () => {
  beforeEach(async () => {
    storage.clear.mockClear();
    storage.getItem.mockClear();
    storage.setItem.mockClear();
    storage.removeItem.mockClear();
    await storage.clear();
    useSettingsStore.getState().reset();
  });

  it('starts at defaults and reports hydrated=false on first paint', () => {
    const s = useSettingsStore.getState();
    expect(s.locale).toBe('vi');
    expect(s.themeMode).toBe('system');
    expect(s.dailyReminderAt).toBeNull();
    expect(s.soundOn).toBe(true);
    expect(s.hydrated).toBe(false);
  });

  it('hydrate() reads the persisted blob', async () => {
    await storage.setItem(
      'vv.settings',
      JSON.stringify({
        locale: 'en',
        themeMode: 'dark',
        dailyReminderAt: '20:00',
        soundOn: false,
      })
    );
    await useSettingsStore.getState().hydrate();
    const s = useSettingsStore.getState();
    expect(s.locale).toBe('en');
    expect(s.themeMode).toBe('dark');
    expect(s.dailyReminderAt).toBe('20:00');
    expect(s.soundOn).toBe(false);
    expect(s.hydrated).toBe(true);
  });

  it('setLocale + setThemeMode persist on each call', async () => {
    useSettingsStore.getState().setLocale('en');
    useSettingsStore.getState().setThemeMode('light');
    const raw = await storage.getItem('vv.settings');
    expect(JSON.parse(raw!)).toEqual(
      expect.objectContaining({ locale: 'en', themeMode: 'light' })
    );
  });

  it('setDailyReminderAt(null) clears the value', () => {
    useSettingsStore.getState().setDailyReminderAt('20:00');
    useSettingsStore.getState().setDailyReminderAt(null);
    expect(useSettingsStore.getState().dailyReminderAt).toBeNull();
  });

  it('reset() restores defaults and removes the persisted blob', async () => {
    useSettingsStore.getState().setThemeMode('dark');
    expect(await storage.getItem('vv.settings')).not.toBeNull();
    useSettingsStore.getState().reset();
    const s = useSettingsStore.getState();
    expect(s.themeMode).toBe('system');
    expect(s.hydrated).toBe(true);
    expect(await storage.getItem('vv.settings')).toBeNull();
  });
});
