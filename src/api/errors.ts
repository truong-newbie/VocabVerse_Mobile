import axios from 'axios';
import type { ApiError } from '@/types';

export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ApiError>(error)) {
    return (
      error.response?.data ?? {
        success: false,
        message: error.message,
        errorCode: 'NETWORK_ERROR',
      }
    );
  }
  return {
    success: false,
    message: 'Unknown error',
    errorCode: 'UNKNOWN_ERROR',
  };
}
