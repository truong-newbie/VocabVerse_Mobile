import type { PageResponse } from '@/types/api';
import type { CollectionVisibility, Visibility } from '@/types/enums';

export interface CollectionResponse {
  id: string;
  ownerId: string | null;
  title: string;
  description: string | null;
  visibility: CollectionVisibility;
  thumbnailUrl: string | null;
  totalWords: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CollectionPageResponse = PageResponse<CollectionResponse>;

export interface CreateCollectionRequest {
  title: string;
  description?: string;
  visibility?: Visibility;
}

export interface UpdateCollectionRequest {
  title?: string;
  description?: string;
  visibility?: Visibility;
}

export type SchedulerType = 'SM2' | 'FSRS';

export interface CollectionReviewSettingResponse {
  id: string;
  collectionId: string;
  enabled: boolean;
  emailEnabled: boolean;
  schedulerType: SchedulerType;
  intervals: number[];
  reminderTime: string | null;
  timezone: string | null;
  fsrsDesiredRetention: number | null;
  fsrsMaxIntervalDays: number | null;
  lastResetAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCollectionReviewSettingRequest {
  enabled?: boolean;
  emailEnabled?: boolean;
  schedulerType?: SchedulerType;
  intervals?: number[];
  reminderTime?: string;
  timezone?: string;
  fsrsDesiredRetention?: number;
  fsrsMaxIntervalDays?: number;
}
