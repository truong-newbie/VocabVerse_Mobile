/**
 * Backend enums + Vietnamese labels for UI rendering.
 * Keep values in sync with:
 *   com.vocabverse.review.enums.ReviewResult
 *   com.vocabverse.learning.enums.LearningStatus
 *   com.vocabverse.learning.quiz.enums.QuizQuestionType
 *   com.vocabverse.roleplay.enums.RoleplayDifficulty
 *   com.vocabverse.collection.enums.CollectionVisibility
 *   com.vocabverse.vocabulary.enums.VocabularySource
 *   com.vocabverse.learning.*.enums.*SessionSource
 */

export const ReviewResult = {
  AGAIN: 'AGAIN',
  HARD: 'HARD',
  GOOD: 'GOOD',
  EASY: 'EASY',
} as const;
export type ReviewResult = (typeof ReviewResult)[keyof typeof ReviewResult];

export const LearningStatus = {
  NEW: 'NEW',
  LEARNING: 'LEARNING',
  REVIEWING: 'REVIEWING',
  MASTERED: 'MASTERED',
} as const;
export type LearningStatus = (typeof LearningStatus)[keyof typeof LearningStatus];

export const QuizQuestionType = {
  TERM_TO_MEANING: 'TERM_TO_MEANING',
  MEANING_TO_TERM: 'MEANING_TO_TERM',
} as const;
export type QuizQuestionType = (typeof QuizQuestionType)[keyof typeof QuizQuestionType];

export const RoleplayDifficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;
export type RoleplayDifficulty = (typeof RoleplayDifficulty)[keyof typeof RoleplayDifficulty];

export const RoleplaySessionStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;
export type RoleplaySessionStatus =
  (typeof RoleplaySessionStatus)[keyof typeof RoleplaySessionStatus];

export const RoleplayMessageSender = {
  USER: 'USER',
  AI: 'AI',
} as const;
export type RoleplayMessageSender =
  (typeof RoleplayMessageSender)[keyof typeof RoleplayMessageSender];

export const CollectionVisibility = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
  SYSTEM: 'SYSTEM',
} as const;
export type CollectionVisibility = (typeof CollectionVisibility)[keyof typeof CollectionVisibility];

/** Subset of CollectionVisibility exposed to users when creating/updating. */
export const Visibility = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
} as const;
export type Visibility = (typeof Visibility)[keyof typeof Visibility];

export const VocabularySource = {
  MANUAL: 'MANUAL',
  DICTIONARY_API: 'DICTIONARY_API',
  AI_NORMALIZED: 'AI_NORMALIZED',
  IMPORT: 'IMPORT',
} as const;
export type VocabularySource = (typeof VocabularySource)[keyof typeof VocabularySource];

export const FlashcardSessionSource = {
  COLLECTION: 'COLLECTION',
  REVIEW: 'REVIEW',
  MIXED: 'MIXED',
} as const;
export type FlashcardSessionSource =
  (typeof FlashcardSessionSource)[keyof typeof FlashcardSessionSource];

export const QuizSessionSource = {
  COLLECTION: 'COLLECTION',
  REVIEW: 'REVIEW',
  MIXED: 'MIXED',
} as const;
export type QuizSessionSource = (typeof QuizSessionSource)[keyof typeof QuizSessionSource];

export const TypingSessionSource = {
  COLLECTION: 'COLLECTION',
  REVIEW: 'REVIEW',
  MIXED: 'MIXED',
} as const;
export type TypingSessionSource = (typeof TypingSessionSource)[keyof typeof TypingSessionSource];

// ─── Vietnamese labels ──────────────────────────────────────────────────────

export const REVIEW_RESULT_LABELS: Record<ReviewResult, string> = {
  AGAIN: 'Lặp lại',
  HARD: 'Khó',
  GOOD: 'Tốt',
  EASY: 'Dễ',
};

export const LEARNING_STATUS_LABELS: Record<LearningStatus, string> = {
  NEW: 'Mới',
  LEARNING: 'Đang học',
  REVIEWING: 'Ôn tập',
  MASTERED: 'Thành thạo',
};

export const QUIZ_QUESTION_TYPE_LABELS: Record<QuizQuestionType, string> = {
  TERM_TO_MEANING: 'Từ → Nghĩa',
  MEANING_TO_TERM: 'Nghĩa → Từ',
};

export const ROLEPLAY_DIFFICULTY_LABELS: Record<RoleplayDifficulty, string> = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

export const COLLECTION_VISIBILITY_LABELS: Record<CollectionVisibility, string> = {
  PRIVATE: 'Riêng tư',
  PUBLIC: 'Công khai',
  SYSTEM: 'Hệ thống',
};

export const VOCABULARY_SOURCE_LABELS: Record<VocabularySource, string> = {
  MANUAL: 'Thủ công',
  DICTIONARY_API: 'Từ điển',
  AI_NORMALIZED: 'AI',
  IMPORT: 'Nhập từ file',
};
