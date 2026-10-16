import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, EmptyState, ErrorState, Screen, Text } from '@/components/ui';
import { Chip, SearchBar, SectionHeader } from '@/components/common';
import { useApiMutation, useDebounce, useInfinitePagination, useToast } from '@/hooks';
import { vocabularyApi } from '@/api';
import { queryKeys } from '@/lib';
import { theme } from '@/theme';
import type { CollectionStackParamList } from '@/navigation/types';
import type { PageResponse, VocabularyResponse, VocabularySource } from '@/types';
import { VOCABULARY_SOURCE_LABELS } from '@/types/enums';

type Props = NativeStackScreenProps<CollectionStackParamList, 'VocabularyList'>;
type Nav = NativeStackNavigationProp<CollectionStackParamList, 'VocabularyList'>;

const SOURCE_FILTERS: ('ALL' | VocabularySource)[] = [
  'ALL',
  'MANUAL',
  'DICTIONARY_API',
  'AI_NORMALIZED',
  'IMPORT',
];

function VocabularyRow({
  item,
  onPress,
  onDelete,
  deleting,
}: {
  item: VocabularyResponse;
  onPress: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowBody}>
        <Text variant="bodyMedium">{item.word}</Text>
        {item.phonetic ? (
          <Text variant="caption" color="muted">
            {item.phonetic}
          </Text>
        ) : null}
        {item.meaningVi ? (
          <Text variant="small" color="secondary" numberOfLines={2}>
            {item.meaningVi}
          </Text>
        ) : null}
        <View style={styles.rowMeta}>
          <Chip
            label={VOCABULARY_SOURCE_LABELS[item.source]}
            color={item.source === 'AI_NORMALIZED' ? 'primary' : 'neutral'}
            variant="outline"
          />
        </View>
      </View>
      <Button
        title="Xoá"
        variant="ghost"
        size="sm"
        onPress={onDelete}
        isLoading={deleting}
      />
    </Pressable>
  );
}

export function VocabularyListScreen({ route }: Props) {
  const { collectionId } = route.params;
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [sourceFilter, setSourceFilter] = useState<'ALL' | VocabularySource>('ALL');

  const queryKey = useMemo(
    () => queryKeys.vocabularies(collectionId, { q: debouncedSearch, source: sourceFilter }),
    [collectionId, debouncedSearch, sourceFilter]
  );

  const {
    items,
    isLoading,
    isError,
    error,
    hasMore,
    fetchMore,
    isFetching,
    refetch,
  } = useInfinitePagination<VocabularyResponse>({
    queryKey,
    fetchPage: page =>
      vocabularyApi.getCollectionVocabularies(
        collectionId,
        page,
        20
      ) as unknown as Promise<PageResponse<VocabularyResponse>>,
  });

  const remove = useApiMutation({
    mutationFn: (id: string) => vocabularyApi.removeFromCollection(collectionId, id),
    toastSuccess: 'Đã xoá từ khỏi bộ sưu tập',
    invalidate: queryKeys.vocabularies(collectionId),
  });

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm từ vựng..."
        />
        <View style={styles.filtersRow}>
          {SOURCE_FILTERS.map(s => (
            <Chip
              key={s}
              label={s === 'ALL' ? 'Tất cả' : VOCABULARY_SOURCE_LABELS[s]}
              selected={sourceFilter === s}
              onPress={() => setSourceFilter(s)}
            />
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <ErrorState
          title="Không tải được từ vựng"
          message={error?.message}
          onRetry={refetch}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Chưa có từ nào"
          message="Thêm từ thủ công hoặc tìm trong từ điển."
          actionLabel="Thêm từ"
          onAction={() => navigation.navigate('AddVocabulary', { collectionId })}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <VocabularyRow
              item={item}
              onPress={() =>
                navigation.navigate('VocabularyDetail', {
                  vocabularyId: item.id,
                  collectionId,
                })
              }
              onDelete={() =>
                remove.mutate(item.id, {
                  onError: () => toast.error('Không thể xoá từ'),
                })
              }
              deleting={remove.isPending && remove.variables === item.id}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.footer}>
                <Button
                  title="Tải thêm"
                  variant="ghost"
                  onPress={fetchMore}
                  isLoading={isFetching}
                />
              </View>
            ) : null
          }
          onRefresh={refetch}
          refreshing={isFetching && !isLoading}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: theme.spacing.base, gap: theme.spacing.md },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: theme.spacing.base, paddingBottom: theme.spacing.xxxl },
  row: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgElevated,
    padding: theme.spacing.base,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  rowBody: { flex: 1, gap: theme.spacing.xxs },
  rowMeta: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  sep: { height: theme.spacing.sm },
  footer: { padding: theme.spacing.md, alignItems: 'center' },
});
