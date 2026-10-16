import { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, ErrorState, LoadingScreen, Screen, Text } from '@/components/ui';
import { Chip } from '@/components/common';
import { useApiQuery, useInfinitePagination } from '@/hooks';
import { shadowingApi } from '@/api';
import { formatDate, queryKeys } from '@/lib';
import { theme } from '@/theme';
import type { ShadowingLesson } from '@/types';
import type { PageResponse } from '@/types';
import type { PracticeStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<PracticeStackParamList>;

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Cơ bản',
  INTERMEDIATE: 'Trung bình',
  ADVANCED: 'Nâng cao',
};

const DIFFICULTY_COLORS: Record<string, 'success' | 'warning' | 'danger'> = {
  BEGINNER: 'success',
  INTERMEDIATE: 'warning',
  ADVANCED: 'danger',
};

export function ShadowingListScreen() {
  const navigation = useNavigation<Nav>();

  const {
    items,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useInfinitePagination<ShadowingLesson>({
    queryKey: queryKeys.shadowingLessons({}),
    fetchPage: page =>
      shadowingApi.listLessons({ page, size: 20 }) as unknown as Promise<
        PageResponse<ShadowingLesson>
      >,
  });

  const onPress = useCallback(
    (lesson: ShadowingLesson) =>
      navigation.navigate('Shadowing', { lessonId: lesson.id }),
    [navigation]
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được danh sách lesson"
          message={error?.message}
          onRetry={refetch}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card onPress={() => onPress(item)} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text variant="bodyMedium" style={styles.title}>
                {item.title}
              </Text>
              <Chip
                label={DIFFICULTY_LABELS[item.difficulty] ?? item.difficulty}
                color={DIFFICULTY_COLORS[item.difficulty] ?? 'primary'}
                variant="outline"
              />
            </View>
            {item.description ? (
              <Text variant="caption" color="muted" numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.rowFooter}>
              <Text variant="caption" color="muted">
                {Math.round(item.durationSeconds / 60)} phút · {formatDate(item.createdAt)}
              </Text>
              <View style={styles.tagsRow}>
                {item.tags.slice(0, 3).map(tag => (
                  <Chip key={tag} label={`#${tag}`} variant="outline" />
                ))}
              </View>
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="body" color="muted" align="center">
              Chưa có lesson nào.
            </Text>
          </View>
        }
        onRefresh={refetch}
        refreshing={isFetching}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: theme.spacing.base, paddingBottom: theme.spacing.xxxl },
  row: { padding: theme.spacing.base, gap: theme.spacing.xs },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, justifyContent: 'space-between' },
  title: { flex: 1 },
  rowFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.xs },
  tagsRow: { flexDirection: 'row', gap: theme.spacing.xs, flexWrap: 'wrap' },
  sep: { height: theme.spacing.sm },
  empty: { padding: theme.spacing.xl, alignItems: 'center' },
});
