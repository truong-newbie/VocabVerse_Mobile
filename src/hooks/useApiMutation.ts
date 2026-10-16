import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { extractApiError } from '@/api';
import { useToast } from '@/hooks/useToast';
import type { ApiError } from '@/types';

type InvalidateArg = QueryKey | QueryKey[] | ((data: unknown) => QueryKey | QueryKey[]);

interface UseApiMutationOptions<TData, TVariables> {
  mutationFn: (vars: TVariables) => Promise<TData>;
  invalidate?: InvalidateArg;
  toastSuccess?: string | ((data: TData) => string);
  toastError?: boolean | string;
  onSuccess?: (data: TData, vars: TVariables) => void;
  onError?: (error: ApiError, vars: TVariables) => void;
}

function resolveInvalidations(
  arg: InvalidateArg,
  data: unknown,
  qc: ReturnType<typeof useQueryClient>,
) {
  const resolved = typeof arg === 'function' ? arg(data) : arg;
  const keys = Array.isArray(resolved) && Array.isArray(resolved[0]) ? (resolved as QueryKey[]) : [resolved as QueryKey];
  keys.forEach(k => qc.invalidateQueries({ queryKey: k }));
}

export function useApiMutation<TData = unknown, TVariables = void>({
  mutationFn,
  invalidate,
  toastSuccess,
  toastError = true,
  onSuccess,
  onError,
}: UseApiMutationOptions<TData, TVariables>) {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    onSuccess(data, vars) {
      if (invalidate) {
        resolveInvalidations(invalidate, data, qc);
      }
      if (toastSuccess) {
        const msg = typeof toastSuccess === 'function' ? toastSuccess(data) : toastSuccess;
        toast.show(msg, 'success');
      }
      onSuccess?.(data, vars);
    },
    onError(err, vars) {
      if (toastError) {
        const msg = typeof toastError === 'string' ? toastError : err.message;
        toast.show(msg, 'error');
      }
      onError?.(err, vars);
    },
  });
}

// Re-export so screens don't need to know about react-query's name
export { extractApiError };
