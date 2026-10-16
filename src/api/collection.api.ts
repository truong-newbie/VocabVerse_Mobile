import { api } from '@/api/client';
import type {
  ApiResponse,
  CollectionPageResponse,
  CollectionResponse,
  CollectionReviewSettingResponse,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  UpdateCollectionReviewSettingRequest,
  VocabularyPageResponse,
  VocabularyResponse,
} from '@/types';

export type {
  CreateCollectionRequest,
  UpdateCollectionRequest,
};

export const collectionApi = {
  list: (page = 0, size = 20) =>
    api
      .get<ApiResponse<CollectionPageResponse>>('/collections', {
        params: { page, size },
      })
      .then(r => r.data.data),

  listMine: (page = 0, size = 20) =>
    api
      .get<ApiResponse<CollectionPageResponse>>('/collections/my', {
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

  // Vocabulary inside this collection
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

  // Review settings
  getReviewSettings: (collectionId: string) =>
    api
      .get<ApiResponse<CollectionReviewSettingResponse>>(
        `/collections/${collectionId}/review-settings`
      )
      .then(r => r.data.data),

  updateReviewSettings: (
    collectionId: string,
    data: UpdateCollectionReviewSettingRequest
  ) =>
    api
      .put<ApiResponse<CollectionReviewSettingResponse>>(
        `/collections/${collectionId}/review-settings`,
        data
      )
      .then(r => r.data.data),

  patchReviewSettings: (
    collectionId: string,
    data: UpdateCollectionReviewSettingRequest
  ) =>
    api
      .patch<ApiResponse<CollectionReviewSettingResponse>>(
        `/collections/${collectionId}/review-settings`,
        data
      )
      .then(r => r.data.data),

  disableReviewSettings: (collectionId: string) =>
    api
      .post<ApiResponse<CollectionReviewSettingResponse>>(
        `/collections/${collectionId}/review-settings/disable`
      )
      .then(r => r.data.data),

  resetReviewSettings: (collectionId: string) =>
    api
      .post<ApiResponse<CollectionReviewSettingResponse>>(
        `/collections/${collectionId}/review-settings/reset`
      )
      .then(r => r.data.data),
};
