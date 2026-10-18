import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { Button, ErrorState, Input, LoadingScreen, Screen, Text } from '@/components/ui';
import { useApiMutation, useApiQuery, useToast } from '@/hooks';
import { userApi } from '@/api';
import { formResolver, queryKeys, z } from '@/lib';
import { useAuthStore } from '@/stores';
import { theme } from '@/theme';
import type { ProfileStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;

const schema = z.object({
  fullName: z
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(80, 'Tên tối đa 80 ký tự'),
  avatarUrl: z
    .string()
    .url('Phải là URL hợp lệ')
    .or(z.literal(''))
    .optional(),
});

type FormValues = z.infer<typeof schema>;

export function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore.setState;

  const me = useApiQuery({
    key: queryKeys.user(),
    queryFn: () => userApi.getMe(),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(schema),
    defaultValues: { fullName: user?.fullName ?? '', avatarUrl: '' },
  });

  useEffect(() => {
    if (me.data) {
      reset({
        fullName: me.data.fullName,
        avatarUrl: me.data.avatarUrl ?? '',
      });
    }
  }, [me.data, reset]);

  const save = useApiMutation({
    mutationFn: (values: FormValues) =>
      userApi.updateMe({
        fullName: values.fullName.trim(),
        avatarUrl:
          values.avatarUrl && values.avatarUrl.length > 0
            ? values.avatarUrl
            : null,
      }),
    onSuccess: updated => {
      toast.success('Đã lưu hồ sơ');
      // Update the local auth copy so the bottom tab and home keep
      // showing the new name without a re-login.
      updateUser(s => ({ user: s.user ? { ...s.user, fullName: updated.fullName } : s.user }));
      navigation.goBack();
    },
    onError: () => toast.error('Không lưu được hồ sơ'),
  });

  if (me.isLoading) return <LoadingScreen />;
  if (me.isError) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được hồ sơ"
          message={me.error?.message}
          onRetry={me.refetch}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBlock}>
          <Text variant="h1">Sửa hồ sơ</Text>
          <Text variant="caption" color="muted">
            Tên hiển thị và (tuỳ chọn) link ảnh đại diện.
          </Text>
        </View>

        <Controller
          name="fullName"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Họ và tên"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.fullName?.message}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          name="avatarUrl"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Ảnh đại diện (URL, tùy chọn)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.avatarUrl?.message}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
        />

        {save.isError ? (
          <ErrorState
            title="Không lưu được"
            message={save.error?.message}
            onRetry={() => handleSubmit(values => save.mutate(values))()}
          />
        ) : null}

        <Button
          title="Lưu"
          onPress={handleSubmit(values => save.mutate(values))}
          isLoading={isSubmitting || save.isPending}
          disabled={isSubmitting || save.isPending}
          fullWidth
        />
        <Button
          title="Hủy"
          variant="ghost"
          onPress={() => navigation.goBack()}
          fullWidth
        />
      </ScrollView>
    </Screen>
  );
}

// Inline import to keep the controller calls below tidy; resolves
// to the same react-hook-form the useForm hook above is using.
import { Controller } from 'react-hook-form';

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md },
  heroBlock: { gap: theme.spacing.xs, marginTop: theme.spacing.md },
});
