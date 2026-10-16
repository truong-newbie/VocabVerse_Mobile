import { api } from '@/api/client';
import type { ApiResponse } from '@/types';

export interface DictionaryWordResponse {
  word: string;
  normalizedWord?: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  partOfSpeech?: string | null;
  meaningVi?: string | null;
  meaningEn?: string | null;
  synonyms?: string[];
  antonyms?: string[];
  examples?: { en: string; vi: string }[];
}

export const dictionaryApi = {
  search: (word: string) =>
    api
      .get<ApiResponse<DictionaryWordResponse>>('/dictionary/search', {
        params: { word },
      })
      .then(r => r.data.data),
};
