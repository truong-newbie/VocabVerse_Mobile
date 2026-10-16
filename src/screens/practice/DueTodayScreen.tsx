import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, EmptyState, ErrorState, LoadingScreen, Screen, Text } from '@/components/ui';
import { StatsCard } from '@/components/common/StatsCard';
import { Icon, SectionHeader } from '@/components/common';
import { useApiQuery } from '@/hooks';
import { collectionApi, reviewApi } from '@/api';
import { queryKeys } from '@/lib';
import { theme } from '@/theme';
import type { PracticeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'DueToday'>;
type Nav = NativeStackNavigationProp<PracticeStackParamList, 'DueToday'>;

export function DueTodayScreen({}: Props) {
  const navigation = useNavigation<Nav>();
  const [scope, setScope] = useState<'ALL' | string>('ALL');

  const queue = useApiQuery({
    key: queryKeys.reviewToday({
      collectionId: scope === 'ALL' ? undefined : scope,
    }),
    queryFn: () =>
      reviewApi.getQueue(
        scope === 'ALL' ? undefined : { collectionId: scope }
      ),
    refetchInterval: 60_000,
  });

  const collections = useApiQuery({
    key: queryKeys.collections({ q: '', mine: true, page: 0 }),
    queryFn: () => collectionApi.listMine(0, 50),
  });

  const dueCount = queue.data?.due.length ?? 0;
  const newCount = queue.data?.newCards.length ?? 0;
  const totalCount = dueCount + newCount;

  const onStart = useCallback(() => {
    navigation.navigate('ReviewSession', {
      collectionId: scope === 'ALL' ? undefined : scope,
      limit: totalCount > 0 ? Math.max(totalCount, 1) : 20,
    });
  }, [navigation, scope, totalCount]);

  const onRefresh = useCallback(() => {
    queue.refetch();
    collections.refetch();
  }, [queue, collections]);

  const dueByCollection = useMemo(() => {
    if (!queue.data) return [] as { collectionId: string; count: number }[];
    const map = new Map<string, number>();
    for (const card of [...queue.data.due, ...queue.data.newCards]) {
      const collId = card.vocabulary.collectionId;
      if (!collId) continue;
      map.set(collId, (map.get(collId) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([collectionId, count]) => ({
      collectionId,
      count,
    }));
  }, [queue.data]);

  if (queue.isLoading && !queue.data) {
    return <LoadingScreen />;
  }

  if (queue.isError && !queue.data) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được hàng đợi"
          message={queue.error?.message}
          onRetry={queue.refetch}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        onScrollEndDrag={onRefresh}
        refreshing={queue.isFetching}
      >
        <View style={styles.headerBlock}>
          <Text variant="h1">Luyện tập hôm nay</Text>
          <Text variant="body" color="secondary">
            Hệ thống chọn các thẻ cần ôn dựa trên thuật toán SM-2 / FSRS.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            label="Cần ôn"
            value={dueCount}
            accent="primary"
            style={styles.statCard}
          />
          <StatsCard
            label="Thẻ mới"
            value={newCount}
            accent="success"
            style={styles.statCard}
          />
          <StatsCard
            label="Tổng"
            value={totalCount}
            style={styles.statCard}
          />
        </View>

        <Button
          title={totalCount > 0 ? `Bắt đầu (${totalCount} thẻ)` : 'Không có thẻ hôm nay'}
          onPress={onStart}
          disabled={totalCount === 0}
          fullWidth
        />

        <SectionHeader
          title="Theo bộ sưu tập"
          description={
            scope === 'ALL' ? 'Tất cả' : collections.data?.items.find(c => c.id === scope)?.title
          }
        />
        <View style={styles.chipsRow}>
          <Button
            title="Tất cả"
            variant={scope === 'ALL' ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setScope('ALL')}
          />
          {collections.data?.items.map(c => (
            <Button
              key={c.id}
              title={c.title}
              variant={scope === c.id ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => setScope(c.id)}
            />
          ))}
        </View>

        {dueByCollection.length === 0 ? (
          <Card>
            <Text variant="body" color="muted">
              Không có thẻ nào đến hạn trong các bộ sưu tập của bạn.
            </Text>
          </Card>
        ) : (
          <View style={styles.collList}>
            {dueByCollection.map(({ collectionId, count }) => {
              const c = collections.data?.items.find(x => x.id === collectionId);
              if (!c) return null;
              return (
                <Card
                  key={collectionId}
                  onPress={() => setScope(collectionId)}
                  style={styles.collCard}
                >
                  <View style={styles.collHeader}>
                    <Text variant="bodyMedium">{c.title}</Text>
                    <View style={styles.collCount}>
                      <Icon name="list" color={theme.colors.primary} size={16} />
                      <Text variant="smallMedium" color="primary">
                        {count} thẻ
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        <SectionHeader
          title="Lịch sử"
          action={
            <Button
              title="Xem tất cả"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('History')}
            />
          }
        />
        <Card onPress={() => navigation.navigate('PracticeStats')}>
          <Text variant="bodyMedium">Thống kê chi tiết</Text>
          <Text variant="caption" color="muted">
            Streak, accuracy, biểu đồ 7 ngày
          </Text>
        </Card>

        {queue.isFetching && !queue.isLoading ? (
          <View style={styles.footerSpinner}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  headerBlock: { gap: theme.spacing.xs, marginTop: theme.spacing.md },
  statsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  statCard: { flex: 1 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  collList: { gap: theme.spacing.sm },
  collCard: { padding: theme.spacing.md },
  collHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  collCount: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs },
  footerSpinner: { padding: theme.spacing.md, alignItems: 'center' },
});
