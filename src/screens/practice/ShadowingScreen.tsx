import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, LoadingScreen, Screen, Text } from '@/components/ui';
import { StatsCard } from '@/components/common';
import { useApiMutation, useApiQuery, useToast } from '@/hooks';
import { shadowingApi } from '@/api';
import { theme } from '@/theme';
import type { ShadowingAttemptScore } from '@/types';
import type { PracticeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'Shadowing'>;
type Nav = NativeStackNavigationProp<PracticeStackParamList, 'Shadowing'>;

export function ShadowingScreen({ route }: Props) {
  const { lessonId } = route.params;
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const [score, setScore] = useState<ShadowingAttemptScore | null>(null);

  const lesson = useApiQuery({
    key: ['shadowing', 'lesson', lessonId],
    queryFn: () => shadowingApi.getLesson(lessonId),
  });

  const submit = useApiMutation({
    mutationFn: () =>
      // For now we record a fake audioUrl; the real recorder lands
      // in Commit 4.11 alongside AudioControls.
      shadowingApi.submitAttempt({
        lessonId,
        audioUrl: 'placeholder://recorded-audio',
        durationMs: 5000,
      }),
    onSuccess: attempt => setScore(attempt.score),
    onError: () => toast.error('Không ghi được attempt'),
  });

  if (lesson.isLoading) return <LoadingScreen />;
  if (lesson.isError) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được lesson"
          message={lesson.error?.message}
          onRetry={lesson.refetch}
        />
      </Screen>
    );
  }

  const l = lesson.data!;

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text variant="h1">{l.title}</Text>
          {l.description ? (
            <Text variant="body" color="secondary" align="center">
              {l.description}
            </Text>
          ) : null}
        </View>

        <Card style={styles.card}>
          <Text variant="overline" color="muted">
            Transcript tham chiếu
          </Text>
          <Text variant="body" style={styles.transcript}>
            {l.referenceTranscript}
          </Text>
          <Pressable onPress={() => { /* TODO: AudioControls */ }}>
            <Text variant="h3" color="primary" align="center" style={styles.audioBtn}>
              ▶ Nghe
            </Text>
          </Pressable>
        </Card>

        <Card style={styles.card}>
          <Text variant="overline" color="muted">
            Ghi âm của bạn
          </Text>
          <Text variant="caption" color="muted" style={styles.recordHint}>
            (Ghi âm thực sẽ được gắn vào AudioControls ở Commit 4.11)
          </Text>
          <Button
            title="Ghi và nộp"
            onPress={() => submit.mutate()}
            isLoading={submit.isPending}
          />
        </Card>

        {score ? (
          <View>
            <Text variant="h2" style={styles.scoreHeader}>
              Kết quả
            </Text>
            <View style={styles.statsRow}>
              <StatsCard
                label="Tổng"
                value={score.score}
                accent={score.score >= 80 ? 'success' : 'warning'}
                style={styles.statCard}
              />
              <StatsCard
                label="Phát âm"
                value={score.pronunciation}
                style={styles.statCard}
              />
            </View>
            <View style={styles.statsRow}>
              <StatsCard
                label="Lưu loát"
                value={score.fluency}
                style={styles.statCard}
              />
              <StatsCard
                label="Đầy đủ"
                value={score.completeness}
                style={styles.statCard}
              />
            </View>
            {score.feedback ? (
              <Card style={styles.feedback}>
                <Text variant="bodyMedium">{score.feedback}</Text>
              </Card>
            ) : null}
            {score.transcription ? (
              <Card style={styles.feedback}>
                <Text variant="overline" color="muted">
                  Bạn đã nói
                </Text>
                <Text variant="body">{score.transcription}</Text>
              </Card>
            ) : null}
            <Button
              title="Thử lại"
              onPress={() => setScore(null)}
              variant="secondary"
              fullWidth
            />
          </View>
        ) : null}

        <Button
          title="Về danh sách lesson"
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  hero: { alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.md },
  card: { padding: theme.spacing.base, gap: theme.spacing.sm },
  transcript: { lineHeight: 22 },
  audioBtn: { paddingVertical: theme.spacing.sm },
  recordHint: { marginBottom: theme.spacing.xs },
  scoreHeader: { marginTop: theme.spacing.lg },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md },
  statCard: { flex: 1 },
  feedback: { padding: theme.spacing.base, gap: theme.spacing.xs },
});
