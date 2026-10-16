import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { theme } from '@/theme';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.text}>
        <Text variant="overline" color="secondary">
          {title}
        </Text>
        {description ? (
          <Text variant="caption" color="muted" style={styles.description}>
            {description}
          </Text>
        ) : null}
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  text: { flex: 1, gap: theme.spacing.xxs },
  description: { marginTop: 2 },
});
