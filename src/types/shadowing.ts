/** Difficulty rating surfaced on the lesson card. */
export type ShadowingDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface ShadowingLesson {
  id: string;
  title: string;
  description?: string;
  difficulty: ShadowingDifficulty;
  /** Reference audio the user is supposed to mimic. */
  referenceAudioUrl: string;
  /** Reference transcript with timing hints. */
  referenceTranscript: string;
  /** Estimated duration, in seconds. */
  durationSeconds: number;
  /** Tags the user can filter by. */
  tags: string[];
  createdAt: string;
}

export interface ShadowingLessonsResponse {
  items: ShadowingLesson[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface ShadowingAttemptRequest {
  lessonId: string;
  /** Recorded user audio (server stores it for review). */
  audioUrl: string;
  durationMs: number;
}

export interface ShadowingAttemptScore {
  /** 0..100 — overall score. */
  score: number;
  /** 0..100 — pronunciation accuracy. */
  pronunciation: number;
  /** 0..100 — fluency. */
  fluency: number;
  /** 0..100 — completeness vs. the reference transcript. */
  completeness: number;
  /** Server's transcription of the user's audio. */
  transcription: string;
  /** Inline feedback from the scoring model. */
  feedback: string;
}

export interface ShadowingAttemptResponse {
  attemptId: string;
  lessonId: string;
  score: ShadowingAttemptScore;
  createdAt: string;
}

export interface ShadowingLessonAttemptsResponse {
  lessonId: string;
  attempts: {
    id: string;
    score: number;
    createdAt: string;
  }[];
}
