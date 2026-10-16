import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/stores';
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
  const error = useAuthStore(s => s.error);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const onSubmit = async () => {
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Lỗi dữ liệu');
      return;
    }
    setValidationError(null);
    setSubmitting(true);
    try {
      await login(result.data);
    } catch {
      // error already in store
    } finally {
      setSubmitting(false);
    }
  };

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
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          label="Mật khẩu"
          placeholder="********"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {(validationError || error) ? (
          <Text variant="small" color="danger">
            {validationError || error}
          </Text>
        ) : null}

        <Button
          title="Đăng nhập"
          onPress={onSubmit}
          isLoading={submitting}
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