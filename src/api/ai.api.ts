import { api } from '@/api/client';
import type { ApiResponse, VocabularyExample, VocabularySource } from '@/types';

export interface NormalizeVocabularyRequest {
  rawText: string;
  partOfSpeech?: string;
}

export interface NormalizedVocabulary {
  word: string;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  meaningVi?: string | null;
  meaningEn?: string | null;
  synonyms?: string[];
  antonyms?: string[];
  examples?: VocabularyExample[];
  source: VocabularySource;
}

export interface NormalizeVocabularyResponse {
  result: NormalizedVocabulary;
  tokensUsed?: number;
  remainingQuota?: number;
}

export interface NormalizeBulkVocabularyRequest {
  rawTexts: string[];
  partOfSpeech?: string;
}

export interface NormalizeBulkVocabularyResponse {
  items: NormalizedVocabulary[];
  tokensUsed?: number;
  remainingQuota?: number;
}

export interface AiNormalizeQuotaResponse {
  dailyLimit: number;
  used: number;
  remaining: number;
  resetsAt: string;
}

export const aiApi = {
  normalize: (body: NormalizeVocabularyRequest) =>
    api
      .post<ApiResponse<NormalizeVocabularyResponse>>(
        '/ai/vocabulary/normalize',
        body
      )
      .then(r => r.data.data),

  normalizeBulk: (body: NormalizeBulkVocabularyRequest) =>
    api
      .post<ApiResponse<NormalizeBulkVocabularyResponse>>(
        '/ai/vocabulary/normalize-bulk',
        body
      )
      .then(r => r.data.data),

  getQuota: () =>
    api
      .get<ApiResponse<AiNormalizeQuotaResponse>>('/ai/vocabulary/normalize-quota')
      .then(r => r.data.data),
};
