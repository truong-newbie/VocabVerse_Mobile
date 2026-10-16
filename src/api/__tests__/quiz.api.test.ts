import { quizApi } from '@/api/quiz.api';
import type { ApiResponse } from '@/types';

jest.mock('@/api/client', () => {
  const api = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
  return { api };
});

import { api } from '@/api/client';
const mockedApi = api as jest.Mocked<typeof api>;

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

describe('quizApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createSession posts the request body', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: ok({
        id: 'sess-1',
        source: 'COLLECTION' as const,
        questions: [],
        totalQuestions: 10,
        createdAt: '2025-01-01T00:00:00Z',
      }),
    });
    const s = await quizApi.createSession({
      collectionId: 'c-1',
      source: 'COLLECTION',
      questionCount: 10,
    });
    expect(s.id).toBe('sess-1');
    expect(mockedApi.post).toHaveBeenCalledWith('/quiz/sessions', {
      collectionId: 'c-1',
      source: 'COLLECTION',
      questionCount: 10,
    });
  });

  it('submitAnswer posts and returns correctness', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: ok({
        questionId: 'q-1',
        isCorrect: true,
        correctOptionId: 'opt-1',
        answeredCount: 1,
        correctCount: 1,
      }),
    });
    const r = await quizApi.submitAnswer({
      sessionId: 'sess-1',
      questionId: 'q-1',
      selectedOptionId: 'opt-1',
      elapsedMs: 1500,
    });
    expect(r.isCorrect).toBe(true);
  });

  it('completeSession posts totals', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: ok({
        sessionId: 'sess-1',
        accuracy: 0.8,
        streakExtended: true,
        newStreak: 5,
      }),
    });
    const r = await quizApi.completeSession({
      sessionId: 'sess-1',
      totalAnswered: 10,
      correctCount: 8,
      durationSeconds: 60,
    });
    expect(r.accuracy).toBe(0.8);
  });

  it('getResult GETs the result endpoint', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({
        sessionId: 'sess-1',
        totalAnswered: 10,
        correctCount: 8,
        accuracy: 0.8,
        durationSeconds: 60,
        questions: [],
      }),
    });
    const r = await quizApi.getResult('sess-1');
    expect(r.correctCount).toBe(8);
    expect(mockedApi.get).toHaveBeenCalledWith('/quiz/sessions/sess-1/result');
  });
});
