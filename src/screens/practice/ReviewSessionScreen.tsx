import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, ErrorState, Screen, Text } from '@/components/ui';
import { useApiMutation, useApiQuery, useToast } from '@/hooks';
import { reviewApi } from '@/api';
import { theme } from '@/theme';
import { queryKeys } from '@/lib';
import { REVIEW_RESULT_LABELS } from '@/types/enums';
import type { ReviewCard } from '@/types';
import type { Sm2Button } from '@/lib/sm2';
import type { PracticeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'ReviewSession'>;
type Nav = NativeStackNavigationProp<PracticeStackParamList, 'ReviewSession'>;

interface SessionSummary {
  totalReviewed: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  durationSeconds: number;
}

const QUALITY_BUTTONS: { key: Sm2Button; color: string; label: string; shortcut: string }[] = [
  { key: 'AGAIN', color: theme.colors.again, label: 'Lặp lại', shortcut: '1' },
  { key: 'HARD', color: theme.colors.hard, label: 'Khó', shortcut: '2' },
  { key: 'GOOD', color: theme.colors.good, label: 'Tốt', shortcut: '3' },
  { key: 'EASY', color: theme.colors.easy, label: 'Dễ', shortcut: '4' },
];

export function ReviewSessionScreen({ route }: Props) {
  const { collectionId, limit } = route.params;
  const navigation = useNavigation<Nav>();
  const toast = useToast();

  const queue = useApiQuery({
    key: queryKeys.reviewToday({ collectionId, limit }),
    queryFn: () => reviewApi.getQueue({ collectionId, limit }),
  });

  const cards = useMemo<ReviewCard[]>(() => {
    if (!queue.data) return [];
    return [...queue.data.due, ...queue.data.newCards];
  }, [queue.data]);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [cardStartedAt, setCardStartedAt] = useState<number>(Date.now());
  const [summary, setSummary] = useState<SessionSummary>({
    totalReviewed: 0,
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    easyCount: 0,
    durationSeconds: 0,
  });

  // reset timers when card changes
  useEffect(() => {
    setRevealed(false);
    setCardStartedAt(Date.now());
  }, [index]);

  const flipAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: revealed ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [revealed, flipAnim]);

  const submit = useApiMutation({
    mutationFn: ({ card, quality }: { card: ReviewCard; quality: number }) =>
      reviewApi.submitAnswer({
        vocabularyId: card.vocabulary.id,
        quality,
        elapsedMs: Date.now() - cardStartedAt,
      }),
  });

  if (queue.isLoading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  if (queue.isError) {
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

  if (cards.length === 0) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text variant="h2" align="center">
            Không có thẻ để ôn
          </Text>
          <Text variant="body" color="muted" align="center">
            Hãy quay lại sau hoặc thêm từ vựng mới.
          </Text>
          <Button
            title="Về trang chủ luyện tập"
            onPress={() => navigation.navigate('DueToday')}
          />
        </View>
      </Screen>
    );
  }

  const current = cards[index];
  const remaining = cards.length - index;

  const handleAnswer = (button: Sm2Button) => {
    const qualityMap: Record<Sm2Button, number> = { AGAIN: 1, HARD: 3, GOOD: 4, EASY: 5 };
    const quality = qualityMap[button];
    const elapsedMs = Date.now() - cardStartedAt;

    // Optimistic summary; the server is contacted in the background.
    setSummary(prev => {
      const fieldKey: Record<Sm2Button, keyof SessionSummary> = {
        AGAIN: 'againCount',
        HARD: 'hardCount',
        GOOD: 'goodCount',
        EASY: 'easyCount',
      };
      return {
        ...prev,
        totalReviewed: prev.totalReviewed + 1,
        [fieldKey[button]]: prev[fieldKey[button]] + 1,
      };
    });

    submit.mutate(
      { card: current, quality },
      {
        onError: () => toast.error('Không ghi được câu trả lời'),
      }
    );

    if (index + 1 >= cards.length) {
      const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
      navigation.replace('ReviewComplete', {
        totalReviewed: summary.totalReviewed + 1,
        againCount: summary.againCount + (button === 'AGAIN' ? 1 : 0),
        hardCount: summary.hardCount + (button === 'HARD' ? 1 : 0),
        goodCount: summary.goodCount + (button === 'GOOD' ? 1 : 0),
        easyCount: summary.easyCount + (button === 'EASY' ? 1 : 0),
        durationSeconds,
      });
      return;
    }
    setIndex(i => i + 1);
  };

  // flip the card visually
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <Screen padded={false}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((index + 1) / cards.length) * 100}%` },
          ]}
        />
      </View>
      <View style={styles.metaRow}>
        <Text variant="smallMedium" color="muted">
          {index + 1} / {cards.length}
        </Text>
        <Text variant="small" color="muted">
          Còn {remaining} thẻ
        </Text>
      </View>

      <Pressable style={styles.cardArea} onPress={() => setRevealed(r => !r)}>
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardFront,
            { transform: [{ rotateY: frontInterpolate }] },
          ]}
        >
          <Text variant="overline" color="muted">
            Từ vựng
          </Text>
          <Text variant="display" align="center">
            {current.vocabulary.word}
          </Text>
          {current.vocabulary.phonetic ? (
            <Text variant="body" color="secondary" align="center">
              {current.vocabulary.phonetic}
            </Text>
          ) : null}
          {current.vocabulary.partOfSpeech ? (
            <Text variant="caption" color="muted" align="center">
              {current.vocabulary.partOfSpeech}
            </Text>
          ) : null}
          <Text variant="small" color="muted" align="center" style={styles.hint}>
            Chạm để xem đáp án
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.cardFace,
            styles.cardBack,
            { transform: [{ rotateY: backInterpolate }] },
          ]}
        >
          <Text variant="overline" color="muted">
            Nghĩa
          </Text>
          {current.vocabulary.meaningVi ? (
            <Text variant="h2" align="center">
              {current.vocabulary.meaningVi}
            </Text>
          ) : (
            <Text variant="h2" color="muted" align="center">
              Chưa có nghĩa tiếng Việt
            </Text>
          )}
          {current.vocabulary.meaningEn ? (
            <Text variant="body" color="secondary" align="center">
              {current.vocabulary.meaningEn}
            </Text>
          ) : null}
          {current.vocabulary.examples.length > 0 ? (
            <View style={styles.examplesBlock}>
              {current.vocabulary.examples.slice(0, 2).map((ex, i) => (
                <View key={i} style={styles.example}>
                  <Text variant="smallMedium">{ex.en}</Text>
                  <Text variant="small" color="muted">
                    {ex.vi}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </Animated.View>
      </Pressable>

      {revealed ? (
        <View style={styles.gradeRow}>
          {QUALITY_BUTTONS.map(b => (
            <Pressable
              key={b.key}
              onPress={() => handleAnswer(b.key)}
              style={[styles.gradeButton, { backgroundColor: b.color }]}
            >
              <Text variant="smallMedium" color="inverse">
                {b.label}
              </Text>
              <Text variant="caption" color="inverse" style={styles.shortcut}>
                {b.shortcut}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.gradeRow}>
          <Button title="Hiện đáp án" onPress={() => setRevealed(true)} fullWidth size="lg" />
        </View>
      )}

      <View style={styles.footer}>
        <Text variant="caption" color="muted" align="center">
          {REVIEW_RESULT_LABELS.AGAIN} · {REVIEW_RESULT_LABELS.HARD} ·{' '}
          {REVIEW_RESULT_LABELS.GOOD} · {REVIEW_RESULT_LABELS.EASY}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
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
  cardArea: {
    flex: 1,
    margin: theme.spacing.base,
    justifyContent: 'center',
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    backfaceVisibility: 'hidden',
    ...theme.shadow.md,
  },
  cardFront: { gap: theme.spacing.sm },
  cardBack: { gap: theme.spacing.sm },
  hint: { marginTop: theme.spacing.xl },
  examplesBlock: { gap: theme.spacing.md, marginTop: theme.spacing.base, alignItems: 'center' },
  example: { alignItems: 'center' },
  gradeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.md,
  },
  gradeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xxs,
  },
  shortcut: { opacity: 0.8 },
  footer: { padding: theme.spacing.base },
});
