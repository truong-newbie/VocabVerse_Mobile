import type { PageResponse } from '@/types/api';
import type { ReviewResult } from '@/types/enums';
import type { VocabularyResponse } from '@/types/vocabulary';

/**
 * A single review card as the server presents it to the client.
 * Combines the vocabulary payload with a snapshot of the user's
 * learning progress (so the UI can show "day 3, ease 2.5, interval 7")
 * without a second request.
 */
export interface ReviewCard {
  vocabulary: VocabularyResponse;
  /** ISO timestamp the card is next due, or null if never reviewed. */
  dueAt: string | null;
  /** Number of successful repetitions so far. */
  repetitions: number;
  /** SM-2 ease factor (1.3 - 2.5+). 2.5 is the default for new cards. */
  easeFactor: number;
  /** Last interval (in days) that was applied. */
  intervalDays: number;
  /** When the card was last reviewed, if ever. */
  lastReviewedAt: string | null;
}

export interface ReviewQueueResponse {
  /** Cards that need to be reviewed today (dueAt <= now). */
  due: ReviewCard[];
  /** Brand-new cards that have never been reviewed. */
  newCards: ReviewCard[];
  /** Total cards that will be scheduled if the user finishes the queue. */
  totalScheduled: number;
  /** Server's "now" — useful when the client's clock drifts. */
  serverTime: string;
}

export interface ReviewAnswerRequest {
  /** Server-issued card id (== vocabulary.id). */
  vocabularyId: string;
  /** 0-5 grade. The client UI exposes the 4-button scale
   *  (Again/Hard/Good/Easy) and maps it to a numeric quality. */
  quality: number;
  /** Time spent looking at the card, in milliseconds. */
  elapsedMs: number;
}

export interface ReviewAnswerResponse {
  vocabularyId: string;
  nextDueAt: string;
  newIntervalDays: number;
  newEaseFactor: number;
  newRepetitions: number;
  /** Convenience: the same enum the user picked, lowercase. */
  result: ReviewResult;
}

export interface ReviewCompleteRequest {
  /** Total cards the user finished, for streak / progress tracking. */
  totalReviewed: number;
  /** Breakdown by outcome. */
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  /** Wall-clock duration of the session, in seconds. */
  durationSeconds: number;
}

export interface ReviewCompleteResponse {
  /** Whether today's streak was extended (true) or already at zero (false). */
  streakExtended: boolean;
  newStreak: number;
  /** Total reviews logged today after this session. */
  reviewedToday: number;
}

export interface ReviewHistoryEntry {
  date: string; // yyyy-MM-dd
  reviewedCount: number;
  againCount: number;
  accuracy: number; // 0..1
}

export type ReviewHistoryResponse = PageResponse<ReviewHistoryEntry>;

export interface ReviewStatsResponse {
  /** Number of consecutive days the user has reviewed at least one card. */
  currentStreak: number;
  longestStreak: number;
  /** Cards due today. */
  dueToday: number;
  newCards: number;
  /** Reviewed in the last 7 days. */
  reviewedThisWeek: number;
  /** Accuracy in the last 7 days, 0..1. */
  accuracyThisWeek: number;
  /** Last 7 daily counts (oldest first). */
  weeklyHistogram: { date: string; count: number }[];
}
