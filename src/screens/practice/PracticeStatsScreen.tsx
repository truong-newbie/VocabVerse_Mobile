import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, LoadingScreen, Screen, Text } from '@/components/ui';
import { Icon, SectionHeader, StatsCard } from '@/components/common';
import { useApiQuery } from '@/hooks';
import { reviewApi } from '@/api';
import { theme } from '@/theme';
import type { PracticeStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<PracticeStackParamList>;

export function PracticeStatsScreen() {
  const navigation = useNavigation<Nav>();

  const stats = useApiQuery({
    key: ['review', 'stats'],
    queryFn: () => reviewApi.getStats(),
  });

  const histogram = useMemo(() => stats.data?.weeklyHistogram ?? [], [stats.data]);
  const maxCount = useMemo(
    () => Math.max(1, ...histogram.map(b => b.count)),
    [histogram]
  );

  if (stats.isLoading) {
    return <LoadingScreen />;
  }

  if (stats.isError) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được thống kê"
          message={stats.error?.message}
          onRetry={stats.refetch}
        />
      </Screen>
    );
  }

  const s = stats.data!;

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshing={stats.isFetching}
        onScrollEndDrag={stats.refetch}
      >
        <View style={styles.headerBlock}>
          <Text variant="h1">Thống kê</Text>
          <Text variant="body" color="secondary">
            Streak và tiến độ học của bạn
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            label="Streak"
            value={s.currentStreak}
            accent="primary"
            delta={`Tốt nhất: ${s.longestStreak}`}
            style={styles.statCard}
          />
          <StatsCard
            label="Cần ôn hôm nay"
            value={s.dueToday}
            accent="warning"
            style={styles.statCard}
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            label="Thẻ mới"
            value={s.newCards}
            accent="success"
            style={styles.statCard}
          />
          <StatsCard
            label="Đã ôn tuần này"
            value={s.reviewedThisWeek}
            style={styles.statCard}
          />
        </View>

        <Card>
          <View style={styles.accuracyRow}>
            <View>
              <Text variant="overline" color="muted">
                Độ chính xác 7 ngày
              </Text>
              <Text variant="h1" color={s.accuracyThisWeek >= 0.8 ? 'success' : 'primary'}>
                {Math.round(s.accuracyThisWeek * 100)}%
              </Text>
            </View>
            <Button
              title="Luyện tập ngay"
              onPress={() => navigation.navigate('DueToday')}
            />
          </View>
        </Card>

        <SectionHeader
          title="Hoạt động 7 ngày"
          description="Số thẻ đã ôn mỗi ngày"
        />
        <Card>
          {histogram.length === 0 ? (
            <Text variant="body" color="muted">
              Chưa có dữ liệu trong 7 ngày qua.
            </Text>
          ) : (
            <View style={styles.chartRow}>
              {histogram.map(b => {
                const height = Math.max(4, (b.count / maxCount) * 100);
                return (
                  <View key={b.date} style={styles.chartCol}>
                    <View
                      style={[
                        styles.chartBar,
                        { height: `${height}%` },
                        b.count === 0 ? styles.chartBarEmpty : null,
                      ]}
                    />
                    <Text variant="caption" color="muted" style={styles.chartDate}>
                      {formatShortDate(b.date)}
                    </Text>
                    <Text variant="smallMedium" style={styles.chartCount}>
                      {b.count}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

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
        <Card>
          <View style={styles.cardRow}>
            <Icon name="calendar" color={theme.colors.primary} />
            <Text variant="bodyMedium">Xem lịch sử ôn tập theo ngày</Text>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function formatShortDate(iso: string): string {
  // iso is yyyy-MM-dd
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  headerBlock: { gap: theme.spacing.xs, marginTop: theme.spacing.md },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md },
  statCard: { flex: 1 },
  accuracyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    gap: theme.spacing.xs,
  },
  chartCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  chartBar: {
    width: '70%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
  },
  chartBarEmpty: { backgroundColor: theme.colors.surface },
  chartDate: { marginTop: theme.spacing.xs },
  chartCount: { fontSize: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
});
