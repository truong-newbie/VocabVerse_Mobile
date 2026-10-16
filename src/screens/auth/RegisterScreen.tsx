import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, Screen, Text } from '@/components/ui';
import { useToast } from '@/hooks';
import { useAuthStore } from '@/stores';
import { formResolver, z } from '@/lib';
import { theme } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';

const schema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
});

type FormData = z.infer<typeof schema>;

export function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const register = useAuthStore(s => s.register);
  const toast = useToast();

  const { control, handleSubmit, formState, setError } = useForm<FormData>({
    resolver: formResolver(schema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async values => {
    try {
      await register(values);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đăng ký thất bại';
      setError('root', { message: msg });
      toast.error(msg);
    }
  });

  return (
    <Screen scroll>
      <Text variant="h1" align="center" style={styles.title}>
        Tạo tài khoản
      </Text>

      <View style={styles.form}>
        <Controller
          control={control}
          name="fullName"
          render={({ field, fieldState }) => (
            <Input
              label="Họ tên"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Input
              label="Email"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Input
              label="Mật khẩu"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              secureTextEntry
              error={fieldState.error?.message}
            />
          )}
        />

        {formState.errors.root?.message ? (
          <Text variant="small" color="danger">
            {formState.errors.root.message}
          </Text>
        ) : null}

        <Button
          title="Đăng ký"
          onPress={onSubmit}
          isLoading={formState.isSubmitting}
          fullWidth
        />
        <Button
          title="Đã có tài khoản? Đăng nhập"
          onPress={() => navigation.goBack()}
          variant="ghost"
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: theme.spacing.xxl },
  form: { marginTop: theme.spacing.xl, gap: theme.spacing.md },
});
