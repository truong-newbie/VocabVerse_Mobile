import { api } from '@/api/client';
import type {
  ApiResponse,
  CreateVocabularyRequest,
  UpdateVocabularyRequest,
  VocabularyPageResponse,
  VocabularyResponse,
} from '@/types';

export const vocabularyApi = {
  list: (page = 0, size = 10) =>
    api
      .get<ApiResponse<VocabularyPageResponse>>('/vocabularies', {
        params: { page, size },
      })
      .then(r => r.data.data),

  getDetail: (id: string) =>
    api
      .get<ApiResponse<VocabularyResponse>>(`/vocabularies/${id}`)
      .then(r => r.data.data),

  create: (body: CreateVocabularyRequest) =>
    api
      .post<ApiResponse<VocabularyResponse>>('/vocabularies', body)
      .then(r => r.data.data),

  update: (id: string, body: UpdateVocabularyRequest) =>
    api
      .put<ApiResponse<VocabularyResponse>>(`/vocabularies/${id}`, body)
      .then(r => r.data.data),

  remove: (id: string) =>
    api.delete<ApiResponse<void>>(`/vocabularies/${id}`).then(r => r.data),

  getCollectionVocabularies: (collectionId: string, page = 0, size = 10) =>
    api
      .get<ApiResponse<VocabularyPageResponse>>(
        `/collections/${collectionId}/vocabularies`,
        { params: { page, size } }
      )
      .then(r => r.data.data),

  addToCollection: (collectionId: string, vocabularyId: string) =>
    api
      .post<ApiResponse<VocabularyResponse>>(
        `/collections/${collectionId}/vocabularies/${vocabularyId}`
      )
      .then(r => r.data.data),

  removeFromCollection: (collectionId: string, vocabularyId: string) =>
    api
      .delete<ApiResponse<void>>(
        `/collections/${collectionId}/vocabularies/${vocabularyId}`
      )
      .then(r => r.data),
};
