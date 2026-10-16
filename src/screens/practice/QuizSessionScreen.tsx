import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, Screen, Text } from '@/components/ui';
import { useApiMutation, useApiQuery, useToast } from '@/hooks';
import { quizApi } from '@/api';
import { queryKeys } from '@/lib';
import { theme } from '@/theme';
import type { QuizOption } from '@/types';
import type { PracticeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'QuizSession'>;
type Nav = NativeStackNavigationProp<PracticeStackParamList, 'QuizSession'>;

export function QuizSessionScreen({ route }: Props) {
  const { sessionId } = route.params;
  const navigation = useNavigation<Nav>();
  const toast = useToast();

  const session = useApiQuery({
    key: queryKeys.quizSession(sessionId),
    queryFn: () => quizApi.getResult(sessionId), // 404 during play; we use the createSession response instead
    retry: false,
    enabled: false,
  });

  // The server is the source of truth: we keep the questions in
  // local state, populated by route.params if the navigator passes
  // them down. For simplicity here we ask the user to come in
  // through QuizStart, which creates the session and navigates with
  // the questions in route.params.
  const initialQuestions = (route.params as any).questions as
    | undefined
    | import('@/types').QuizQuestion[];
  const [questions] = useState(initialQuestions ?? []);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [startedAt] = useState(Date.now());
  const [cardStartedAt, setCardStartedAt] = useState(Date.now());
  const totalAnsweredRef = useRef(0);

  useEffect(() => {
    setCardStartedAt(Date.now());
  }, [index]);

  const submit = useApiMutation({
    mutationFn: ({
      questionId,
      optionId,
      elapsedMs,
    }: {
      questionId: string;
      optionId: string;
      elapsedMs: number;
    }) => quizApi.submitAnswer({ sessionId, questionId, selectedOptionId: optionId, elapsedMs }),
  });

  const complete = useApiMutation({
    mutationFn: () =>
      quizApi.completeSession({
        sessionId,
        totalAnswered: totalAnsweredRef.current,
        correctCount,
        durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      }),
  });

  if (session.isError) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được phiên quiz"
          message={session.error?.message}
          onRetry={() => session.refetch()}
        />
      </Screen>
    );
  }

  if (questions.length === 0) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text variant="h2" align="center">
            Phiên trống
          </Text>
          <Text variant="body" color="muted" align="center">
            Vui lòng bắt đầu từ màn hình Quiz.
          </Text>
          <Button title="Quay lại" onPress={() => navigation.goBack()} />
        </View>
      </Screen>
    );
  }

  const current = questions[index];
  const remaining = questions.length - index;

  const onPick = (option: QuizOption) => {
    if (picked) return;
    setPicked(option.id);
    totalAnsweredRef.current += 1;
    const elapsedMs = Date.now() - cardStartedAt;

    submit.mutate(
      { questionId: current.id, optionId: option.id, elapsedMs },
      {
        onSuccess: res => {
          if (res.isCorrect) setCorrectCount(c => c + 1);
        },
        onError: () => toast.error('Không ghi được câu trả lời'),
      }
    );
  };

  const onNext = () => {
    if (index + 1 >= questions.length) {
      complete.mutate(undefined, {
        onSuccess: () => {
          navigation.replace('QuizResult', { sessionId });
        },
        onError: () => {
          // even if complete fails, the user can still see the
          // result screen which queries the per-question breakdown
          navigation.replace('QuizResult', { sessionId });
        },
      });
      return;
    }
    setIndex(i => i + 1);
    setPicked(null);
  };

  return (
    <Screen padded={false}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((index + 1) / questions.length) * 100}%` },
          ]}
        />
      </View>
      <View style={styles.metaRow}>
        <Text variant="smallMedium" color="muted">
          Câu {index + 1}/{questions.length}
        </Text>
        <Text variant="small" color="muted">
          Còn {remaining} câu
        </Text>
      </View>

      <View style={styles.body}>
        <Text variant="overline" color="muted">
          {current.type === 'TERM_TO_MEANING' ? 'Từ → Nghĩa' : 'Nghĩa → Từ'}
        </Text>
        <Text variant="display" align="center">
          {current.prompt}
        </Text>
        {current.promptHint ? (
          <Text variant="caption" color="muted" align="center">
            {current.promptHint}
          </Text>
        ) : null}

        <View style={styles.optionsList}>
          {current.options.map(option => {
            const isPicked = picked === option.id;
            const bg = isPicked ? theme.colors.primary : theme.colors.bgElevated;
            const fg = isPicked ? theme.colors.textInverse : theme.colors.textPrimary;
            return (
              <Pressable
                key={option.id}
                onPress={() => onPick(option)}
                style={[styles.option, { backgroundColor: bg, borderColor: theme.colors.border }]}
              >
                <Text variant="bodyMedium" color={isPicked ? 'inverse' : 'primary'}>
                  {option.label}
                </Text>
                {option.hint ? (
                  <Text
                    variant="caption"
                    color={isPicked ? 'inverse' : 'muted'}
                  >
                    {option.hint}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        {picked ? (
          <Button title="Câu tiếp" onPress={onNext} fullWidth />
        ) : (
          <Text variant="caption" color="muted" align="center">
            Chọn một đáp án để tiếp tục
          </Text>
        )}
        {submit.isPending ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : null}
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
  body: {
    flex: 1,
    padding: theme.spacing.base,
    gap: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsList: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  option: {
    padding: theme.spacing.base,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.xxs,
  },
  footer: { padding: theme.spacing.base, gap: theme.spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl },
});
