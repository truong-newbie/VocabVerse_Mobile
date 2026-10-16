import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, Screen, Text } from '@/components/ui';
import { Chip, IconButton, SectionHeader } from '@/components/common';
import { useApiQuery, useToast } from '@/hooks';
import { collectionApi, vocabularyApi } from '@/api';
import { COLLECTION_VISIBILITY_LABELS } from '@/types/enums';
import { formatDate, queryKeys } from '@/lib';
import { theme } from '@/theme';
import type { CollectionStackParamList } from '@/navigation/types';
import type { PageResponse, VocabularyResponse } from '@/types';

type Nav = NativeStackNavigationProp<CollectionStackParamList, 'CollectionDetail'>;

type Props = NativeStackScreenProps<CollectionStackParamList, 'CollectionDetail'>;

export function CollectionDetailScreen({ route }: Props) {
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const { collectionId } = route.params;

  const detail = useApiQuery({
    key: queryKeys.collection(collectionId),
    queryFn: () => collectionApi.getDetail(collectionId),
  });

  const reviewSettings = useApiQuery({
    key: queryKeys.reviewSettings(collectionId),
    queryFn: () => collectionApi.getReviewSettings(collectionId),
    retry: false,
  });

  const vocabPreview = useApiQuery({
    key: queryKeys.vocabularies(collectionId, { preview: true }),
    queryFn: () =>
      vocabularyApi.getCollectionVocabularies(collectionId, 0, 5) as unknown as Promise<PageResponse<VocabularyResponse>>,
  });

  const onRefresh = useCallback(() => {
    detail.refetch();
    reviewSettings.refetch();
    vocabPreview.refetch();
  }, [detail, reviewSettings, vocabPreview]);

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
          title="Không tải được bộ sưu tập"
          message={detail.error?.message}
          onRetry={detail.refetch}
        />
      </Screen>
    );
  }

  const collection = detail.data;
  const settings = reviewSettings.data;
  const words = vocabPreview.data?.items ?? [];

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshing={detail.isFetching}
        onScrollEndDrag={onRefresh}
      >
        <View style={styles.titleBlock}>
          <Text variant="h1">{collection.title}</Text>
          {collection.description ? (
            <Text variant="body" color="secondary">
              {collection.description}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            <Chip
              label={COLLECTION_VISIBILITY_LABELS[collection.visibility]}
              color={collection.visibility === 'PUBLIC' ? 'primary' : 'neutral'}
              variant="outline"
            />
            <Text variant="caption" color="muted">
              Cập nhật {formatDate(collection.updatedAt)}
            </Text>
          </View>
        </View>

        <Card style={styles.summary}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <Text variant="overline" color="muted">
                Tổng từ
              </Text>
              <Text variant="h2">{collection.totalWords}</Text>
            </View>
            <View style={styles.summaryCol}>
              <Text variant="overline" color="muted">
                Nổi bật
              </Text>
              <Text variant="h2">{collection.featured ? '★' : '—'}</Text>
            </View>
          </View>
        </Card>

        <SectionHeader
          title="Ôn tập"
          description={
            settings?.enabled
              ? `Bật · ${settings.schedulerType}`
              : 'Chưa bật ôn tập'
          }
          action={
            <IconButton
              name="settings"
              onPress={() =>
                navigation.navigate('ReviewSettings', { collectionId })
              }
            />
          }
        />
        <Card
          onPress={() =>
            navigation.navigate('ReviewSettings', { collectionId })
          }
        >
          <Text variant="bodyMedium">
            {settings?.enabled
              ? `Lịch: ${settings.intervals.join(', ')} ngày`
              : 'Bật ôn tập để cài thuật toán (SM-2 / FSRS) và nhận thông báo.'}
          </Text>
        </Card>

        <SectionHeader
          title="Từ vựng"
          description={`Hiển thị ${words.length} / ${collection.totalWords} từ`}
          action={
            <Button
              title="+ Thêm từ"
              onPress={() =>
                navigation.navigate('AddVocabulary', { collectionId })
              }
              size="sm"
            />
          }
        />
        {words.length === 0 ? (
          <Card>
            <Text variant="body" color="secondary">
              Chưa có từ nào. Bấm "Thêm từ" hoặc dùng AI Normalize.
            </Text>
          </Card>
        ) : (
          <View style={styles.wordList}>
            {words.map(w => (
              <Card
                key={w.id}
                onPress={() =>
                  navigation.navigate('VocabularyDetail', {
                    vocabularyId: w.id,
                    collectionId,
                  })
                }
                style={styles.wordCard}
              >
                <Text variant="bodyMedium">{w.word}</Text>
                {w.meaningVi ? (
                  <Text variant="caption" color="muted">
                    {w.meaningVi}
                  </Text>
                ) : null}
              </Card>
            ))}
            {collection.totalWords > words.length ? (
              <Button
                title={`Xem tất cả ${collection.totalWords} từ`}
                variant="secondary"
                onPress={() =>
                  navigation.navigate('VocabularyList', { collectionId })
                }
              />
            ) : null}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { gap: theme.spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flexWrap: 'wrap' },
  summary: { padding: theme.spacing.lg },
  summaryRow: { flexDirection: 'row', gap: theme.spacing.xl },
  summaryCol: { flex: 1, gap: theme.spacing.xxs },
  wordList: { gap: theme.spacing.sm },
  wordCard: { padding: theme.spacing.md },
});
