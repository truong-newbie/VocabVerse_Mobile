import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, Input, LoadingScreen, Screen, Text } from '@/components/ui';
import { Icon, IconButton, SectionHeader } from '@/components/common';
import { useApiMutation, useApiQuery, useToast } from '@/hooks';
import { aiApi, vocabularyApi } from '@/api';
import { formResolver, queryKeys, z } from '@/lib';
import { theme } from '@/theme';
import type { CollectionStackParamList } from '@/navigation/types';
import type { VocabularyExample, VocabularyResponse } from '@/types';

type Props = NativeStackScreenProps<CollectionStackParamList, 'VocabularyEdit'>;
type Nav = NativeStackNavigationProp<CollectionStackParamList, 'VocabularyEdit'>;

const exampleSchema = z.object({
  en: z.string().min(1, 'Câu tiếng Anh không được trống'),
  vi: z.string().min(1, 'Câu tiếng Việt không được trống'),
});

const schema = z.object({
  word: z.string().min(1, 'Vui lòng nhập từ'),
  phonetic: z.string().optional(),
  partOfSpeech: z.string().optional(),
  meaningVi: z.string().optional(),
  meaningEn: z.string().optional(),
  synonymsCsv: z.string().optional(),
  antonymsCsv: z.string().optional(),
  examples: z.array(exampleSchema).optional(),
});

type FormData = z.infer<typeof schema>;

function splitCsv(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function joinCsv(items: string[] | undefined): string {
  return (items ?? []).join(', ');
}

function fromVocabulary(v: VocabularyResponse): FormData {
  return {
    word: v.word,
    phonetic: v.phonetic ?? '',
    partOfSpeech: v.partOfSpeech ?? '',
    meaningVi: v.meaningVi ?? '',
    meaningEn: v.meaningEn ?? '',
    synonymsCsv: joinCsv(v.synonyms),
    antonymsCsv: joinCsv(v.antonyms),
    examples:
      v.examples && v.examples.length > 0
        ? v.examples.map(e => ({ en: e.en, vi: e.vi }))
        : [{ en: '', vi: '' }],
  };
}

function fromWord(rawText: string, partOfSpeech?: string): FormData {
  return {
    word: rawText,
    phonetic: '',
    partOfSpeech: partOfSpeech ?? '',
    meaningVi: '',
    meaningEn: '',
    synonymsCsv: '',
    antonymsCsv: '',
    examples: [{ en: '', vi: '' }],
  };
}

export function VocabularyEditScreen({ route }: Props) {
  const { vocabularyId, collectionId } = route.params;
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const isEdit = Boolean(vocabularyId);

  const detail = useApiQuery({
    key: queryKeys.vocabulary(vocabularyId ?? ''),
    queryFn: () => vocabularyApi.getDetail(vocabularyId!),
    enabled: isEdit,
  });

  const [initial, setInitial] = useState<FormData | null>(null);

  useEffect(() => {
    if (isEdit && detail.data && !initial) {
      setInitial(fromVocabulary(detail.data));
    } else if (!isEdit && !initial) {
      setInitial(fromWord('', ''));
    }
  }, [isEdit, detail.data, initial]);

  const { control, handleSubmit, reset, getValues, setValue, formState } = useForm<FormData>({
    resolver: formResolver(schema),
    defaultValues: initial ?? undefined,
  });

  useEffect(() => {
    if (initial) reset(initial);
  }, [initial, reset]);

  const { fields, append, remove: removeExample } = useFieldArray({
    control,
    name: 'examples',
  });

  const save = useApiMutation({
    mutationFn: (values: FormData) => {
      const payload = {
        word: values.word,
        phonetic: values.phonetic || undefined,
        partOfSpeech: values.partOfSpeech || undefined,
        meaningVi: values.meaningVi || undefined,
        meaningEn: values.meaningEn || undefined,
        synonyms: splitCsv(values.synonymsCsv),
        antonyms: splitCsv(values.antonymsCsv),
        examples: (values.examples ?? []).filter(
          e => e.en.trim() && e.vi.trim()
        ),
      };
      if (isEdit) {
        return vocabularyApi.update(vocabularyId!, payload);
      }
      return vocabularyApi.create(payload);
    },
    toastSuccess: isEdit ? 'Đã cập nhật từ vựng' : 'Đã tạo từ vựng',
    invalidate: [
      queryKeys.vocabulary(vocabularyId ?? ''),
      ...(collectionId ? [queryKeys.vocabularies(collectionId)] : []),
    ],
    onSuccess: () => navigation.goBack(),
  });

  const normalize = useApiMutation({
    mutationFn: () => {
      const current = getValues();
      return aiApi.normalize({
        rawText: current.word,
        partOfSpeech: current.partOfSpeech,
      });
    },
    toastSuccess: 'Đã chuẩn hoá với AI',
    onSuccess: data => {
      const r = data.result;
      if (r.phonetic) setValue('phonetic', r.phonetic, { shouldDirty: true });
      if (r.partOfSpeech)
        setValue('partOfSpeech', r.partOfSpeech, { shouldDirty: true });
      if (r.meaningVi) setValue('meaningVi', r.meaningVi, { shouldDirty: true });
      if (r.meaningEn) setValue('meaningEn', r.meaningEn, { shouldDirty: true });
      if (r.synonyms) setValue('synonymsCsv', r.synonyms.join(', '), { shouldDirty: true });
      if (r.antonyms) setValue('antonymsCsv', r.antonyms.join(', '), { shouldDirty: true });
      if (r.examples && r.examples.length > 0)
        setValue('examples', r.examples, { shouldDirty: true });
    },
  });

  const onSubmit = handleSubmit(values => {
    save.mutate(values, {
      onError: () => toast.error('Không thể lưu từ vựng'),
    });
  });

  if (isEdit && detail.isLoading) {
    return <LoadingScreen />;
  }

  if (isEdit && (detail.isError || !detail.data)) {
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

  if (!initial) {
    return <LoadingScreen />;
  }

  return (
    <Screen scroll>
      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => {
            const word = getValues('word');
            if (!word || !word.trim()) {
              toast.error('Vui lòng nhập từ trước khi chuẩn hoá');
              return;
            }
            normalize.mutate(undefined, {
              onError: () => toast.error('AI normalize thất bại'),
            });
          }}
          style={styles.aiButton}
        >
          <Icon name="sparkle" color={theme.colors.primary} />
          <Text variant="smallMedium" color="primary">
            Chuẩn hoá với AI
          </Text>
        </Pressable>
        {normalize.isPending ? (
          <Text variant="caption" color="muted">
            Đang gọi AI...
          </Text>
        ) : null}
      </View>

      <Controller
        control={control}
        name="word"
        render={({ field, fieldState }) => (
          <Input
            label="Từ vựng"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="hello"
            autoCapitalize="none"
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phonetic"
        render={({ field }) => (
          <Input
            label="Phiên âm"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            placeholder="/həˈloʊ/"
            style={styles.phonetic}
          />
        )}
      />
      <Controller
        control={control}
        name="partOfSpeech"
        render={({ field }) => (
          <Input
            label="Loại từ"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            placeholder="noun / verb / adj"
            autoCapitalize="none"
            style={styles.phonetic}
          />
        )}
      />
      <Controller
        control={control}
        name="meaningVi"
        render={({ field }) => (
          <Input
            label="Nghĩa tiếng Việt"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            placeholder="xin chào"
          />
        )}
      />
      <Controller
        control={control}
        name="meaningEn"
        render={({ field }) => (
          <Input
            label="English meaning"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            placeholder="a greeting"
          />
        )}
      />
      <Controller
        control={control}
        name="synonymsCsv"
        render={({ field }) => (
          <Input
            label="Đồng nghĩa (phân tách bằng dấu phẩy)"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            placeholder="hi, hey"
            autoCapitalize="none"
          />
        )}
      />
      <Controller
        control={control}
        name="antonymsCsv"
        render={({ field }) => (
          <Input
            label="Trái nghĩa (phân tách bằng dấu phẩy)"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            placeholder="bye, farewell"
            autoCapitalize="none"
          />
        )}
      />

      <SectionHeader
        title="Ví dụ"
        action={
          <IconButton
            name="plus"
            onPress={() => append({ en: '', vi: '' })}
            size="sm"
          />
        }
      />
      {fields.map((f, i) => (
        <Card key={f.id} style={styles.exampleCard}>
          <Controller
            control={control}
            name={`examples.${i}.en`}
            render={({ field, fieldState }) => (
              <Input
                label="EN"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Hello, world!"
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name={`examples.${i}.vi`}
            render={({ field, fieldState }) => (
              <Input
                label="VI"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Xin chào thế giới!"
                error={fieldState.error?.message}
              />
            )}
          />
          {fields.length > 1 ? (
            <Button
              title="Xoá ví dụ"
              variant="ghost"
              onPress={() => removeExample(i)}
            />
          ) : null}
        </Card>
      ))}

      {save.isError ? (
        <Text variant="small" color="danger">
          {save.error?.message ?? 'Lỗi không xác định'}
        </Text>
      ) : null}

      <View style={styles.bottomActions}>
        <Button
          title={isEdit ? 'Lưu thay đổi' : 'Tạo từ'}
          onPress={onSubmit}
          isLoading={formState.isSubmitting || save.isPending}
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
  },
  phonetic: { fontSize: 14 },
  exampleCard: { padding: theme.spacing.base, gap: theme.spacing.sm },
  bottomActions: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl },
});
