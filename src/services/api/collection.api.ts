import { api } from '@/api/client';
import type {
  ApiResponse,
  CollectionPageResponse,
  CollectionResponse,
  VocabularyPageResponse,
  VocabularyResponse,
} from '@/types';

export interface CreateCollectionRequest {
  title: string;
  description?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface UpdateCollectionRequest {
  title?: string;
  description?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

export const collectionApi = {
  list: (page = 0, size = 20) =>
    api
      .get<ApiResponse<CollectionPageResponse>>('/collections', {
        params: { page, size },
      })
      .then(r => r.data.data),

  getDetail: (id: string) =>
    api
      .get<ApiResponse<CollectionResponse>>(`/collections/${id}`)
      .then(r => r.data.data),

  create: (data: CreateCollectionRequest) =>
    api
      .post<ApiResponse<CollectionResponse>>('/collections', data)
      .then(r => r.data.data),

  update: (id: string, data: UpdateCollectionRequest) =>
    api
      .put<ApiResponse<CollectionResponse>>(`/collections/${id}`, data)
      .then(r => r.data.data),

  remove: (id: string) =>
    api.delete<ApiResponse<void>>(`/collections/${id}`).then(r => r.data),

  listVocabularies: (collectionId: string, page = 0, size = 20) =>
    api
      .get<ApiResponse<VocabularyPageResponse>>(
        `/collections/${collectionId}/vocabularies`,
        { params: { page, size } }
      )
      .then(r => r.data.data),

  addVocabulary: (collectionId: string, vocabularyId: string) =>
    api
      .post<ApiResponse<VocabularyResponse>>(
        `/collections/${collectionId}/vocabularies/${vocabularyId}`
      )
      .then(r => r.data.data),

  removeVocabulary: (collectionId: string, vocabularyId: string) =>
    api
      .delete<ApiResponse<void>>(
        `/collections/${collectionId}/vocabularies/${vocabularyId}`
      )
      .then(r => r.data),
};