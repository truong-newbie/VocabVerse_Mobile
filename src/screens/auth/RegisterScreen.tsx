import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';
import { Button, Input, Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/stores';
import { theme } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';

const schema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
});

export function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const register = useAuthStore(s => s.register);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const onSubmit = async () => {
    const result = schema.safeParse({ fullName, email, password });
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Lỗi dữ liệu');
      return;
    }
    setValidationError(null);
    setSubmitting(true);
    try {
      await register(result.data);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <Text variant="h1" align="center" style={styles.title}>
        Tạo tài khoản
      </Text>

      <View style={styles.form}>
        <Input label="Họ tên" value={fullName} onChangeText={setFullName} />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {validationError ? (
          <Text variant="small" color="danger">
            {validationError}
          </Text>
        ) : null}

        <Button
          title="Đăng ký"
          onPress={onSubmit}
          isLoading={submitting}
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