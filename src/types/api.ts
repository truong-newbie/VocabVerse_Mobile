export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errorCode?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  message: string;
  errorCode: string;
  errors?: Array<{ field: string; message: string }>;
}