import { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Card, EmptyState, ErrorState, LoadingScreen, Screen, Text } from '@/components/ui';
import { useApiQuery, useInfinitePagination } from '@/hooks';
import { reviewApi } from '@/api';
import { queryKeys } from '@/lib';
import { theme } from '@/theme';
import type { PageResponse, ReviewHistoryEntry } from '@/types';

export function HistoryScreen() {
  const queryKey = useMemo(() => queryKeys.reviewHistory({}), []);

  const {
    items,
    isLoading,
    isError,
    error,
    hasMore,
    fetchMore,
    isFetching,
    refetch,
  } = useInfinitePagination<ReviewHistoryEntry>({
    queryKey,
    fetchPage: page =>
      reviewApi.getHistory(page, 30) as unknown as Promise<PageResponse<ReviewHistoryEntry>>,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được lịch sử"
          message={error?.message}
          onRetry={refetch}
        />
      </Screen>
    );
  }

  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Chưa có hoạt động"
          message="Bắt đầu một phiên ôn tập để thấy lịch sử."
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={items}
        keyExtractor={item => item.date}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <View style={styles.rowLeft}>
              <Text variant="bodyMedium">{formatHumanDate(item.date)}</Text>
              <Text variant="caption" color="muted">
                {item.againCount} lặp lại · đúng {Math.round(item.accuracy * 100)}%
              </Text>
            </View>
            <Text variant="h2" color="primary">
              {item.reviewedCount}
            </Text>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListFooterComponent={
          hasMore ? (
            <View style={styles.footer}>
              {isFetching ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <Text
                  variant="bodyMedium"
                  color="primary"
                  onPress={fetchMore}
                  style={styles.footerLink}
                >
                  Tải thêm
                </Text>
              )}
            </View>
          ) : null
        }
        onRefresh={refetch}
        refreshing={isFetching && !isLoading}
      />
    </Screen>
  );
}

function formatHumanDate(iso: string): string {
  // yyyy-MM-dd -> dd/MM/yyyy
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const styles = StyleSheet.create({
  listContent: { padding: theme.spacing.base, paddingBottom: theme.spacing.xxxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  rowLeft: { gap: theme.spacing.xxs },
  sep: { height: theme.spacing.sm },
  footer: { padding: theme.spacing.lg, alignItems: 'center' },
  footerLink: { padding: theme.spacing.sm },
});
