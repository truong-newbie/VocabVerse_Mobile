import { api } from '@/api/client';
import type { ApiResponse } from '@/types';
import type {
  ReviewAnswerRequest,
  ReviewAnswerResponse,
  ReviewCompleteRequest,
  ReviewCompleteResponse,
  ReviewHistoryResponse,
  ReviewQueueResponse,
  ReviewStatsResponse,
} from '@/types';

export const reviewApi = {
  /** Build today's review queue. `limit` is the hard cap the server will
   *  return; the server is free to return less (e.g. when new cards are
   *  gated by the collection's daily new-card cap). */
  getQueue: (params?: { collectionId?: string; limit?: number }) =>
    api
      .get<ApiResponse<ReviewQueueResponse>>('/review/queue', { params })
      .then(r => r.data.data),

  /** Submit one answer and receive the updated card state. */
  submitAnswer: (req: ReviewAnswerRequest) =>
    api
      .post<ApiResponse<ReviewAnswerResponse>>('/review/answer', req)
      .then(r => r.data.data),

  /** Mark a session as complete; the server extends the streak and
   *  aggregates daily metrics. */
  completeSession: (req: ReviewCompleteRequest) =>
    api
      .post<ApiResponse<ReviewCompleteResponse>>('/review/complete', req)
      .then(r => r.data.data),

  /** Stats for the current user. */
  getStats: () =>
    api
      .get<ApiResponse<ReviewStatsResponse>>('/review/stats')
      .then(r => r.data.data),

  /** Paginated history, oldest days first. */
  getHistory: (page = 0, size = 30) =>
    api
      .get<ApiResponse<ReviewHistoryResponse>>('/review/history', {
        params: { page, size },
      })
      .then(r => r.data.data),

  /** Lightweight count of cards due today (for the home / tab badge). */
  getDueCount: () =>
    api
      .get<ApiResponse<{ due: number; newCards: number }>>('/review/due-count')
      .then(r => r.data.data),
};
