import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { STORAGE_KEYS } from '@/app/config';
import type { UserLocale } from '@/types';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface SettingsState {
  locale: UserLocale;
  themeMode: ThemeMode;
  /** When set, the user wants a daily reminder at this time. */
  dailyReminderAt: string | null;
  /** Plays a sound on every graded answer. */
  soundOn: boolean;
  hydrated: boolean;
  setLocale: (locale: UserLocale) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDailyReminderAt: (time: string | null) => void;
  setSoundOn: (on: boolean) => void;
  hydrate: () => Promise<void>;
  reset: () => void;
}

interface PersistedSettings {
  locale: UserLocale;
  themeMode: ThemeMode;
  dailyReminderAt: string | null;
  soundOn: boolean;
}

const DEFAULTS: PersistedSettings = {
  locale: 'vi',
  themeMode: 'system',
  dailyReminderAt: null,
  soundOn: true,
};

async function load(): Promise<PersistedSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

async function save(s: PersistedSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(s));
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,

  setLocale: locale => {
    set({ locale });
    void save({ ...extract(get()), locale });
  },

  setThemeMode: themeMode => {
    set({ themeMode });
    void save({ ...extract(get()), themeMode });
  },

  setDailyReminderAt: time => {
    set({ dailyReminderAt: time });
    void save({ ...extract(get()), dailyReminderAt: time });
  },

  setSoundOn: soundOn => {
    set({ soundOn });
    void save({ ...extract(get()), soundOn });
  },

  hydrate: async () => {
    const s = await load();
    set({ ...s, hydrated: true });
  },

  reset: () => {
    set({ ...DEFAULTS, hydrated: true });
    void AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
  },
}));

function extract(s: SettingsState): PersistedSettings {
  return {
    locale: s.locale,
    themeMode: s.themeMode,
    dailyReminderAt: s.dailyReminderAt,
    soundOn: s.soundOn,
  };
}
