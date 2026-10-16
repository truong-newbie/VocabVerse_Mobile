import { api } from '@/api/client';
import type { ApiResponse } from '@/types';
import type {
  CreateTypingSessionRequest,
  TypingAnswerRequest,
  TypingAnswerResponse,
  TypingCompleteRequest,
  TypingCompleteResponse,
  TypingResultResponse,
  TypingSession,
} from '@/types';

export const typingApi = {
  createSession: (req: CreateTypingSessionRequest) =>
    api
      .post<ApiResponse<TypingSession>>('/typing/sessions', req)
      .then(r => r.data.data),

  submitAnswer: (req: TypingAnswerRequest) =>
    api
      .post<ApiResponse<TypingAnswerResponse>>('/typing/sessions/answer', req)
      .then(r => r.data.data),

  completeSession: (req: TypingCompleteRequest) =>
    api
      .post<ApiResponse<TypingCompleteResponse>>(
        '/typing/sessions/complete',
        req
      )
      .then(r => r.data.data),

  getResult: (sessionId: string) =>
    api
      .get<ApiResponse<TypingResultResponse>>(
        `/typing/sessions/${sessionId}/result`
      )
      .then(r => r.data.data),
};
