import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, LoadingScreen, Screen, Text } from '@/components/ui';
import { Icon, StatsCard } from '@/components/common';
import { useApiQuery } from '@/hooks';
import { quizApi } from '@/api';
import { queryKeys } from '@/lib';
import { theme } from '@/theme';
import type { PracticeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'QuizResult'>;
type Nav = NativeStackNavigationProp<PracticeStackParamList, 'QuizResult'>;

export function QuizResultScreen({ route }: Props) {
  const { sessionId } = route.params;
  const navigation = useNavigation<Nav>();

  const result = useApiQuery({
    key: queryKeys.quizSession(`${sessionId}-result`),
    queryFn: () => quizApi.getResult(sessionId),
  });

  if (result.isLoading) {
    return <LoadingScreen />;
  }
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

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={[styles.checkCircle, accuracyPct >= 70 ? styles.checkOk : styles.checkBad]}>
            <Icon
              name={accuracyPct >= 70 ? 'check' : 'close'}
              color={theme.colors.textInverse}
              size={32}
            />
          </View>
          <Text variant="display" align="center">
            {accuracyPct >= 70 ? 'Tuyệt vời!' : 'Cố lên!'}
          </Text>
          <Text variant="body" color="secondary" align="center">
            Bạn trả lời đúng {r.correctCount}/{r.totalAnswered} câu trong {r.durationSeconds}s.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            label="Chính xác"
            value={`${accuracyPct}%`}
            accent={accuracyPct >= 80 ? 'success' : accuracyPct >= 50 ? 'warning' : 'danger'}
            style={styles.statCard}
          />
          <StatsCard label="Đúng" value={r.correctCount} accent="primary" style={styles.statCard} />
        </View>

        <Text variant="h2" style={styles.detailHeader}>
          Chi tiết
        </Text>
        {r.questions.map((q, i) => {
          const correctId = q.correctOptionId;
          const chosenId =
            r.questions[i]?.correctOptionId === correctId
              ? correctId
              : q.options.find(o => o.id !== correctId)?.id;
          return (
            <Card key={q.id} style={styles.qCard}>
              <Text variant="overline" color="muted">
                Câu {i + 1}
              </Text>
              <Text variant="bodyMedium">{q.prompt}</Text>
              {correctId
                ? q.options
                    .filter(o => o.id === correctId)
                    .map(o => (
                      <Text key={o.id} variant="small" color="success">
                        ✓ {o.label}
                      </Text>
                    ))
                : null}
              {chosenId && chosenId !== correctId
                ? q.options
                    .filter(o => o.id === chosenId)
                    .map(o => (
                      <Text key={o.id} variant="small" color="danger">
                        ✗ {o.label}
                      </Text>
                    ))
                : null}
            </Card>
          );
        })}

        <View style={styles.actions}>
          <Button title="Làm phiên mới" onPress={() => navigation.replace('QuizStart', {})} fullWidth />
          <Button title="Về trang luyện tập" variant="secondary" onPress={() => navigation.navigate('DueToday')} fullWidth />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  hero: { alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.lg },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  checkOk: { backgroundColor: theme.colors.success },
  checkBad: { backgroundColor: theme.colors.danger },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md },
  statCard: { flex: 1 },
  detailHeader: { marginTop: theme.spacing.base },
  qCard: { padding: theme.spacing.base, gap: theme.spacing.xs },
  actions: { gap: theme.spacing.md, marginTop: theme.spacing.lg },
});
