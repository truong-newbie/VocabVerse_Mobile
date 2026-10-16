import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, Input, Screen, Text } from '@/components/ui';
import { useApiMutation, useToast } from '@/hooks';
import { typingApi } from '@/api';
import { theme } from '@/theme';
import type { PracticeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'TypingSession'>;
type Nav = NativeStackNavigationProp<PracticeStackParamList, 'TypingSession'>;

export function TypingSessionScreen({ route }: Props) {
  const { sessionId } = route.params;
  const navigation = useNavigation<Nav>();
  const toast = useToast();

  const initialPrompts = (route.params as any).prompts as
    | import('@/types').TypingPrompt[]
    | undefined;
  const [prompts] = useState(initialPrompts ?? []);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; similarity: number } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const totalAnsweredRef = useRef(0);
  const similaritySumRef = useRef(0);
  const startedAt = useRef(Date.now());
  const promptStartedAt = useRef(Date.now());

  useEffect(() => {
    setTyped('');
    setFeedback(null);
    promptStartedAt.current = Date.now();
  }, [index]);

  const submit = useApiMutation({
    mutationFn: () =>
      typingApi.submitAnswer({
        sessionId,
        promptId: prompts[index].id,
        typed: typed.trim().toLowerCase(),
        elapsedMs: Date.now() - promptStartedAt.current,
      }),
  });

  const complete = useApiMutation({
    mutationFn: () =>
      typingApi.completeSession({
        sessionId,
        totalAnswered: totalAnsweredRef.current,
        correctCount,
        durationSeconds: Math.round((Date.now() - startedAt.current) / 1000),
      }),
  });

  const onSubmit = () => {
    if (typed.trim() === '') return;
    submit.mutate(undefined, {
      onSuccess: res => {
        setFeedback({ isCorrect: res.isCorrect, similarity: res.similarity });
        totalAnsweredRef.current += 1;
        similaritySumRef.current += res.similarity;
        if (res.isCorrect) setCorrectCount(c => c + 1);
      },
      onError: () => toast.error('Không ghi được câu trả lời'),
    });
  };

  const onNext = () => {
    if (index + 1 >= prompts.length) {
      complete.mutate(undefined, {
        onSuccess: () => navigation.replace('TypingResult', { sessionId }),
        onError: () => navigation.replace('TypingResult', { sessionId }),
      });
      return;
    }
    setIndex(i => i + 1);
  };

  if (prompts.length === 0) {
    return (
      <Screen>
        <ErrorState
          title="Phiên trống"
          message="Vui lòng quay lại và thử lại."
        />
        <Button title="Quay lại" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const current = prompts[index];

  return (
    <Screen padded={false}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((index + 1) / prompts.length) * 100}%` },
          ]}
        />
      </View>
      <View style={styles.metaRow}>
        <Text variant="smallMedium" color="muted">
          Từ {index + 1}/{prompts.length}
        </Text>
        <Text variant="small" color="muted">
          Đúng {correctCount}
        </Text>
      </View>

      <View style={styles.body}>
        <Card style={styles.promptCard}>
          <Text variant="overline" color="muted">
            Nghe từ
          </Text>
          {current.audioUrl ? (
            <Pressable onPress={() => { /* TODO: hook AudioControls */ }}>
              <Text variant="h2" color="primary" align="center">
                ▶ Phát âm
              </Text>
            </Pressable>
          ) : (
            <Text variant="body" color="muted" align="center">
              Không có audio
            </Text>
          )}
          {current.hint ? (
            <Text variant="caption" color="muted" align="center">
              {current.hint}
            </Text>
          ) : null}
        </Card>

        <Input
          label="Gõ lại từ vừa nghe"
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={onSubmit}
          returnKeyType="send"
        />

        {feedback ? (
          <Card
            style={[
              styles.feedbackCard,
              feedback.isCorrect ? styles.feedbackOk : styles.feedbackBad,
            ]}
          >
            <Text variant="bodyMedium">
              {feedback.isCorrect ? '✓ Chính xác' : `✗ Đáp án: ${current.expected}`}
            </Text>
            <Text variant="caption" color="muted">
              Độ giống: {Math.round(feedback.similarity * 100)}%
            </Text>
            {current.meaning ? (
              <Text variant="small" color="secondary">
                {current.meaning}
              </Text>
            ) : null}
          </Card>
        ) : null}
      </View>

      <View style={styles.footer}>
        {feedback ? (
          <Button
            title={index + 1 >= prompts.length ? 'Hoàn thành' : 'Từ tiếp'}
            onPress={onNext}
            isLoading={complete.isPending}
            fullWidth
          />
        ) : (
          <Button title="Kiểm tra" onPress={onSubmit} fullWidth />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
    margin: theme.spacing.base,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: theme.colors.primary },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
  },
  body: { flex: 1, padding: theme.spacing.base, gap: theme.spacing.md },
  promptCard: { padding: theme.spacing.base, gap: theme.spacing.sm, alignItems: 'center' },
  feedbackCard: { padding: theme.spacing.base, gap: theme.spacing.xs },
  feedbackOk: { borderColor: theme.colors.success, borderWidth: 1 },
  feedbackBad: { borderColor: theme.colors.danger, borderWidth: 1 },
  footer: { padding: theme.spacing.base },
});
