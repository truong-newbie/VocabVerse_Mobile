import { roleplayApi } from '@/api/roleplay.api';
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

describe('roleplayApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('listScenarios forwards pagination defaults', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({
        items: [],
        page: 0,
        size: 20,
        totalItems: 0,
        totalPages: 0,
      }),
    });
    const r = await roleplayApi.listScenarios();
    expect(r.totalItems).toBe(0);
    expect(mockedApi.get).toHaveBeenCalledWith('/roleplay/scenarios', {
      params: { page: 0, size: 20 },
    });
  });

  it('startSession posts the scenarioId and initial message', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: ok({
        id: 'rp-1',
        scenarioId: 'sc-1',
        status: 'ACTIVE' as const,
        messages: [],
        startedAt: '2025-01-01T00:00:00Z',
        lastActivityAt: '2025-01-01T00:00:00Z',
      }),
    });
    const s = await roleplayApi.startSession({
      scenarioId: 'sc-1',
      initialMessage: 'Hello',
    });
    expect(s.id).toBe('rp-1');
    expect(mockedApi.post).toHaveBeenCalledWith('/roleplay/sessions', {
      scenarioId: 'sc-1',
      initialMessage: 'Hello',
    });
  });

  it('sendMessage returns user and AI messages', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: ok({
        userMessage: {
          id: 'm-1',
          sender: 'USER' as const,
          text: 'Hi',
          createdAt: '2025-01-01T00:00:00Z',
        },
        aiMessage: {
          id: 'm-2',
          sender: 'AI' as const,
          text: 'Hello! How can I help?',
          createdAt: '2025-01-01T00:00:01Z',
        },
      }),
    });
    const r = await roleplayApi.sendMessage({
      sessionId: 'rp-1',
      text: 'Hi',
    });
    expect(r.aiMessage.sender).toBe('AI');
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/roleplay/sessions/rp-1/messages',
      { text: 'Hi' }
    );
  });

  it('endSession POSTs the end endpoint', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: ok({
        sessionId: 'rp-1',
        status: 'ENDED' as const,
        summary: {
          turns: 5,
          durationSeconds: 120,
          proficiency: 0.78,
          feedback: 'Good job',
        },
      }),
    });
    const r = await roleplayApi.endSession({ sessionId: 'rp-1' });
    expect(r.summary.turns).toBe(5);
    expect(mockedApi.post).toHaveBeenCalledWith('/roleplay/sessions/rp-1/end');
  });

  it('getSession GETs the session', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({
        id: 'rp-1',
        scenarioId: 'sc-1',
        status: 'ACTIVE' as const,
        messages: [],
        startedAt: '2025-01-01T00:00:00Z',
        lastActivityAt: '2025-01-01T00:00:00Z',
      }),
    });
    const s = await roleplayApi.getSession('rp-1');
    expect(s.scenarioId).toBe('sc-1');
  });
});
