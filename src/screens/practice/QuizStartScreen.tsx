import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, Input, Screen, Text } from '@/components/ui';
import { Chip } from '@/components/common';
import { useApiMutation, useToast } from '@/hooks';
import { quizApi } from '@/api';
import { theme } from '@/theme';
import { QuizSessionSource } from '@/types/enums';
import type { PracticeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'QuizStart'>;
type Nav = NativeStackNavigationProp<PracticeStackParamList, 'QuizStart'>;

const SOURCES: { key: typeof QuizSessionSource[keyof typeof QuizSessionSource]; label: string }[] = [
  { key: 'COLLECTION', label: 'Bộ sưu tập' },
  { key: 'REVIEW', label: 'Ôn tập' },
  { key: 'MIXED', label: 'Hỗn hợp' },
];

export function QuizStartScreen({ route }: Props) {
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const collectionId = route.params?.collectionId;
  const [questionCount, setQuestionCount] = useState(10);
  const [source, setSource] = useState<typeof SOURCES[number]['key']>(
    collectionId ? 'COLLECTION' : 'REVIEW'
  );

  const start = useApiMutation({
    mutationFn: () =>
      quizApi.createSession({
        collectionId,
        source,
        questionCount,
      }),
    onSuccess: session => {
      navigation.replace('QuizSession', {
        sessionId: session.id,
        // carry the questions through the params to avoid a second
        // round trip for the play screen
        questions: session.questions,
      } as any);
    },
  });

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBlock}>
          <Text variant="h1">Quiz</Text>
          <Text variant="body" color="secondary">
            Chọn đáp án đúng cho mỗi từ. Tốc độ không quan trọng — chính xác mới là điểm số.
          </Text>
        </View>

        <Card style={styles.optionCard}>
          <Text variant="overline" color="muted">
            Số câu
          </Text>
          <View style={styles.countRow}>
            <Button
              title="-5"
              variant="secondary"
              size="sm"
              onPress={() => setQuestionCount(c => Math.max(5, c - 5))}
            />
            <Text variant="h2">{questionCount}</Text>
            <Button
              title="+5"
              variant="secondary"
              size="sm"
              onPress={() => setQuestionCount(c => Math.min(50, c + 5))}
            />
          </View>
        </Card>

        <Card style={styles.optionCard}>
          <Text variant="overline" color="muted">
            Nguồn câu hỏi
          </Text>
          <View style={styles.chipsRow}>
            {SOURCES.map(s => (
              <Chip
                key={s.key}
                label={s.label}
                selected={source === s.key}
                onPress={() => setSource(s.key)}
              />
            ))}
          </View>
        </Card>

        {start.isError ? (
          <ErrorState
            title="Không tạo được phiên"
            message={start.error?.message}
            onRetry={() => start.mutate()}
          />
        ) : null}

        <Button
          title="Bắt đầu"
          onPress={() => {
            start.mutate(undefined, {
              onError: () => toast.error('Không tạo được phiên quiz'),
            });
          }}
          isLoading={start.isPending}
          disabled={start.isPending}
          fullWidth
        />
        {start.isPending ? (
          <View style={styles.spinner}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md },
  heroBlock: { gap: theme.spacing.xs, marginTop: theme.spacing.md },
  optionCard: { padding: theme.spacing.base, gap: theme.spacing.sm },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipsRow: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  spinner: { padding: theme.spacing.md, alignItems: 'center' },
});
