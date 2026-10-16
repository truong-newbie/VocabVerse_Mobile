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
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
});

type FormData = z.infer<typeof schema>;

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const login = useAuthStore(s => s.login);
  const toast = useToast();

  const { control, handleSubmit, formState, setError } = useForm<FormData>({
    resolver: formResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async values => {
    try {
      await login(values);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError('root', { message: msg });
      toast.error(msg);
    }
  });

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="display" align="center">
          VocabVerse
        </Text>
        <Text variant="body" color="secondary" align="center">
          Học từ vựng tiếng Anh thông minh
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Input
              label="Email"
              placeholder="you@example.com"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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
              placeholder="********"
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
          title="Đăng nhập"
          onPress={onSubmit}
          isLoading={formState.isSubmitting}
          fullWidth
        />
        <Button
          title="Tạo tài khoản mới"
          onPress={() => navigation.navigate('Register')}
          variant="ghost"
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: theme.spacing.xxl, gap: theme.spacing.sm },
  form: { marginTop: theme.spacing.xl, gap: theme.spacing.md },
});
