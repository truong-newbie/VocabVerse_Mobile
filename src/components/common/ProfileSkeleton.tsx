import { ScrollView, StyleSheet, View } from 'react-native';
import { Card } from '@/components/ui';
import { theme } from '@/theme';

/**
 * Skeleton placeholder used while the user object + stats query
 * is in flight. A neutral pill row replaces each text block so the
 * user has a sense of progress without the contents jumping
 * around once the real data lands.
 */
export function ProfileSkeleton() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card style={styles.identityCard}>
        <View style={styles.row}>
          <View style={styles.avatar} />
          <View style={styles.identity}>
            <View style={[styles.line, { width: '60%' }]} />
            <View style={[styles.line, { width: '80%', height: 12 }]} />
            <View style={[styles.line, { width: '40%', height: 10 }]} />
          </View>
        </View>
      </Card>

      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { height: 72 }]} />
        <Card style={[styles.statCard, { height: 72 }]} />
      </View>
      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { height: 72 }]} />
        <Card style={[styles.statCard, { height: 72 }]} />
      </View>

      {[0, 1, 2, 3].map(i => (
        <Card key={i} style={styles.row}>
          <View style={[styles.line, { width: 24, height: 24, borderRadius: 12 }]} />
          <View style={{ flex: 1, gap: theme.spacing.xxs }}>
            <View style={[styles.line, { width: '50%' }]} />
            <View style={[styles.line, { width: '80%', height: 10 }]} />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md },
  identityCard: { padding: theme.spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.base },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
  },
  identity: { flex: 1, gap: theme.spacing.sm },
  line: {
    height: 16,
    borderRadius: 4,
    backgroundColor: theme.colors.surface,
  },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md },
  statCard: { flex: 1 },
});
