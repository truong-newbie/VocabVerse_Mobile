import { vocabularyApi } from '@/api/vocabulary.api';
import { aiApi } from '@/api/ai.api';
import { dictionaryApi } from '@/api/dictionary.api';
import { collectionApi } from '@/api/collection.api';
import type { ApiResponse, VocabularyResponse } from '@/types';
import type { DictionaryWordResponse } from '@/api/dictionary.api';
import type { NormalizeVocabularyResponse } from '@/api/ai.api';

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

const sampleVocab: VocabularyResponse = {
  id: 'v-1',
  word: 'hello',
  normalizedWord: 'hello',
  phonetic: '/həˈloʊ/',
  audioUrl: null,
  partOfSpeech: 'noun',
  meaningVi: 'xin chào',
  meaningEn: 'a greeting',
  synonyms: ['hi'],
  antonyms: ['bye'],
  examples: [{ en: 'Hello!', vi: 'Xin chào!' }],
  source: 'DICTIONARY_API',
};

describe('vocabularyApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('list unwraps data and forwards page/size', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({ items: [sampleVocab], page: 0, size: 10, totalItems: 1, totalPages: 1 }),
    });
    const result = await vocabularyApi.list(0, 10);
    expect(result.items).toHaveLength(1);
    expect(mockedApi.get).toHaveBeenCalledWith('/vocabularies', {
      params: { page: 0, size: 10 },
    });
  });

  it('create posts body and returns the new vocabulary', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: ok(sampleVocab) });
    const created = await vocabularyApi.create({ word: 'hello' });
    expect(created.id).toBe('v-1');
    expect(mockedApi.post).toHaveBeenCalledWith('/vocabularies', { word: 'hello' });
  });

  it('removeFromCollection targets the nested path', async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: ok(undefined) });
    await vocabularyApi.removeFromCollection('c-1', 'v-1');
    expect(mockedApi.delete).toHaveBeenCalledWith(
      '/collections/c-1/vocabularies/v-1'
    );
  });
});

describe('dictionaryApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('search passes the word as a query param', async () => {
    const sample: DictionaryWordResponse = {
      word: 'apple',
      phonetic: '/ˈæp.əl/',
      meaningVi: 'quả táo',
      synonyms: [],
      antonyms: [],
      examples: [],
    };
    mockedApi.get.mockResolvedValueOnce({ data: ok(sample) });
    const result = await dictionaryApi.search('apple');
    expect(result.word).toBe('apple');
    expect(mockedApi.get).toHaveBeenCalledWith('/dictionary/search', {
      params: { word: 'apple' },
    });
  });
});

describe('aiApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('normalize posts the body and returns the result + quota', async () => {
    const response: NormalizeVocabularyResponse = {
      result: {
        word: 'run',
        phonetic: '/rʌn/',
        partOfSpeech: 'verb',
        meaningVi: 'chạy',
        meaningEn: 'to move quickly',
        synonyms: ['sprint'],
        antonyms: [],
        examples: [],
        source: 'AI_NORMALIZED',
      },
      tokensUsed: 5,
      remainingQuota: 95,
    };
    mockedApi.post.mockResolvedValueOnce({ data: ok(response) });
    const r = await aiApi.normalize({ rawText: 'run' });
    expect(r.result.word).toBe('run');
    expect(r.tokensUsed).toBe(5);
    expect(mockedApi.post).toHaveBeenCalledWith('/ai/vocabulary/normalize', {
      rawText: 'run',
    });
  });

  it('getQuota reads /ai/vocabulary/normalize-quota', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: ok({
        dailyLimit: 100,
        used: 3,
        remaining: 97,
        resetsAt: '2025-01-10T00:00:00Z',
      }),
    });
    const q = await aiApi.getQuota();
    expect(q.remaining).toBe(97);
  });
});

describe('collectionApi — review settings', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updateReviewSettings uses PUT', async () => {
    const setting = {
      enabled: true,
      emailEnabled: false,
      schedulerType: 'FSRS' as const,
      intervals: [1, 3, 7],
      reminderTime: '09:00',
      timezone: 'Asia/Ho_Chi_Minh',
      fsrsDesiredRetention: 0.9,
      fsrsMaxIntervalDays: 90,
    };
    mockedApi.put.mockResolvedValueOnce({ data: ok(setting) });
    const r = await collectionApi.updateReviewSettings('c-1', setting);
    expect(r.schedulerType).toBe('FSRS');
    expect(mockedApi.put).toHaveBeenCalledWith(
      '/collections/c-1/review-settings',
      setting
    );
  });

  it('disableReviewSettings posts to the dedicated endpoint', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: ok({
        enabled: false,
        emailEnabled: false,
        schedulerType: 'SM2' as const,
        intervals: [],
      }),
    });
    await collectionApi.disableReviewSettings('c-1');
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/collections/c-1/review-settings/disable'
    );
  });
});
