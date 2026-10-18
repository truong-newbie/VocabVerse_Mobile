import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { Button, ErrorState, Input, Screen, Text } from '@/components/ui';
import { useApiMutation, useToast } from '@/hooks';
import { userApi } from '@/api';
import { formResolver, z } from '@/lib';
import { theme } from '@/theme';
import type { ProfileStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ChangePassword'>;

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Nhập mật khẩu hiện tại'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .max(72, 'Mật khẩu tối đa 72 ký tự'),
    confirmNewPassword: z.string(),
  })
  .refine(d => d.newPassword === d.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Mật khẩu nhập lại không khớp',
  });

type FormValues = z.infer<typeof schema>;

export function ChangePasswordScreen() {
  const navigation = useNavigation<Nav>();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const submit = useApiMutation({
    mutationFn: (values: FormValues) =>
      userApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      toast.success('Đã đổi mật khẩu');
      reset();
      navigation.goBack();
    },
    onError: () => toast.error('Đổi mật khẩu thất bại'),
  });

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBlock}>
          <Text variant="h1">Đổi mật khẩu</Text>
          <Text variant="caption" color="muted">
            Sau khi đổi, các phiên đăng nhập trên thiết bị khác sẽ tự đăng xuất.
          </Text>
        </View>

        <Controller
          name="currentPassword"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Mật khẩu hiện tại"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.currentPassword?.message}
              secureTextEntry
            />
          )}
        />
        <Controller
          name="newPassword"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Mật khẩu mới"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.newPassword?.message}
              secureTextEntry
            />
          )}
        />
        <Controller
          name="confirmNewPassword"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Nhập lại mật khẩu mới"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmNewPassword?.message}
              secureTextEntry
            />
          )}
        />

        {submit.isError ? (
          <ErrorState
            title="Không đổi được"
            message={submit.error?.message}
            onRetry={() => handleSubmit(values => submit.mutate(values))()}
          />
        ) : null}

        <Button
          title="Đổi mật khẩu"
          onPress={handleSubmit(values => submit.mutate(values))}
          isLoading={isSubmitting || submit.isPending}
          disabled={isSubmitting || submit.isPending}
          fullWidth
        />
        <Button title="Hủy" variant="ghost" onPress={() => navigation.goBack()} fullWidth />
      </ScrollView>
    </Screen>
  );
}

import { Controller } from 'react-hook-form';

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md },
  heroBlock: { gap: theme.spacing.xs, marginTop: theme.spacing.md },
});
