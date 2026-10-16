import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, LoadingScreen, Screen, Text } from '@/components/ui';
import { StatsCard } from '@/components/common';
import { useApiMutation, useApiQuery } from '@/hooks';
import { roleplayApi } from '@/api';
import { theme } from '@/theme';
import type { PracticeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'RoleplayResult'>;
type Nav = NativeStackNavigationProp<PracticeStackParamList, 'RoleplayResult'>;

export function RoleplayResultScreen({ route }: Props) {
  const { sessionId } = route.params;
  const navigation = useNavigation<Nav>();

  const session = useApiQuery({
    key: ['roleplay', 'session', sessionId],
    queryFn: () => roleplayApi.getSession(sessionId),
  });

  const end = useApiMutation({
    mutationFn: () => roleplayApi.endSession({ sessionId }),
  });

  useEffect(() => {
    // The session is normally ended on the previous screen; this is
    // a best-effort call so the server has the final summary.
    end.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (session.isLoading) return <LoadingScreen />;
  if (session.isError) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được phiên"
          message={session.error?.message}
          onRetry={session.refetch}
        />
      </Screen>
    );
  }

  const s = session.data!;
  const userTurns = s.messages.filter(m => m.sender === 'USER').length;
  const proficiencyPct = Math.round(
    ((s.messages.filter(m => m.sender === 'AI' && m.correction).length /
      Math.max(1, userTurns)) || 0) * 100
  );

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text variant="display" align="center">
            Kết thúc phiên
          </Text>
          <Text variant="body" color="secondary" align="center">
            Bạn vừa hội thoại {userTurns} lượt với AI.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatsCard label="Lượt" value={userTurns} accent="primary" style={styles.statCard} />
          <StatsCard
            label="Điểm tạm"
            value={proficiencyPct}
            accent={proficiencyPct >= 70 ? 'success' : 'warning'}
            style={styles.statCard}
          />
        </View>

        <Card>
          <Text variant="overline" color="muted">
            Tóm tắt
          </Text>
          <Text variant="body">
            Phiên của bạn vừa được gửi tới máy chủ để phân tích. Bạn sẽ nhận được
            đánh giá chi tiết (pronunciation, grammar, vocabulary) trong tab Thống
            kê sau vài phút.
          </Text>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Về danh sách"
            onPress={() => navigation.replace('RoleplayList', undefined as any)}
            fullWidth
          />
          <Button
            title="Về luyện tập"
            variant="secondary"
            onPress={() => navigation.navigate('DueToday')}
            fullWidth
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  hero: { alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.lg },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md },
  statCard: { flex: 1 },
  actions: { gap: theme.spacing.md, marginTop: theme.spacing.lg },
});
