import { useCallback } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, Screen, Text } from '@/components/ui';
import { Chip, SectionHeader } from '@/components/common';
import { useApiMutation, useApiQuery, useToast } from '@/hooks';
import { vocabularyApi } from '@/api';
import { formatDate, queryKeys } from '@/lib';
import { theme } from '@/theme';
import type { CollectionStackParamList } from '@/navigation/types';
import { VOCABULARY_SOURCE_LABELS } from '@/types/enums';

type Props = NativeStackScreenProps<CollectionStackParamList, 'VocabularyDetail'>;
type Nav = NativeStackNavigationProp<CollectionStackParamList, 'VocabularyDetail'>;

export function VocabularyDetailScreen({ route, navigation }: Props) {
  const { vocabularyId, collectionId } = route.params;
  const toast = useToast();

  const detail = useApiQuery({
    key: queryKeys.vocabulary(vocabularyId),
    queryFn: () => vocabularyApi.getDetail(vocabularyId),
  });

  const remove = useApiMutation({
    mutationFn: () => vocabularyApi.remove(vocabularyId),
    toastSuccess: 'Đã xoá từ vựng',
    invalidate: [
      queryKeys.vocabulary(vocabularyId),
      ...(collectionId ? [queryKeys.vocabularies(collectionId)] : []),
    ],
  });

  const onDelete = useCallback(() => {
    Alert.alert(
      'Xoá từ vựng?',
      'Hành động này không thể hoàn tác.',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: () =>
            remove.mutate(undefined, {
              onSuccess: () => navigation.goBack(),
              onError: () => toast.error('Không thể xoá từ'),
            }),
        },
      ]
    );
  }, [navigation, remove, toast]);

  if (detail.isLoading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được từ"
          message={detail.error?.message}
          onRetry={detail.refetch}
        />
      </Screen>
    );
  }

  const v = detail.data;
  const hasExamples = v.examples && v.examples.length > 0;

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleBlock}>
          <Text variant="display">{v.word}</Text>
          {v.phonetic ? (
            <Text variant="body" color="secondary">
              {v.phonetic}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            {v.partOfSpeech ? (
              <Chip label={v.partOfSpeech} variant="outline" />
            ) : null}
            <Chip
              label={VOCABULARY_SOURCE_LABELS[v.source]}
              color={v.source === 'AI_NORMALIZED' ? 'primary' : 'neutral'}
              variant="outline"
            />
            <Text variant="caption" color="muted">
              Cập nhật {formatDate(v.updatedAt)}
            </Text>
          </View>
        </View>

        <Card>
          <View style={styles.body}>
            {v.meaningVi ? (
              <View>
                <Text variant="overline" color="muted">
                  Nghĩa tiếng Việt
                </Text>
                <Text variant="bodyMedium">{v.meaningVi}</Text>
              </View>
            ) : null}
            {v.meaningEn ? (
              <View style={styles.gap}>
                <Text variant="overline" color="muted">
                  English meaning
                </Text>
                <Text variant="bodyMedium">{v.meaningEn}</Text>
              </View>
            ) : null}
            {v.synonyms.length > 0 ? (
              <View style={styles.gap}>
                <Text variant="overline" color="muted">
                  Đồng nghĩa
                </Text>
                <Text variant="bodyMedium">{v.synonyms.join(', ')}</Text>
              </View>
            ) : null}
            {v.antonyms.length > 0 ? (
              <View style={styles.gap}>
                <Text variant="overline" color="muted">
                  Trái nghĩa
                </Text>
                <Text variant="bodyMedium">{v.antonyms.join(', ')}</Text>
              </View>
            ) : null}
          </View>
        </Card>

        {hasExamples ? (
          <View>
            <SectionHeader title="Ví dụ" />
            {v.examples.map((ex, i) => (
              <Card key={i} style={styles.exampleCard}>
                <Text variant="bodyMedium">{ex.en}</Text>
                <Text variant="small" color="secondary">
                  {ex.vi}
                </Text>
              </Card>
            ))}
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button
            title="Sửa"
            onPress={() =>
              navigation.navigate('VocabularyEdit', {
                vocabularyId,
                collectionId,
              })
            }
          />
          <Button
            title="Xoá"
            variant="danger"
            onPress={onDelete}
            isLoading={remove.isPending}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { gap: theme.spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flexWrap: 'wrap', marginTop: theme.spacing.xs },
  body: { gap: theme.spacing.sm },
  gap: { gap: theme.spacing.xxs },
  exampleCard: { padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  actions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.md },
});
