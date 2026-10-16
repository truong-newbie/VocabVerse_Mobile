import { typingApi } from '@/api/typing.api';
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

describe('typingApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createSession posts the request body', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: ok({
        id: 'sess-1',
        source: 'REVIEW' as const,
        prompts: [],
        totalPrompts: 5,
        createdAt: '2025-01-01T00:00:00Z',
      }),
    });
    const s = await typingApi.createSession({
      collectionId: 'c-1',
      source: 'REVIEW',
      promptCount: 5,
    });
    expect(s.id).toBe('sess-1');
  });

  it('submitAnswer returns isCorrect and similarity', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: ok({
        promptId: 'p-1',
        isCorrect: false,
        similarity: 0.85,
        answeredCount: 1,
        correctCount: 0,
      }),
    });
    const r = await typingApi.submitAnswer({
      sessionId: 'sess-1',
      promptId: 'p-1',
      typed: 'helo',
      elapsedMs: 2000,
    });
    expect(r.isCorrect).toBe(false);
    expect(r.similarity).toBeCloseTo(0.85, 5);
  });

  it('completeSession posts the totals', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: ok({
        sessionId: 'sess-1',
        accuracy: 0.6,
        averageSimilarity: 0.92,
        streakExtended: false,
        newStreak: 3,
      }),
    });
    const r = await typingApi.completeSession({
      sessionId: 'sess-1',
      totalAnswered: 5,
      correctCount: 3,
      durationSeconds: 90,
    });
    expect(r.averageSimilarity).toBeCloseTo(0.92, 5);
  });

  it('getResult GETs the result endpoint', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({
        sessionId: 'sess-1',
        totalAnswered: 5,
        correctCount: 3,
        accuracy: 0.6,
        averageSimilarity: 0.92,
        durationSeconds: 90,
        prompts: [],
        perPrompt: [],
      }),
    });
    const r = await typingApi.getResult('sess-1');
    expect(r.perPrompt).toEqual([]);
  });
});
