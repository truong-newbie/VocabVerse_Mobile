import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Input, LoadingScreen, Screen, Text } from '@/components/ui';
import { Icon, IconButton, SectionHeader } from '@/components/common';
import { useApiMutation, useApiQuery, useToast } from '@/hooks';
import { aiApi, collectionApi, vocabularyApi } from '@/api';
import { formResolver, queryKeys, z } from '@/lib';
import { theme } from '@/theme';
import type { CollectionStackParamList } from '@/navigation/types';
import type { VocabularyExample, VocabularyResponse } from '@/types';

type Props = NativeStackScreenProps<CollectionStackParamList, 'AddVocabulary'>;
type Nav = NativeStackNavigationProp<CollectionStackParamList, 'AddVocabulary'>;

const exampleSchema = z.object({
  en: z.string().min(1, 'Câu EN không được trống'),
  vi: z.string().min(1, 'Câu VI không được trống'),
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

const EMPTY: FormData = {
  word: '',
  phonetic: '',
  partOfSpeech: '',
  meaningVi: '',
  meaningEn: '',
  synonymsCsv: '',
  antonymsCsv: '',
  examples: [{ en: '', vi: '' }],
};

export function AddVocabularyScreen({ route }: Props) {
  const { collectionId } = route.params;
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const [normalizing, setNormalizing] = useState(false);

  // cache vocabularies list to get the freshly-created vocabularyId
  const invalidateKey = queryKeys.vocabularies(collectionId);

  const collection = useApiQuery({
    key: queryKeys.collection(collectionId),
    queryFn: () => collectionApi.getDetail(collectionId),
  });

  const { control, handleSubmit, reset, getValues, setValue } = useForm<FormData>({
    resolver: formResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    reset(EMPTY);
  }, [collectionId, reset]);

  const { fields, append, remove: removeExample } = useFieldArray({
    control,
    name: 'examples',
  });

  const createAndAdd = useApiMutation({
    mutationFn: async (values: FormData) => {
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
      const created: VocabularyResponse = await vocabularyApi.create(payload);
      try {
        await collectionApi.addVocabulary(collectionId, created.id);
      } catch {
        // ignore: backend may have already attached, or the user
        // just wants to save the word for later organization.
      }
      return created;
    },
    toastSuccess: 'Đã thêm từ vào bộ sưu tập',
    invalidate: invalidateKey,
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
    onMutate: () => setNormalizing(true),
    onSettled: () => setNormalizing(false),
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
      toast.success('Đã chuẩn hoá với AI');
    },
  });

  const onSubmit = handleSubmit(values => {
    if (!values.word.trim()) {
      toast.error('Vui lòng nhập từ');
      return;
    }
    createAndAdd.mutate(values, {
      onError: () => toast.error('Không thể thêm từ'),
    });
  });

  if (collection.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Screen scroll>
      <View style={styles.headerRow}>
        <Text variant="h1">Thêm từ vựng</Text>
        <Text variant="caption" color="muted">
          {collection.data?.title ?? 'Bộ sưu tập'}
        </Text>
      </View>

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
        {normalizing ? (
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
          />
        )}
      />
      <Controller
        control={control}
        name="meaningVi"
        render={({ field }) => (
          <Input label="Nghĩa tiếng Việt" value={field.value ?? ''} onChangeText={field.onChange} />
        )}
      />
      <Controller
        control={control}
        name="meaningEn"
        render={({ field }) => (
          <Input label="English meaning" value={field.value ?? ''} onChangeText={field.onChange} />
        )}
      />
      <Controller
        control={control}
        name="synonymsCsv"
        render={({ field }) => (
          <Input
            label="Đồng nghĩa"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            autoCapitalize="none"
          />
        )}
      />
      <Controller
        control={control}
        name="antonymsCsv"
        render={({ field }) => (
          <Input
            label="Trái nghĩa"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            autoCapitalize="none"
          />
        )}
      />

      <SectionHeader
        title="Ví dụ"
        action={
          <IconButton name="plus" onPress={() => append({ en: '', vi: '' })} size="sm" />
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
                error={fieldState.error?.message}
              />
            )}
          />
          {fields.length > 1 ? (
            <Button title="Xoá ví dụ" variant="ghost" onPress={() => removeExample(i)} />
          ) : null}
        </Card>
      ))}

      {createAndAdd.isError ? (
        <Text variant="small" color="danger">
          {createAndAdd.error?.message ?? 'Lỗi không xác định'}
        </Text>
      ) : null}

      <View style={styles.bottomActions}>
        <Button title="Thêm" onPress={onSubmit} isLoading={createAndAdd.isPending} fullWidth />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { gap: theme.spacing.xxs, marginTop: theme.spacing.md },
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
  exampleCard: { padding: theme.spacing.base, gap: theme.spacing.sm },
  bottomActions: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl },
});
