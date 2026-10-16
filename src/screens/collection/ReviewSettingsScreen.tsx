import { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, ErrorState, Input, Screen, Text } from '@/components/ui';
import { Chip, SectionHeader } from '@/components/common';
import { useApiMutation, useApiQuery, useToast } from '@/hooks';
import { collectionApi } from '@/api';
import type { CollectionReviewSettingResponse, SchedulerType } from '@/types';
import { formResolver, queryKeys, z } from '@/lib';
import { theme } from '@/theme';
import type { CollectionStackParamList } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<CollectionStackParamList, 'ReviewSettings'>;

const schema = z.object({
  enabled: z.boolean(),
  emailEnabled: z.boolean(),
  schedulerType: z.enum(['SM2', 'FSRS']),
  intervalsCsv: z.string(),
  reminderTime: z.string().optional(),
  timezone: z.string().optional(),
  fsrsDesiredRetention: z
    .union([z.literal(''), z.coerce.number().min(0.5).max(0.99)])
    .optional(),
  fsrsMaxIntervalDays: z
    .union([z.literal(''), z.coerce.number().int().positive()])
    .optional(),
});

type FormData = z.infer<typeof schema>;

function fromApi(data: CollectionReviewSettingResponse | undefined): FormData {
  return {
    enabled: data?.enabled ?? false,
    emailEnabled: data?.emailEnabled ?? false,
    schedulerType: (data?.schedulerType as SchedulerType) ?? 'SM2',
    intervalsCsv: (data?.intervals ?? [1, 3, 7, 14, 30]).join(', '),
    reminderTime: data?.reminderTime ?? '',
    timezone: data?.timezone ?? '',
    fsrsDesiredRetention:
      data?.fsrsDesiredRetention == null ? '' : data.fsrsDesiredRetention,
    fsrsMaxIntervalDays:
      data?.fsrsMaxIntervalDays == null ? '' : data.fsrsMaxIntervalDays,
  };
}

export function ReviewSettingsScreen({ route }: Props) {
  const { collectionId } = route.params;
  const toast = useToast();

  const detail = useApiQuery({
    key: queryKeys.reviewSettings(collectionId),
    queryFn: () => collectionApi.getReviewSettings(collectionId),
    retry: false,
  });

  const defaults = useMemo(() => fromApi(detail.data), [detail.data]);

  const { control, handleSubmit, reset, watch, formState } = useForm<FormData>({
    resolver: formResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const schedulerType = watch('schedulerType');
  const enabled = watch('enabled');

  const save = useApiMutation({
    mutationFn: (values: FormData) => {
      const intervals = values.intervalsCsv
        .split(',')
        .map(s => Number.parseInt(s.trim(), 10))
        .filter(n => Number.isFinite(n) && n > 0);
      return collectionApi.updateReviewSettings(collectionId, {
        enabled: values.enabled,
        emailEnabled: values.emailEnabled,
        schedulerType: values.schedulerType,
        intervals,
        reminderTime: values.reminderTime || undefined,
        timezone: values.timezone || undefined,
        fsrsDesiredRetention:
          values.schedulerType === 'FSRS' && values.fsrsDesiredRetention !== ''
            ? Number(values.fsrsDesiredRetention)
            : undefined,
        fsrsMaxIntervalDays:
          values.schedulerType === 'FSRS' && values.fsrsMaxIntervalDays !== ''
            ? Number(values.fsrsMaxIntervalDays)
            : undefined,
      });
    },
    toastSuccess: 'Đã lưu cài đặt ôn tập',
    invalidate: queryKeys.reviewSettings(collectionId),
  });

  const disable = useApiMutation({
    mutationFn: () => collectionApi.disableReviewSettings(collectionId),
    toastSuccess: 'Đã tắt ôn tập',
    invalidate: queryKeys.reviewSettings(collectionId),
    onSuccess: () => reset(fromApi(undefined)),
  });

  const resetSchedule = useApiMutation({
    mutationFn: () => collectionApi.resetReviewSettings(collectionId),
    toastSuccess: 'Đã reset tiến độ',
    invalidate: queryKeys.reviewSettings(collectionId),
  });

  const onSubmit = handleSubmit(values => {
    save.mutate(values, {
      onError: () => toast.error('Không thể lưu cài đặt'),
    });
  });

  if (detail.isLoading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  if (detail.isError && !detail.data) {
    return (
      <Screen>
        <ErrorState
          title="Chưa cấu hình ôn tập"
          message="Bật ôn tập để hệ thống nhắc bạn học đúng lịch."
          onRetry={onSubmit}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <SectionHeader
        title="Ôn tập"
        description="Cài thuật toán và lịch nhắc cho bộ sưu tập này"
      />

      <Card style={styles.card}>
        <View style={styles.row}>
          <Text variant="bodyMedium">Bật ôn tập</Text>
          <Controller
            control={control}
            name="enabled"
            render={({ field }) => (
              <Switch
                value={field.value}
                onValueChange={field.onChange}
                trackColor={{ true: theme.colors.primaryLight, false: theme.colors.border }}
              />
            )}
          />
        </View>

        <View style={styles.row}>
          <Text variant="bodyMedium">Gửi email nhắc nhở</Text>
          <Controller
            control={control}
            name="emailEnabled"
            render={({ field }) => (
              <Switch
                value={field.value}
                onValueChange={field.onChange}
                disabled={!enabled}
                trackColor={{ true: theme.colors.primaryLight, false: theme.colors.border }}
              />
            )}
          />
        </View>
      </Card>

      <SectionHeader title="Thuật toán" />
      <Controller
        control={control}
        name="schedulerType"
        render={({ field }) => (
          <View style={styles.chipsRow}>
            <Chip
              label="SM-2"
              selected={field.value === 'SM2'}
              onPress={() => field.onChange('SM2')}
            />
            <Chip
              label="FSRS"
              color="primary"
              selected={field.value === 'FSRS'}
              onPress={() => field.onChange('FSRS')}
            />
          </View>
        )}
      />

      <SectionHeader title="Khoảng cách (ngày)" description="Phân tách bằng dấu phẩy" />
      <Controller
        control={control}
        name="intervalsCsv"
        render={({ field, fieldState }) => (
          <Input
            value={field.value}
            onChangeText={field.onChange}
            placeholder="1, 3, 7, 14, 30"
            keyboardType="numbers-and-punctuation"
            error={fieldState.error?.message}
          />
        )}
      />

      {schedulerType === 'FSRS' ? (
        <>
          <SectionHeader title="FSRS" description="Chỉ áp dụng khi chọn FSRS" />
          <View style={styles.fsrsRow}>
            <Controller
              control={control}
              name="fsrsDesiredRetention"
              render={({ field, fieldState }) => (
                <Input
                  label="Tỉ lệ nhớ mong muốn (0-1)"
                  value={field.value?.toString() ?? ''}
                  onChangeText={text => field.onChange(text)}
                  keyboardType="decimal-pad"
                  error={fieldState.error?.message}
                  style={styles.flex1}
                />
              )}
            />
            <Controller
              control={control}
              name="fsrsMaxIntervalDays"
              render={({ field, fieldState }) => (
                <Input
                  label="Khoảng cách tối đa (ngày)"
                  value={field.value?.toString() ?? ''}
                  onChangeText={text => field.onChange(text)}
                  keyboardType="number-pad"
                  error={fieldState.error?.message}
                  style={styles.flex1}
                />
              )}
            />
          </View>
        </>
      ) : null}

      <SectionHeader title="Lịch" />
      <View style={styles.row}>
        <Controller
          control={control}
          name="reminderTime"
          render={({ field }) => (
            <Input
              label="Giờ nhắc (HH:mm)"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="09:00"
              style={styles.flex1}
            />
          )}
        />
        <Controller
          control={control}
          name="timezone"
          render={({ field }) => (
            <Input
              label="Múi giờ"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Asia/Ho_Chi_Minh"
              style={styles.flex1}
            />
          )}
        />
      </View>

      {save.isError ? (
        <Text variant="small" color="danger">
          {save.error?.message ?? 'Lỗi không xác định'}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          title="Lưu cài đặt"
          onPress={onSubmit}
          isLoading={formState.isSubmitting || save.isPending}
        />
        <Button
          title="Reset tiến độ"
          variant="secondary"
          onPress={() => resetSchedule.mutate()}
          isLoading={resetSchedule.isPending}
        />
        <Button
          title="Tắt ôn tập"
          variant="danger"
          onPress={() => disable.mutate()}
          isLoading={disable.isPending}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { padding: theme.spacing.base, gap: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md },
  chipsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  fsrsRow: { flexDirection: 'row', gap: theme.spacing.md },
  flex1: { flex: 1 },
  actions: { gap: theme.spacing.sm, marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl },
});
