import { reviewApi } from '@/api/review.api';
import type { ApiResponse, PageResponse, ReviewHistoryEntry } from '@/types';

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

describe('reviewApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getQueue forwards optional params', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({
        due: [],
        newCards: [],
        totalScheduled: 0,
        serverTime: '2025-01-01T00:00:00Z',
      }),
    });
    const r = await reviewApi.getQueue({ collectionId: 'c-1', limit: 10 });
    expect(r.totalScheduled).toBe(0);
    expect(mockedApi.get).toHaveBeenCalledWith('/review/queue', {
      params: { collectionId: 'c-1', limit: 10 },
    });
  });

  it('submitAnswer posts the request body', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: ok({
        vocabularyId: 'v-1',
        nextDueAt: '2025-01-08T00:00:00Z',
        newIntervalDays: 7,
        newEaseFactor: 2.5,
        newRepetitions: 2,
        result: 'GOOD' as const,
      }),
    });
    const r = await reviewApi.submitAnswer({
      vocabularyId: 'v-1',
      quality: 4,
      elapsedMs: 3500,
    });
    expect(r.newIntervalDays).toBe(7);
    expect(mockedApi.post).toHaveBeenCalledWith('/review/answer', {
      vocabularyId: 'v-1',
      quality: 4,
      elapsedMs: 3500,
    });
  });

  it('completeSession posts the session summary', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: ok({
        streakExtended: true,
        newStreak: 5,
        reviewedToday: 12,
      }),
    });
    const r = await reviewApi.completeSession({
      totalReviewed: 10,
      againCount: 1,
      hardCount: 2,
      goodCount: 6,
      easyCount: 1,
      durationSeconds: 180,
    });
    expect(r.newStreak).toBe(5);
    expect(mockedApi.post).toHaveBeenCalledWith('/review/complete', {
      totalReviewed: 10,
      againCount: 1,
      hardCount: 2,
      goodCount: 6,
      easyCount: 1,
      durationSeconds: 180,
    });
  });

  it('getStats returns the stats payload', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({
        currentStreak: 5,
        longestStreak: 12,
        dueToday: 8,
        newCards: 3,
        reviewedThisWeek: 50,
        accuracyThisWeek: 0.84,
        weeklyHistogram: [
          { date: '2025-01-01', count: 0 },
          { date: '2025-01-02', count: 10 },
        ],
      }),
    });
    const s = await reviewApi.getStats();
    expect(s.currentStreak).toBe(5);
    expect(s.weeklyHistogram).toHaveLength(2);
  });

  it('getHistory paginates with default 0/30', async () => {
    const items: ReviewHistoryEntry[] = [
      { date: '2025-01-01', reviewedCount: 5, againCount: 1, accuracy: 0.8 },
    ];
    mockedApi.get.mockResolvedValueOnce({
      data: ok<PageResponse<ReviewHistoryEntry>>({
        items,
        page: 0,
        size: 30,
        totalItems: 1,
        totalPages: 1,
      }),
    });
    const r = await reviewApi.getHistory();
    expect(r.items[0].date).toBe('2025-01-01');
    expect(mockedApi.get).toHaveBeenCalledWith('/review/history', {
      params: { page: 0, size: 30 },
    });
  });

  it('getDueCount returns the lightweight badge payload', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({ due: 4, newCards: 2 }),
    });
    const r = await reviewApi.getDueCount();
    expect(r.due).toBe(4);
  });
});
