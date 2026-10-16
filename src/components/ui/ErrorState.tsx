import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { theme } from '@/theme';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Đã có lỗi xảy ra',
  message = 'Vui lòng thử lại sau',
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <Text variant="h3" align="center">
        {title}
      </Text>
      <Text variant="small" color="secondary" align="center" style={styles.message}>
        {message}
      </Text>
      {onRetry ? (
        <Button title="Thử lại" onPress={onRetry} variant="secondary" size="sm" />
      ) : null}
    </View>
  );
}

interface EmptyProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyProps) {
  return (
    <View style={styles.container}>
      <Text variant="h3" align="center">
        {title}
      </Text>
      {message ? (
        <Text variant="small" color="secondary" align="center" style={styles.message}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text variant="bodyMedium" color="primary" style={styles.action}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  message: { marginTop: theme.spacing.xs },
  action: { marginTop: theme.spacing.md },
});