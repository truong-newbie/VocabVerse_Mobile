import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { theme } from '@/theme';

interface Props {
  message?: string;
}

export function LoadingScreen({ message }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message ? (
        <Text variant="small" color="secondary" style={styles.message}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bg,
    gap: theme.spacing.md,
  },
  message: { marginTop: theme.spacing.sm },
});