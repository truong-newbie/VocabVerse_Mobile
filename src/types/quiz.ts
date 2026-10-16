import type { QuizQuestionType, QuizSessionSource } from '@/types/enums';
import type { VocabularyResponse } from '@/types/vocabulary';

/**
 * A single quiz choice. We keep the label and the value as separate
 * fields: the label is rendered, the value is sent back to the
 * server when the user picks this option.
 */
export interface QuizOption {
  /** Stable id used to send the answer. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional secondary line (phonetic, part-of-speech tag). */
  hint?: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  /** The prompt the user has to answer. For TERM_TO_MEANING this is
   *  the term; for MEANING_TO_TERM this is the meaning. */
  prompt: string;
  /** Hint to show below the prompt (phonetic / part of speech). */
  promptHint?: string;
  /** 4 options in display order. */
  options: QuizOption[];
  /** Optional: the id of the correct option, included when the
   *  server is in 'reveal' mode (e.g. for a result review). */
  correctOptionId?: string;
}

export interface CreateQuizSessionRequest {
  collectionId?: string;
  source: QuizSessionSource;
  questionCount?: number;
}

export interface QuizSession {
  id: string;
  collectionId?: string;
  source: QuizSessionSource;
  /** Questions the client should walk through. The server may not
   *  return correctOptionId during the live quiz — only when the
   *  user is reviewing a finished session. */
  questions: QuizQuestion[];
  /** Total questions in this session. */
  totalQuestions: number;
  createdAt: string;
}

export interface QuizAnswerRequest {
  sessionId: string;
  questionId: string;
  selectedOptionId: string;
  elapsedMs: number;
}

export interface QuizAnswerResponse {
  questionId: string;
  isCorrect: boolean;
  correctOptionId: string;
  /** Updated running totals for the session. */
  answeredCount: number;
  correctCount: number;
}

export interface QuizCompleteRequest {
  sessionId: string;
  totalAnswered: number;
  correctCount: number;
  durationSeconds: number;
}

export interface QuizCompleteResponse {
  sessionId: string;
  /** 0..1 */
  accuracy: number;
  /** Number of consecutive days with at least one completed session. */
  streakExtended: boolean;
  newStreak: number;
}

export interface QuizResultResponse {
  sessionId: string;
  totalAnswered: number;
  correctCount: number;
  accuracy: number;
  durationSeconds: number;
  /** Per-question detail, in the same order as the session. */
  questions: QuizQuestion[];
}

export type { VocabularyResponse };
