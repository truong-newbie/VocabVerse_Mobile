import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, LoadingScreen, Screen, Text } from '@/components/ui';
import { StatsCard } from '@/components/common';
import { useApiQuery } from '@/hooks';
import { typingApi } from '@/api';
import { theme } from '@/theme';
import type { PracticeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'TypingResult'>;
type Nav = NativeStackNavigationProp<PracticeStackParamList, 'TypingResult'>;

export function TypingResultScreen({ route }: Props) {
  const { sessionId } = route.params;
  const navigation = useNavigation<Nav>();

  const result = useApiQuery({
    key: ['typing', 'result', sessionId],
    queryFn: () => typingApi.getResult(sessionId),
  });

  if (result.isLoading) return <LoadingScreen />;
  if (result.isError) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được kết quả"
          message={result.error?.message}
          onRetry={result.refetch}
        />
      </Screen>
    );
  }

  const r = result.data!;
  const accuracyPct = Math.round(r.accuracy * 100);
  const similarityPct = Math.round(r.averageSimilarity * 100);

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text variant="display" align="center">
            {accuracyPct >= 80 ? 'Tốt lắm!' : 'Cố gắng thêm'}
          </Text>
          <Text variant="body" color="secondary" align="center">
            Đúng {r.correctCount}/{r.totalAnswered} từ trong {r.durationSeconds}s
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            label="Chính xác"
            value={`${accuracyPct}%`}
            accent={accuracyPct >= 80 ? 'success' : 'warning'}
            style={styles.statCard}
          />
          <StatsCard
            label="Độ giống TB"
            value={`${similarityPct}%`}
            accent="primary"
            style={styles.statCard}
          />
        </View>

        <Text variant="h2" style={styles.detailHeader}>
          Chi tiết
        </Text>
        {r.perPrompt.map((p, i) => {
          const prompt = r.prompts.find(x => x.id === p.promptId);
          return (
            <Card key={p.promptId} style={styles.row}>
              <View style={styles.rowLeft}>
                <Text variant="overline" color="muted">
                  Từ {i + 1}
                </Text>
                <Text variant="bodyMedium">
                  {prompt?.expected ?? '—'}
                </Text>
                {prompt?.meaning ? (
                  <Text variant="caption" color="muted">
                    {prompt.meaning}
                  </Text>
                ) : null}
              </View>
              <View style={styles.rowRight}>
                <Text variant="bodyMedium" color={p.isCorrect ? 'success' : 'danger'}>
                  {p.isCorrect ? '✓' : '✗'} {p.typed || '(trống)'}
                </Text>
                <Text variant="caption" color="muted">
                  {Math.round(p.similarity * 100)}%
                </Text>
              </View>
            </Card>
          );
        })}

        <View style={styles.actions}>
          <Button
            title="Làm phiên mới"
            onPress={() => navigation.replace('TypingStart', {})}
            fullWidth
          />
          <Button
            title="Về trang luyện tập"
            variant="secondary"
            onPress={() => navigation.navigate('DueToday')}
            fullWidth
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  hero: { alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.lg },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md },
  statCard: { flex: 1 },
  detailHeader: { marginTop: theme.spacing.base },
  row: { padding: theme.spacing.base, flexDirection: 'row', alignItems: 'center' },
  rowLeft: { flex: 1, gap: theme.spacing.xxs },
  rowRight: { alignItems: 'flex-end' },
  actions: { gap: theme.spacing.md, marginTop: theme.spacing.lg },
});
