import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, Screen, Text } from '@/components/ui';
import { Chip } from '@/components/common';
import { useApiMutation, useToast } from '@/hooks';
import { typingApi } from '@/api';
import { theme } from '@/theme';
import { TypingSessionSource } from '@/types/enums';
import type { PracticeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'TypingStart'>;
type Nav = NativeStackNavigationProp<PracticeStackParamList, 'TypingStart'>;

const SOURCES: { key: typeof TypingSessionSource[keyof typeof TypingSessionSource]; label: string }[] = [
  { key: 'COLLECTION', label: 'Bộ sưu tập' },
  { key: 'REVIEW', label: 'Ôn tập' },
  { key: 'MIXED', label: 'Hỗn hợp' },
];

export function TypingStartScreen({ route }: Props) {
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const collectionId = route.params?.collectionId;
  const [promptCount, setPromptCount] = useState(10);
  const [source, setSource] = useState<typeof SOURCES[number]['key']>(
    collectionId ? 'COLLECTION' : 'REVIEW'
  );

  const start = useApiMutation({
    mutationFn: () =>
      typingApi.createSession({
        collectionId,
        source,
        promptCount,
      }),
    onSuccess: session => {
      navigation.replace('TypingSession', {
        sessionId: session.id,
        prompts: session.prompts,
      } as any);
    },
  });

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBlock}>
          <Text variant="h1">Luyện gõ</Text>
          <Text variant="body" color="secondary">
            Nghe và gõ lại từ. Độ giống được chấm bằng khoảng cách chỉnh sửa.
          </Text>
        </View>

        <Card style={styles.optionCard}>
          <Text variant="overline" color="muted">
            Số từ
          </Text>
          <View style={styles.countRow}>
            <Button
              title="-5"
              variant="secondary"
              size="sm"
              onPress={() => setPromptCount(c => Math.max(5, c - 5))}
            />
            <Text variant="h2">{promptCount}</Text>
            <Button
              title="+5"
              variant="secondary"
              size="sm"
              onPress={() => setPromptCount(c => Math.min(50, c + 5))}
            />
          </View>
        </Card>

        <Card style={styles.optionCard}>
          <Text variant="overline" color="muted">
            Nguồn từ
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
              onError: () => toast.error('Không tạo được phiên gõ'),
            });
          }}
          isLoading={start.isPending}
          disabled={start.isPending}
          fullWidth
        />
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
});
