import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { useMemo } from 'react';

type Enabled = boolean | (() => boolean);

interface UseApiQueryOptions<TData, TParams = void>
  extends Omit<UseQueryOptions<TData, Error, TData, QueryKey>, 'queryKey' | 'queryFn'> {
  key: QueryKey;
  params?: TParams;
  queryFn: (params: TParams) => Promise<TData>;
  enabled?: Enabled;
}

function resolveEnabled(enabled: Enabled | undefined): boolean | undefined {
  if (typeof enabled === 'function') return enabled();
  return enabled;
}

export function useApiQuery<TData, TParams = void>({
  key,
  params,
  queryFn,
  enabled,
  ...options
}: UseApiQueryOptions<TData, TParams>) {
  const resolvedKey = useMemo(
    () => (Array.isArray(key) ? key : [key]) as QueryKey,
    [JSON.stringify(key)],
  );

  return useQuery<TData, Error, TData, QueryKey>({
    queryKey: resolvedKey,
    queryFn: () => queryFn(params as TParams),
    enabled: resolveEnabled(enabled),
    ...options,
  });
}
