import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { theme } from '@/theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  inline?: boolean;
}

export function LoadingOverlay({ visible, message, inline = false }: LoadingOverlayProps) {
  if (!visible) return null;

  if (inline) {
    return (
      <View style={styles.inline}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        {message ? (
          <Text variant="small" color="secondary">
            {message}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.absolute}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        {message ? (
          <Text variant="small" color="secondary" style={styles.message}>
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  absolute: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: theme.colors.bg,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
    minWidth: 140,
  },
  message: { textAlign: 'center' },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
});
