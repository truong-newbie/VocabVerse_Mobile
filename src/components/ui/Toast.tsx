import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { useUiStore } from '@/stores/uiStore';
import { theme } from '@/theme';

const AUTO_DISMISS_MS = 3000;

const TYPE_COLORS = {
  success: { bg: theme.colors.success, label: '✓' },
  error: { bg: theme.colors.danger, label: '!' },
  info: { bg: theme.colors.info, label: 'i' },
} as const;

export function ToastHost() {
  const toast = useUiStore(s => s.toast);
  const dismiss = useUiStore(s => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast, dismiss]);

  if (!toast) return null;
  const palette = TYPE_COLORS[toast.type];

  return (
    <SafeAreaView pointerEvents="box-none" style={styles.host} edges={['top']}>
      <Pressable onPress={dismiss} style={[styles.container, { backgroundColor: palette.bg }]}>
        <View style={styles.badge}>
          <Text variant="bodyMedium" color="inverse">
            {palette.label}
          </Text>
        </View>
        <Text variant="bodyMedium" color="inverse" style={styles.message}>
          {toast.message}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: theme.spacing.base,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.md,
    ...theme.shadow.md,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: { flex: 1 },
});
