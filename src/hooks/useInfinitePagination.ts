import {
  useInfiniteQuery,
  type QueryKey,
} from '@tanstack/react-query';
import type { PageResponse } from '@/types';

interface UseInfinitePaginationOptions<T> {
  queryKey: QueryKey;
  fetchPage: (page: number) => Promise<PageResponse<T>>;
  pageSize?: number;
  enabled?: boolean;
}

export function useInfinitePagination<T>({
  queryKey,
  fetchPage,
  pageSize = 20,
  enabled = true,
}: UseInfinitePaginationOptions<T>) {
  const query = useInfiniteQuery<PageResponse<T>, Error, { pages: PageResponse<T>[] }, QueryKey, number>({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      if (lastPage.page + 1 >= lastPage.totalPages) return undefined;
      return lastPage.page + 1;
    },
    enabled,
  });

  const items: T[] = (query.data?.pages ?? []).flatMap(p => p.items);
  const hasMore = typeof query.data?.pages?.at(-1) === 'object'
    ? (query.data!.pages.at(-1)!.page + 1) <
        (query.data!.pages.at(-1)!.totalPages)
    : false;

  return {
    ...query,
    items,
    hasMore,
    isFetching: query.isFetching,
    fetchMore: () => {
      if (hasMore && !query.isFetchingNextPage) {
        return query.fetchNextPage();
      }
    },
    refetch: query.refetch,
  };
}
