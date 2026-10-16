import type { PageResponse } from '@/types/api';
import type { VocabularySource } from '@/types/enums';

export type { VocabularySource };

export interface VocabularyExample {
  en: string;
  vi: string;
}

export interface VocabularyResponse {
  id: string;
  ownerId: string | null;
  word: string;
  normalizedWord: string;
  phonetic: string | null;
  audioUrl: string | null;
  partOfSpeech: string | null;
  meaningVi: string | null;
  meaningEn: string | null;
  synonyms: string[];
  antonyms: string[];
  examples: VocabularyExample[];
  source: VocabularySource;
  createdAt: string;
  updatedAt: string;
}

export type VocabularyPageResponse = PageResponse<VocabularyResponse>;

export interface CreateVocabularyRequest {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  meaningVi?: string;
  meaningEn?: string;
  synonyms?: string[];
  antonyms?: string[];
  examples?: VocabularyExample[];
}

export interface UpdateVocabularyRequest {
  word?: string;
  phonetic?: string;
  partOfSpeech?: string;
  meaningVi?: string;
  meaningEn?: string;
  synonyms?: string[];
  antonyms?: string[];
  examples?: VocabularyExample[];
}
