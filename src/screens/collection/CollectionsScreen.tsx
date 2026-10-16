import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, EmptyState, ErrorState, Screen, Text } from '@/components/ui';
import { Chip, Icon, IconButton, Modal, SearchBar, TextArea } from '@/components/common';
import { useApiMutation, useApiQuery, useDebounce, useInfinitePagination, useToast } from '@/hooks';
import { collectionApi } from '@/api';
import { COLLECTION_VISIBILITY_LABELS, Visibility } from '@/types/enums';
import { formResolver, formatDate, queryKeys, z } from '@/lib';
import { Controller, useForm } from 'react-hook-form';
import { theme } from '@/theme';
import type { CollectionStackParamList } from '@/navigation/types';
import type { CollectionResponse, PageResponse } from '@/types';

type Nav = NativeStackNavigationProp<CollectionStackParamList, 'Collections'>;

const formSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên bộ sưu tập').max(120),
  description: z.string().max(500).optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC']),
});

type FormData = z.infer<typeof formSchema>;

interface CollectionFormModalProps {
  visible: boolean;
  initial?: CollectionResponse;
  onClose: () => void;
  onSaved: () => void;
}

function CollectionFormModal({
  visible,
  initial,
  onClose,
  onSaved,
}: CollectionFormModalProps) {
  const toast = useToast();
  const isEdit = Boolean(initial);

  const { control, handleSubmit, reset, formState } = useForm<FormData>({
    resolver: formResolver(formSchema),
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      visibility:
        initial?.visibility === 'PUBLIC' ? Visibility.PUBLIC : Visibility.PRIVATE,
    },
  });

  const save = useApiMutation({
    mutationFn: (vars: FormData) =>
      isEdit && initial
        ? collectionApi.update(initial.id, vars)
        : collectionApi.create(vars),
    toastSuccess: isEdit ? 'Đã cập nhật bộ sưu tập' : 'Đã tạo bộ sưu tập',
    onSuccess: () => {
      onSaved();
      onClose();
    },
  });

  const onSubmit = handleSubmit(values => {
    save.mutate(values);
  });

  // reset when modal opens
  if (visible && initial) {
    // ensure form reflects current values when editing different item
    const newTitle = initial.title;
    const currentTitle = control._formValues.title;
    if (currentTitle !== newTitle) {
      reset({
        title: newTitle,
        description: initial.description ?? '',
        visibility:
          initial.visibility === 'PUBLIC' ? Visibility.PUBLIC : Visibility.PRIVATE,
      });
    }
  }

  return (
    <Modal
      visible={visible}
      onClose={() => {
        if (!save.isPending) onClose();
      }}
      title={isEdit ? 'Sửa bộ sưu tập' : 'Tạo bộ sưu tập'}
    >
      <View style={styles.form}>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <TextArea
              label="Tên bộ sưu tập"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Ví dụ: IELTS cơ bản"
              minHeight={48}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <TextArea
              label="Mô tả (tuỳ chọn)"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Ghi chú ngắn"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="visibility"
          render={({ field }) => (
            <View style={styles.chipsRow}>
              <Chip
                label={COLLECTION_VISIBILITY_LABELS.PRIVATE}
                selected={field.value === Visibility.PRIVATE}
                onPress={() => field.onChange(Visibility.PRIVATE)}
              />
              <Chip
                label={COLLECTION_VISIBILITY_LABELS.PUBLIC}
                color="primary"
                selected={field.value === Visibility.PUBLIC}
                onPress={() => field.onChange(Visibility.PUBLIC)}
              />
            </View>
          )}
        />

        {save.isError ? (
          <Text variant="small" color="danger">
            {save.error?.message ?? 'Lỗi không xác định'}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Button
            title="Huỷ"
            variant="secondary"
            onPress={onClose}
            disabled={save.isPending}
          />
          <Button
            title={isEdit ? 'Lưu' : 'Tạo'}
            onPress={onSubmit}
            isLoading={formState.isSubmitting || save.isPending}
          />
        </View>
      </View>
    </Modal>
  );
}

function CollectionRow({
  item,
  onPress,
  onEdit,
  onDelete,
}: {
  item: CollectionResponse;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowBody}>
        <Text variant="bodyMedium" numberOfLines={1}>
          {item.title}
        </Text>
        {item.description ? (
          <Text variant="caption" color="muted" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.rowMeta}>
          <Chip
            label={COLLECTION_VISIBILITY_LABELS[item.visibility]}
            color={item.visibility === 'PUBLIC' ? 'primary' : 'neutral'}
            variant="outline"
          />
          <Text variant="caption" color="muted">
            {item.totalWords} từ · {formatDate(item.updatedAt)}
          </Text>
        </View>
      </View>
      <View style={styles.rowActions}>
        <IconButton name="pencil" onPress={onEdit} size="sm" />
        <IconButton name="trash" onPress={onDelete} size="sm" />
      </View>
    </Pressable>
  );
}

export function CollectionsScreen() {
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [editing, setEditing] = useState<CollectionResponse | null>(null);
  const [creating, setCreating] = useState(false);

  const queryKey = useMemo(
    () => queryKeys.collections({ q: debouncedSearch, mine: true }),
    [debouncedSearch]
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
  } = useInfinitePagination<CollectionResponse>({
    queryKey,
    fetchPage: page =>
      collectionApi.list(page, 20) as unknown as Promise<PageResponse<CollectionResponse>>,
  });

  const remove = useApiMutation({
    mutationFn: (id: string) => collectionApi.remove(id),
    toastSuccess: 'Đã xoá bộ sưu tập',
    invalidate: queryKeys.collections(),
  });

  const onDelete = useCallback(
    (id: string) => {
      remove.mutate(id, {
        onSuccess: () => refetch(),
        onError: () => toast.error('Không thể xoá bộ sưu tập'),
      });
    },
    [remove, refetch, toast]
  );

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm bộ sưu tập..."
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <ErrorState
          title="Không tải được danh sách"
          message={error?.message}
          onRetry={refetch}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Chưa có bộ sưu tập"
          message="Tạo bộ sưu tập đầu tiên để bắt đầu học."
          actionLabel="Tạo ngay"
          onAction={() => setCreating(true)}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <CollectionRow
              item={item}
              onPress={() =>
                navigation.navigate('CollectionDetail', {
                  collectionId: item.id,
                })
              }
              onEdit={() => setEditing(item)}
              onDelete={() => onDelete(item.id)}
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

      <Pressable
        accessibilityLabel="Tạo bộ sưu tập"
        onPress={() => setCreating(true)}
        style={styles.fab}
      >
        <Icon name="plus" size={22} color={theme.colors.textInverse} />
      </Pressable>

      <CollectionFormModal
        visible={creating}
        onClose={() => setCreating(false)}
        onSaved={() => refetch()}
      />
      <CollectionFormModal
        visible={editing != null}
        initial={editing ?? undefined}
        onClose={() => setEditing(null)}
        onSaved={() => refetch()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: theme.spacing.base },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: theme.spacing.base, paddingBottom: theme.spacing.xxxl * 2 },
  row: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgElevated,
    padding: theme.spacing.base,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  rowBody: { flex: 1, gap: theme.spacing.xs },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  rowActions: { alignItems: 'center', justifyContent: 'center' },
  sep: { height: theme.spacing.sm },
  footer: { padding: theme.spacing.md, alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.md,
  },
  form: { gap: theme.spacing.md },
  chipsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  actions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm },
});
