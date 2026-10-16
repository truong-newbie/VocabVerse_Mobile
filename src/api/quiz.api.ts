import { api } from '@/api/client';
import type { ApiResponse } from '@/types';
import type {
  CreateQuizSessionRequest,
  QuizAnswerRequest,
  QuizAnswerResponse,
  QuizCompleteRequest,
  QuizCompleteResponse,
  QuizResultResponse,
  QuizSession,
} from '@/types';

export const quizApi = {
  createSession: (req: CreateQuizSessionRequest) =>
    api
      .post<ApiResponse<QuizSession>>('/quiz/sessions', req)
      .then(r => r.data.data),

  submitAnswer: (req: QuizAnswerRequest) =>
    api
      .post<ApiResponse<QuizAnswerResponse>>('/quiz/sessions/answer', req)
      .then(r => r.data.data),

  completeSession: (req: QuizCompleteRequest) =>
    api
      .post<ApiResponse<QuizCompleteResponse>>(
        '/quiz/sessions/complete',
        req
      )
      .then(r => r.data.data),

  /** Fetch a finished session, including the correct option ids. */
  getResult: (sessionId: string) =>
    api
      .get<ApiResponse<QuizResultResponse>>(
        `/quiz/sessions/${sessionId}/result`
      )
      .then(r => r.data.data),
};
