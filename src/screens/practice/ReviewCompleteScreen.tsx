import { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, Screen, Text } from '@/components/ui';
import { Icon, StatsCard } from '@/components/common';
import { useApiMutation, useApiQuery } from '@/hooks';
import { reviewApi } from '@/api';
import { queryKeys } from '@/lib';
import { theme } from '@/theme';
import type { PracticeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'ReviewComplete'>;
type Nav = NativeStackNavigationProp<PracticeStackParamList, 'ReviewComplete'>;

export function ReviewCompleteScreen({ route }: Props) {
  const navigation = useNavigation<Nav>();
  const { totalReviewed, againCount, hardCount, goodCount, easyCount, durationSeconds } =
    route.params;

  const accuracy = useMemo(() => {
    if (totalReviewed === 0) return 0;
    const correct = goodCount + easyCount + hardCount;
    return correct / totalReviewed;
  }, [totalReviewed, goodCount, easyCount, hardCount]);

  const durationLabel = useMemo(() => {
    if (durationSeconds < 60) return `${durationSeconds}s`;
    const m = Math.floor(durationSeconds / 60);
    const s = durationSeconds % 60;
    return `${m}p${s > 0 ? ` ${s}s` : ''}`;
  }, [durationSeconds]);

  const complete = useApiMutation({
    mutationFn: () =>
      reviewApi.completeSession({
        totalReviewed,
        againCount,
        hardCount,
        goodCount,
        easyCount,
        durationSeconds,
      }),
    invalidate: [
      queryKeys.reviewStats(),
      queryKeys.reviewToday({}),
      queryKeys.reviewDueCount(),
    ],
  });

  useEffect(() => {
    if (!complete.isPending && !complete.isSuccess && !complete.isError) {
      complete.mutate();
    }
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While the streak call is in flight, still show the summary so the
  // user has something to look at.
  const onGoHome = () => {
    navigation.reset({ index: 0, routes: [{ name: 'DueToday' }] });
  };

  const onAgain = () => {
    navigation.reset({ index: 0, routes: [{ name: 'DueToday' }] });
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.checkCircle}>
            <Icon name="check" color={theme.colors.textInverse} size={32} />
          </View>
          <Text variant="display" align="center">
            Hoàn thành!
          </Text>
          <Text variant="body" color="secondary" align="center">
            Bạn vừa ôn {totalReviewed} thẻ trong {durationLabel}.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            label="Chính xác"
            value={`${Math.round(accuracy * 100)}%`}
            accent={accuracy >= 0.8 ? 'success' : accuracy >= 0.5 ? 'warning' : 'danger'}
            style={styles.statCard}
          />
          <StatsCard
            label="Thời gian"
            value={durationLabel}
            style={styles.statCard}
          />
        </View>

        <View style={styles.breakdown}>
          <BreakdownRow color={theme.colors.again} label={againCount} text="Lặp lại" />
          <BreakdownRow color={theme.colors.hard} label={hardCount} text="Khó" />
          <BreakdownRow color={theme.colors.good} label={goodCount} text="Tốt" />
          <BreakdownRow color={theme.colors.easy} label={easyCount} text="Dễ" />
        </View>

        {complete.isPending ? (
          <Card style={styles.streakCard}>
            <View style={styles.streakRow}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text variant="bodyMedium">Đang cập nhật streak...</Text>
            </View>
          </Card>
        ) : complete.isSuccess ? (
          <Card style={styles.streakCard}>
            <View style={styles.streakRow}>
              <Text variant="h2" color="primary">
                {complete.data.newStreak}
              </Text>
              <View>
                <Text variant="bodyMedium">Streak hiện tại</Text>
                <Text variant="caption" color="muted">
                  {complete.data.streakExtended
                    ? 'Đã gia hạn streak hôm nay 🔥'
                    : 'Bạn đã ôn tập trước đó hôm nay.'}
                </Text>
              </View>
            </View>
          </Card>
        ) : complete.isError ? (
          <ErrorState
            title="Không cập nhật được streak"
            message={complete.error?.message}
            onRetry={() => complete.mutate()}
          />
        ) : null}

        <View style={styles.actions}>
          <Button title="Về trang luyện tập" onPress={onGoHome} fullWidth />
          <Button title="Ôn tiếp" variant="secondary" onPress={onAgain} fullWidth />
        </View>
      </ScrollView>
    </Screen>
  );
}

function BreakdownRow({
  color,
  label,
  text,
}: {
  color: string;
  label: number;
  text: string;
}) {
  return (
    <View style={styles.breakdownRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="bodyMedium" style={styles.breakdownLabel}>
        {text}
      </Text>
      <Text variant="bodyMedium" color="muted">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  hero: { alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.xl },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md },
  statCard: { flex: 1 },
  breakdown: { gap: theme.spacing.sm },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  breakdownLabel: { flex: 1 },
  streakCard: { padding: theme.spacing.base },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  actions: { gap: theme.spacing.md, marginTop: theme.spacing.lg },
});
