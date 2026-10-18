import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { theme } from '@/theme';

interface SplashScreenProps {
  /**
   * Optional line shown under the app name. The RootNavigator
   * uses this to communicate the current initialization step
   * (e.g. "Đang kết nối..." vs. "Đang khôi phục phiên...").
   */
  message?: string;
}

/**
 * Full-screen splash used while the app is hydrating: pulling
 * the auth session from AsyncStorage, hydrating the settings
 * store, etc. It intentionally avoids the network and any
 * queries; the network calls happen after the navigator swaps
 * to Main.
 */
export function SplashScreen({ message }: SplashScreenProps) {
  return (
    <View style={styles.root}>
      <View style={styles.logo}>
        <Text variant="h1" color="inverse" align="center">
          VV
        </Text>
      </View>
      <Text variant="h2" align="center" style={styles.title}>
        VocabVerse
      </Text>
      <Text variant="caption" color="muted" align="center" style={styles.tagline}>
        Học từ vựng mỗi ngày
      </Text>
      <View style={styles.spinner}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
      {message ? (
        <Text variant="small" color="muted" align="center" style={styles.message}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: { marginBottom: theme.spacing.xs },
  tagline: { marginBottom: theme.spacing.xl },
  spinner: { marginTop: theme.spacing.lg },
  message: { marginTop: theme.spacing.base },
});
