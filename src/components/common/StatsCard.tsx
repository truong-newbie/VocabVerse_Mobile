import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from '@/components/ui';
import { theme } from '@/theme';

interface StatsCardProps {
  label: string;
  value: number | string;
  /** Small accent stripe color (defaults to primary). */
  accent?: 'primary' | 'success' | 'warning' | 'danger';
  /** Optional delta text (e.g. "+12%"). */
  delta?: string;
  icon?: ReactNode;
  style?: ViewStyle;
}

const accentMap: Record<NonNullable<StatsCardProps['accent']>, string> = {
  primary: theme.colors.primary,
  success: theme.colors.success,
  warning: theme.colors.warning,
  danger: theme.colors.danger,
};

export function StatsCard({
  label,
  value,
  accent = 'primary',
  delta,
  icon,
  style,
}: StatsCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.accent, { backgroundColor: accentMap[accent] }]} />
      <View style={styles.body}>
        <Text variant="overline" color="muted">
          {label}
        </Text>
        <View style={styles.valueRow}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text variant="h2">{value}</Text>
        </View>
        {delta ? (
          <Text variant="caption" color="muted">
            {delta}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    minHeight: 90,
  },
  accent: { width: 4 },
  body: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.xxs,
  },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  icon: { paddingRight: theme.spacing.xxs },
});
