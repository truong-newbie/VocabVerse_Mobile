import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, LoadingScreen, Screen, Text, TextArea } from '@/components/ui';
import { Chip, SectionHeader } from '@/components/common';
import { useApiMutation, useApiQuery, useToast } from '@/hooks';
import { aiApi, collectionApi, vocabularyApi } from '@/api';
import { formResolver, queryKeys, z } from '@/lib';
import { theme } from '@/theme';
import type { CollectionStackParamList } from '@/navigation/types';
import type { NormalizedVocabulary } from '@/api/ai.api';

type Props = NativeStackScreenProps<CollectionStackParamList, 'AiNormalize'>;

const singleSchema = z.object({
  rawText: z.string().min(1, 'Vui lòng nhập từ'),
  partOfSpeech: z.string().optional(),
});
type SingleForm = z.infer<typeof singleSchema>;

const bulkSchema = z.object({
  rawTexts: z.string().min(1, 'Vui lòng nhập ít nhất 1 từ'),
});
type BulkForm = z.infer<typeof bulkSchema>;

function parseBulk(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

interface PreviewCardProps {
  item: NormalizedVocabulary;
  selected: boolean;
  onToggle: () => void;
}

function PreviewCard({ item, selected, onToggle }: PreviewCardProps) {
  return (
    <Pressable onPress={onToggle}>
      <Card style={[styles.previewCard, selected ? styles.previewCardSelected : null]}>
        <View style={styles.previewHeader}>
          <Text variant="bodyMedium">{item.word}</Text>
          {selected ? <Chip label="Đã chọn" color="success" /> : null}
        </View>
        {item.phonetic ? (
          <Text variant="caption" color="muted">
            {item.phonetic}
          </Text>
        ) : null}
        {item.meaningVi ? (
          <Text variant="small" color="secondary">
            {item.meaningVi}
          </Text>
        ) : null}
        <View style={styles.previewMeta}>
          {item.partOfSpeech ? (
            <Chip label={item.partOfSpeech} variant="outline" />
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

export function AiNormalizeScreen({ route }: Props) {
  const collectionId = route.params?.collectionId;
  const toast = useToast();
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [preview, setPreview] = useState<NormalizedVocabulary[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const quota = useApiQuery({
    key: ['ai-quota'],
    queryFn: () => aiApi.getQuota(),
    retry: false,
  });

  // single form
  const {
    control: singleControl,
    handleSubmit: handleSingleSubmit,
    formState: singleState,
    reset: resetSingle,
  } = useForm<SingleForm>({
    resolver: formResolver(singleSchema),
    defaultValues: { rawText: '', partOfSpeech: '' },
  });

  // bulk form
  const {
    control: bulkControl,
    handleSubmit: handleBulkSubmit,
    formState: bulkState,
    reset: resetBulk,
  } = useForm<BulkForm>({
    resolver: formResolver(bulkSchema),
    defaultValues: { rawTexts: '' },
  });

  const singleMut = useApiMutation({
    mutationFn: (values: SingleForm) => aiApi.normalize(values),
    onSuccess: data => {
      setPreview([data.result]);
      setSelected(new Set([0]));
      if (data.tokensUsed != null) {
        toast.success(`Đã chuẩn hoá · còn ${data.remainingQuota ?? '?'} lượt hôm nay`);
      } else {
        toast.success('Đã chuẩn hoá');
      }
    },
  });

  const bulkMut = useApiMutation({
    mutationFn: (values: BulkForm) =>
      aiApi.normalizeBulk({ rawTexts: parseBulk(values.rawTexts) }),
    onSuccess: data => {
      setPreview(data.items);
      setSelected(new Set(data.items.map((_, i) => i)));
      if (data.tokensUsed != null) {
        toast.success(`Đã chuẩn hoá ${data.items.length} từ`);
      } else {
        toast.success(`Đã chuẩn hoá ${data.items.length} từ`);
      }
    },
  });

  const importSelected = useApiMutation({
    mutationFn: async (items: NormalizedVocabulary[]) => {
      const created = [];
      for (const item of items) {
        const v = await vocabularyApi.create({
          word: item.word,
          phonetic: item.phonetic ?? undefined,
          partOfSpeech: item.partOfSpeech ?? undefined,
          meaningVi: item.meaningVi ?? undefined,
          meaningEn: item.meaningEn ?? undefined,
          synonyms: item.synonyms ?? [],
          antonyms: item.antonyms ?? [],
          examples: item.examples ?? [],
        });
        if (collectionId) {
          try {
            await collectionApi.addVocabulary(collectionId, v.id);
          } catch {
            // ignore: user just wants the vocabulary
          }
        }
        created.push(v);
      }
      return created;
    },
    toastSuccess: collectionId
      ? `Đã thêm ${preview.length} từ vào bộ sưu tập`
      : 'Đã lưu các từ vựng',
    invalidate: collectionId ? queryKeys.vocabularies(collectionId) : undefined,
    onSuccess: () => {
      setPreview([]);
      setSelected(new Set());
      resetSingle();
      resetBulk();
    },
  });

  const onSingle = handleSingleSubmit(values => {
    setPreview([]);
    singleMut.mutate(values, {
      onError: () => toast.error('AI normalize thất bại'),
    });
  });

  const onBulk = handleBulkSubmit(values => {
    setPreview([]);
    bulkMut.mutate(values, {
      onError: () => toast.error('AI normalize bulk thất bại'),
    });
  });

  const onToggle = useCallback((index: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const selectedItems = useMemo(
    () => preview.filter((_, i) => selected.has(i)),
    [preview, selected]
  );

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        {quota.data ? (
          <Card style={styles.quotaCard}>
            <View style={styles.quotaRow}>
              <Text variant="overline" color="muted">
                Lượt AI hôm nay
              </Text>
              <Text variant="h2">
                {quota.data.remaining} / {quota.data.dailyLimit}
              </Text>
            </View>
            {quota.isError ? (
              <Text variant="caption" color="muted">
                Không tải được quota — thử lại sau.
              </Text>
            ) : null}
          </Card>
        ) : quota.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        <View style={styles.chipsRow}>
          <Chip
            label="Một từ"
            selected={mode === 'single'}
            onPress={() => setMode('single')}
          />
          <Chip
            label="Nhiều từ"
            color="primary"
            selected={mode === 'bulk'}
            onPress={() => setMode('bulk')}
          />
        </View>

        {mode === 'single' ? (
          <View>
            <Controller
              control={singleControl}
              name="rawText"
              render={({ field, fieldState }) => (
                <TextArea
                  label="Từ cần chuẩn hoá"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="run"
                  minHeight={48}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={singleControl}
              name="partOfSpeech"
              render={({ field }) => (
                <TextArea
                  label="Loại từ (tuỳ chọn)"
                  value={field.value ?? ''}
                  onChangeText={field.onChange}
                  placeholder="verb / noun"
                  minHeight={40}
                />
              )}
            />
            {singleMut.isError ? (
              <ErrorState
                title="AI normalize thất bại"
                message={singleMut.error?.message}
              />
            ) : null}
            <Button
              title="Chuẩn hoá"
              onPress={onSingle}
              isLoading={singleState.isSubmitting || singleMut.isPending}
              fullWidth
            />
          </View>
        ) : (
          <View>
            <Controller
              control={bulkControl}
              name="rawTexts"
              render={({ field, fieldState }) => (
                <TextArea
                  label="Danh sách từ"
                  helperText="Mỗi từ một dòng, hoặc phân tách bằng dấu phẩy"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder={'run\njump\nread'}
                  minHeight={140}
                  error={fieldState.error?.message}
                />
              )}
            />
            {bulkMut.isError ? (
              <ErrorState
                title="AI normalize bulk thất bại"
                message={bulkMut.error?.message}
              />
            ) : null}
            <Button
              title="Chuẩn hoá hàng loạt"
              onPress={onBulk}
              isLoading={bulkState.isSubmitting || bulkMut.isPending}
              fullWidth
            />
          </View>
        )}

        {preview.length > 0 ? (
          <View>
            <SectionHeader
              title="Kết quả"
              description={`${selectedItems.length} / ${preview.length} đã chọn`}
            />
            {preview.map((item, i) => (
              <PreviewCard
                key={`${item.word}-${i}`}
                item={item}
                selected={selected.has(i)}
                onToggle={() => onToggle(i)}
              />
            ))}
            <View style={styles.actions}>
              <Button
                title={`Lưu ${selectedItems.length} từ`}
                onPress={() => importSelected.mutate(selectedItems)}
                isLoading={importSelected.isPending}
                disabled={selectedItems.length === 0}
                fullWidth
              />
              <Button
                title="Bỏ chọn tất cả"
                variant="ghost"
                onPress={() => setSelected(new Set())}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  center: { padding: theme.spacing.lg, alignItems: 'center' },
  chipsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  quotaCard: { padding: theme.spacing.md },
  quotaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewCard: { padding: theme.spacing.md, marginBottom: theme.spacing.sm, gap: theme.spacing.xxs },
  previewCardSelected: { borderColor: theme.colors.primary, borderWidth: 2 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewMeta: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  actions: { gap: theme.spacing.sm, marginTop: theme.spacing.lg },
});
