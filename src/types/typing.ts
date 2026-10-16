import type { TypingSessionSource } from '@/types/enums';

/** A single prompt the user has to type. */
export interface TypingPrompt {
  id: string;
  /** The expected spelling. */
  expected: string;
  /** Audio URL the client plays for the user. */
  audioUrl?: string;
  /** Optional hint shown below the audio button. */
  hint?: string;
  /** Vietnamese meaning, shown after the user has answered. */
  meaning?: string;
}

export interface CreateTypingSessionRequest {
  collectionId?: string;
  source: TypingSessionSource;
  promptCount?: number;
}

export interface TypingSession {
  id: string;
  collectionId?: string;
  source: TypingSessionSource;
  prompts: TypingPrompt[];
  totalPrompts: number;
  createdAt: string;
}

export interface TypingAnswerRequest {
  sessionId: string;
  promptId: string;
  /** The user's answer, lowercased and trimmed by the client. */
  typed: string;
  elapsedMs: number;
}

export interface TypingAnswerResponse {
  promptId: string;
  /** Did the typed string match the expected one? The server applies
   *  the same fuzzy rules as the client (Levenshtein, accent strip). */
  isCorrect: boolean;
  /** 0..1 similarity score (1 = exact match). */
  similarity: number;
  answeredCount: number;
  correctCount: number;
}

export interface TypingCompleteRequest {
  sessionId: string;
  totalAnswered: number;
  correctCount: number;
  durationSeconds: number;
}

export interface TypingCompleteResponse {
  sessionId: string;
  accuracy: number;
  averageSimilarity: number;
  streakExtended: boolean;
  newStreak: number;
}

export interface TypingResultResponse {
  sessionId: string;
  totalAnswered: number;
  correctCount: number;
  accuracy: number;
  averageSimilarity: number;
  durationSeconds: number;
  prompts: TypingPrompt[];
  perPrompt: {
    promptId: string;
    typed: string;
    isCorrect: boolean;
    similarity: number;
  }[];
}
