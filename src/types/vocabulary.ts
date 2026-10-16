import { PageResponse } from '@/types/api';

export type VocabularySource = 'DICTIONARY' | 'MANUAL' | 'AI_NORMALIZED';

export interface VocabularyExample {
  en: string;
  vi: string;
}

export interface VocabularyResponse {
  id: string;
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
}

export interface CollectionResponse {
  id: string;
  ownerId: string | null;
  title: string;
  description: string | null;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SYSTEM';
  thumbnailUrl: string | null;
  totalWords: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CollectionPageResponse = PageResponse<CollectionResponse>;
export type VocabularyPageResponse = PageResponse<VocabularyResponse>;