import { api } from '@/api/client';
import type { ApiResponse, PageResponse } from '@/types';
import type {
  ShadowingAttemptRequest,
  ShadowingAttemptResponse,
  ShadowingLesson,
  ShadowingLessonAttemptsResponse,
  ShadowingLessonsResponse,
} from '@/types';

export const shadowingApi = {
  listLessons: (params?: { page?: number; size?: number; tag?: string; difficulty?: string }) =>
    api
      .get<ApiResponse<ShadowingLessonsResponse>>('/shadowing/lessons', {
        params: { page: 0, size: 20, ...(params ?? {}) },
      })
      .then(r => r.data.data),

  getLesson: (id: string) =>
    api
      .get<ApiResponse<ShadowingLesson>>(`/shadowing/lessons/${id}`)
      .then(r => r.data.data),

  submitAttempt: (req: ShadowingAttemptRequest) =>
    api
      .post<ApiResponse<ShadowingAttemptResponse>>(
        `/shadowing/lessons/${req.lessonId}/attempts`,
        { audioUrl: req.audioUrl, durationMs: req.durationMs }
      )
      .then(r => r.data.data),

  listAttempts: (lessonId: string) =>
    api
      .get<ApiResponse<ShadowingLessonAttemptsResponse>>(
        `/shadowing/lessons/${lessonId}/attempts`
      )
      .then(r => r.data.data),
};

export type { PageResponse };
