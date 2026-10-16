import { shadowingApi } from '@/api/shadowing.api';
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

describe('shadowingApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('listLessons forwards pagination defaults', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({
        items: [],
        page: 0,
        size: 20,
        totalItems: 0,
        totalPages: 0,
      }),
    });
    const r = await shadowingApi.listLessons();
    expect(r.totalItems).toBe(0);
    expect(mockedApi.get).toHaveBeenCalledWith('/shadowing/lessons', {
      params: { page: 0, size: 20 },
    });
  });

  it('getLesson GETs the lesson endpoint', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({
        id: 'l-1',
        title: 'Daily greeting',
        difficulty: 'BEGINNER' as const,
        referenceAudioUrl: 'https://x/y.mp3',
        referenceTranscript: 'Good morning',
        durationSeconds: 12,
        tags: ['greeting'],
        createdAt: '2025-01-01T00:00:00Z',
      }),
    });
    const l = await shadowingApi.getLesson('l-1');
    expect(l.title).toBe('Daily greeting');
    expect(mockedApi.get).toHaveBeenCalledWith('/shadowing/lessons/l-1');
  });

  it('submitAttempt posts audio + duration', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: ok({
        attemptId: 'a-1',
        lessonId: 'l-1',
        score: {
          score: 88,
          pronunciation: 90,
          fluency: 80,
          completeness: 95,
          transcription: 'Good morning',
          feedback: 'Tốt',
        },
        createdAt: '2025-01-01T00:00:00Z',
      }),
    });
    const r = await shadowingApi.submitAttempt({
      lessonId: 'l-1',
      audioUrl: 'recording://1',
      durationMs: 12_000,
    });
    expect(r.score.score).toBe(88);
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/shadowing/lessons/l-1/attempts',
      { audioUrl: 'recording://1', durationMs: 12_000 }
    );
  });

  it('listAttempts GETs the attempt history', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({
        lessonId: 'l-1',
        attempts: [{ id: 'a-1', score: 88, createdAt: '2025-01-01T00:00:00Z' }],
      }),
    });
    const r = await shadowingApi.listAttempts('l-1');
    expect(r.attempts).toHaveLength(1);
  });
});
