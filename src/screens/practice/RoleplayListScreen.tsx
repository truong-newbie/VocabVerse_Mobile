import { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, LoadingScreen, Screen, Text } from '@/components/ui';
import { Chip } from '@/components/common';
import { useApiMutation, useApiQuery, useInfinitePagination, useToast } from '@/hooks';
import { roleplayApi } from '@/api';
import { ROLEPLAY_DIFFICULTY_LABELS } from '@/types/enums';
import { theme } from '@/theme';
import type { RoleplayScenario } from '@/types';
import type { PageResponse } from '@/types';
import type { PracticeStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<PracticeStackParamList>;

export function RoleplayListScreen() {
  const navigation = useNavigation<Nav>();
  const toast = useToast();

  const {
    items,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useInfinitePagination<RoleplayScenario>({
    queryKey: ['roleplay', 'scenarios', {}],
    fetchPage: page =>
      roleplayApi.listScenarios({ page, size: 20 }) as unknown as Promise<
        PageResponse<RoleplayScenario>
      >,
  });

  const startSession = useApiMutation({
    mutationFn: (scenarioId: string) => roleplayApi.startSession({ scenarioId }),
    onSuccess: session => {
      navigation.navigate('RoleplaySession', { sessionId: session.id });
    },
    onError: () => toast.error('Không tạo được phiên'),
  });

  const onStart = useCallback(
    (s: RoleplayScenario) => startSession.mutate(s.id),
    [startSession]
  );

  if (isLoading) return <LoadingScreen />;
  if (isError) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được scenarios"
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
        keyExtractor={s => s.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <View style={styles.rowHeader}>
              <Text variant="bodyMedium" style={styles.title}>
                {item.title}
              </Text>
              <Chip
                label={ROLEPLAY_DIFFICULTY_LABELS[item.difficulty]}
                color={item.difficulty === 'EASY' ? 'success' : item.difficulty === 'MEDIUM' ? 'warning' : 'danger'}
                variant="outline"
              />
            </View>
            <Text variant="caption" color="muted" numberOfLines={2}>
              {item.description}
            </Text>
            <Text variant="caption" color="muted" style={styles.meta}>
              {item.estimatedTurns} lượt ước tính · {item.aiPersona}
            </Text>
            <View style={styles.tagsRow}>
              {item.tags.map(tag => (
                <Chip key={tag} label={`#${tag}`} variant="outline" />
              ))}
            </View>
            <Button
              title="Bắt đầu"
              onPress={() => onStart(item)}
              isLoading={startSession.isPending}
              fullWidth
            />
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="body" color="muted" align="center">
              Chưa có scenario nào.
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
  row: { padding: theme.spacing.base, gap: theme.spacing.sm },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, justifyContent: 'space-between' },
  title: { flex: 1 },
  meta: { marginTop: theme.spacing.xs },
  tagsRow: { flexDirection: 'row', gap: theme.spacing.xs, flexWrap: 'wrap' },
  sep: { height: theme.spacing.sm },
  empty: { padding: theme.spacing.xl, alignItems: 'center' },
});
