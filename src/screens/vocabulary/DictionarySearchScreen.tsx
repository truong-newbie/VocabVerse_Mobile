import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, EmptyState, ErrorState, Screen, Text } from '@/components/ui';
import { Chip, SearchBar } from '@/components/common';
import { useApiMutation, useApiQuery, useDebounce, useToast } from '@/hooks';
import { aiApi, collectionApi, dictionaryApi, vocabularyApi } from '@/api';
import type { DictionaryWordResponse } from '@/api/dictionary.api';
import { queryKeys } from '@/lib';
import { theme } from '@/theme';
import type { CollectionStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<CollectionStackParamList, 'DictionarySearch'>;
type Nav = NativeStackNavigationProp<CollectionStackParamList>;

export function DictionarySearchScreen({ route }: Props) {
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const collectionId = route.params?.collectionId;

  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<DictionaryWordResponse | null>(null);
  const debounced = useDebounce(search.trim().toLowerCase(), 350);

  const lookup = useApiQuery({
    key: ['dictionary', debounced],
    queryFn: () => dictionaryApi.search(debounced),
    enabled: debounced.length >= 2,
    retry: false,
  });

  useEffect(() => {
    if (lookup.data && debounced) setPreview(lookup.data);
  }, [lookup.data, debounced]);

  const normalize = useApiMutation({
    mutationFn: (word: DictionaryWordResponse) =>
      aiApi.normalize({ rawText: word.word }),
    onSuccess: data => {
      if (!preview) return;
      const r = data.result;
      setPreview({
        ...preview,
        phonetic: r.phonetic ?? preview.phonetic ?? null,
        partOfSpeech: r.partOfSpeech ?? preview.partOfSpeech ?? null,
        meaningVi: r.meaningVi ?? preview.meaningVi ?? null,
        meaningEn: r.meaningEn ?? preview.meaningEn ?? null,
        synonyms: r.synonyms ?? preview.synonyms ?? [],
        antonyms: r.antonyms ?? preview.antonyms ?? [],
        examples: r.examples ?? preview.examples ?? [],
      });
      toast.success('Đã bổ sung bằng AI');
    },
  });

  const importWord = useApiMutation({
    mutationFn: async (word: DictionaryWordResponse) => {
      const created = await vocabularyApi.create({
        word: word.word,
        phonetic: word.phonetic ?? undefined,
        partOfSpeech: word.partOfSpeech ?? undefined,
        meaningVi: word.meaningVi ?? undefined,
        meaningEn: word.meaningEn ?? undefined,
        synonyms: word.synonyms,
        antonyms: word.antonyms,
        examples: word.examples,
      });
      if (collectionId) {
        await collectionApi.addVocabulary(collectionId, created.id);
      }
      return created;
    },
    toastSuccess: collectionId ? 'Đã nhập vào bộ sưu tập' : 'Đã lưu từ vựng',
    invalidate: collectionId ? queryKeys.vocabularies(collectionId) : undefined,
  });

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <SearchBar
          value={search}
          onChangeText={text => {
            setSearch(text);
            if (text.trim() === '') setPreview(null);
          }}
          placeholder="Tra từ điển (Anh)"
          onSubmit={() => {
            if (search.trim().length >= 2) lookup.refetch();
          }}
          autoFocus
        />
        {lookup.isFetching ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.spinner} />
        ) : null}
      </View>

      {lookup.isError ? (
        <View style={styles.center}>
          <ErrorState
            title="Không tìm thấy từ"
            message="Thử lại với từ khác, hoặc dùng AI Normalize."
            onRetry={lookup.refetch}
          />
        </View>
      ) : preview ? (
        <FlatList
          data={preview.examples ?? []}
          keyExtractor={(_, i) => `ex-${i}`}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <View style={styles.previewHeader}>
                <Text variant="display">{preview.word}</Text>
                {preview.phonetic ? (
                  <Text variant="body" color="secondary">
                    {preview.phonetic}
                  </Text>
                ) : null}
                <View style={styles.chipsRow}>
                  {preview.partOfSpeech ? (
                    <Chip label={preview.partOfSpeech} variant="outline" />
                  ) : null}
                </View>
                {preview.meaningVi ? (
                  <View style={styles.gap}>
                    <Text variant="overline" color="muted">
                      Nghĩa tiếng Việt
                    </Text>
                    <Text variant="bodyMedium">{preview.meaningVi}</Text>
                  </View>
                ) : null}
                {preview.meaningEn ? (
                  <View style={styles.gap}>
                    <Text variant="overline" color="muted">
                      English meaning
                    </Text>
                    <Text variant="bodyMedium">{preview.meaningEn}</Text>
                  </View>
                ) : null}
                {preview.synonyms.length > 0 ? (
                  <View style={styles.gap}>
                    <Text variant="overline" color="muted">
                      Đồng nghĩa
                    </Text>
                    <Text variant="bodyMedium">{preview.synonyms.join(', ')}</Text>
                  </View>
                ) : null}
                {preview.antonyms.length > 0 ? (
                  <View style={styles.gap}>
                    <Text variant="overline" color="muted">
                      Trái nghĩa
                    </Text>
                    <Text variant="bodyMedium">{preview.antonyms.join(', ')}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.previewActions}>
                <Button
                  title="Bổ sung bằng AI"
                  variant="secondary"
                  onPress={() => normalize.mutate(preview)}
                  isLoading={normalize.isPending}
                />
                <Button
                  title={collectionId ? 'Lưu vào bộ sưu tập' : 'Lưu từ'}
                  onPress={() => importWord.mutate(preview)}
                  isLoading={importWord.isPending}
                />
                <Button
                  title="Đóng"
                  variant="ghost"
                  onPress={() => navigation.goBack()}
                />
              </View>
              <Text variant="overline" color="muted" style={styles.examplesHeader}>
                Ví dụ
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.exampleCard}>
              <Text variant="bodyMedium">{item.en}</Text>
              <Text variant="small" color="secondary">
                {item.vi}
              </Text>
            </Card>
          )}
          ListEmptyComponent={
            <Text variant="small" color="muted" style={styles.empty}>
              Từ điển không trả ví dụ — bấm "Bổ sung bằng AI" để sinh thêm.
            </Text>
          }
        />
      ) : debounced.length === 0 ? (
        <View style={styles.center}>
          <Text variant="body" color="muted" align="center">
            Nhập từ tiếng Anh để tra cứu.
          </Text>
        </View>
      ) : lookup.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <View style={styles.center}>
          <EmptyState title="Chưa có kết quả" message="Bấm Enter để tìm." />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: theme.spacing.base },
  spinner: { position: 'absolute', right: theme.spacing.lg, top: theme.spacing.lg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  listContent: { padding: theme.spacing.base, paddingBottom: theme.spacing.xxxl },
  previewHeader: { gap: theme.spacing.xs },
  chipsRow: { flexDirection: 'row', gap: theme.spacing.sm, marginVertical: theme.spacing.xs },
  previewActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  examplesHeader: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  exampleCard: { padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  empty: { textAlign: 'center', marginTop: theme.spacing.lg },
  gap: { gap: theme.spacing.xxs },
});
