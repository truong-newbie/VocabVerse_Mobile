import { AxiosError } from 'axios';
import { extractApiError } from '@/api/errors';
import type { ApiError } from '@/types';

function makeAxiosError(opts: {
  responseData?: ApiError;
  responseStatus?: number;
  message?: string;
}): AxiosError<ApiError> {
  const err = new AxiosError<ApiError>(opts.message ?? 'Request failed');
  if (opts.responseStatus !== undefined) {
    (err as any).response = {
      status: opts.responseStatus,
      data: opts.responseData,
    };
  } else {
    (err as any).response = { data: undefined };
  }
  (err as any).config = {};
  return err;
}

describe('extractApiError', () => {
  it('returns the server-provided ApiError when axios got a response', () => {
    const serverErr: ApiError = {
      success: false,
      message: 'Invalid credentials',
      errorCode: 'AUTH_001',
    };
    const err = makeAxiosError({ responseData: serverErr, responseStatus: 401 });
    expect(extractApiError(err)).toEqual(serverErr);
  });

  it('returns a NETWORK_ERROR when axios has no response data', () => {
    const err = makeAxiosError({ message: 'Network Error' });
    const result = extractApiError(err);
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('NETWORK_ERROR');
    expect(result.message).toBe('Network Error');
  });

  it('returns an UNKNOWN_ERROR for non-axios values', () => {
    const result = extractApiError(new Error('boom'));
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('UNKNOWN_ERROR');
  });

  it('returns an UNKNOWN_ERROR for null/undefined', () => {
    expect(extractApiError(null).errorCode).toBe('UNKNOWN_ERROR');
    expect(extractApiError(undefined).errorCode).toBe('UNKNOWN_ERROR');
  });
});
