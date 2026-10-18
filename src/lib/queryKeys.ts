import type { QueryKey } from '@tanstack/react-query';

/**
 * Centralized query key factory. Use this with useApiQuery so cache
 * invalidation stays predictable across the app.
 */
export const queryKeys = {
  me: () => ['me'] as const,

  collections: (params?: object) => ['collections', params] as const,
  collection: (id: string) => ['collection', id] as const,
  reviewSettings: (collectionId: string) =>
    ['review-settings', collectionId] as const,

  vocabularies: (collectionId?: string, params?: object) =>
    ['vocabularies', collectionId, params] as const,
  vocabulary: (id: string) => ['vocabulary', id] as const,

  dictionarySearch: (word: string) => ['dictionary', word] as const,

  aiQuota: () => ['ai', 'quota'] as const,

  dashboard: () => ['dashboard'] as const,
  dashboardLearningStatus: () => ['dashboard', 'learning-status'] as const,
  dashboardReviewDue: (params?: object) =>
    ['dashboard', 'review-due', params] as const,
  dashboardRecentActivity: () => ['dashboard', 'recent-activity'] as const,

  flashcardSession: (id: string) => ['flashcard-session', id] as const,
  quizSession: (id: string) => ['quiz-session', id] as const,
  typingSession: (id: string) => ['typing-session', id] as const,

  reviewToday: (params?: object) => ['review', 'today', params] as const,
  reviewHistory: (params?: object) => ['review', 'history', params] as const,
  reviewStats: () => ['review', 'stats'] as const,
  reviewDueCount: () => ['review', 'due-count'] as const,

  progress: () => ['learning-progress'] as const,
  progressItems: (params?: object) => ['learning-progress', 'items', params] as const,
  progressItem: (vocabularyId: string) =>
    ['learning-progress', vocabularyId] as const,

  shadowingLessons: (params?: object) => ['shadowing', 'lessons', params] as const,
  shadowingLesson: (id: string) => ['shadowing', 'lesson', id] as const,

  roleplaySessions: (params?: object) => ['roleplay', 'sessions', params] as const,
  roleplaySession: (id: string) => ['roleplay', 'session', id] as const,

  publicCollections: (params?: object) =>
    ['public-collections', params] as const,
  publicCollection: (id: string) => ['public-collection', id] as const,
  publicCollectionVocabularies: (id: string, params?: object) =>
    ['public-collection', id, 'vocabularies', params] as const,

  notifications: (params?: object) => ['notifications', params] as const,
  notificationHistory: (params?: object) =>
    ['notifications', 'history', params] as const,

  user: () => ['user', 'me'] as const,
  userStats: () => ['user', 'stats'] as const,
  notificationSettings: () => ['user', 'notification-settings'] as const,
} as const;

export type QueryKeyOf = QueryKey | readonly unknown[];
