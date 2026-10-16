export const colors = {
  // Brand
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#A5B4FC',
  accent: '#10B981',
  accentDark: '#059669',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Surface (light)
  bg: '#FFFFFF',
  bgMuted: '#F9FAFB',
  bgElevated: '#FFFFFF',
  surface: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Border
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',

  // Spaced repetition memory levels
  again: '#EF4444',
  hard: '#F59E0B',
  good: '#10B981',
  easy: '#3B82F6',
} as const;

export type ColorName = keyof typeof colors;