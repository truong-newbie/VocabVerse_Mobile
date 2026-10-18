import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, ErrorState, LoadingScreen, Screen, Text } from '@/components/ui';
import { Icon, StatsCard, ProfileSkeleton } from '@/components/common';
import { useApiQuery } from '@/hooks';
import { userApi } from '@/api';
import { queryKeys } from '@/lib';
import { useAuthStore, useSettingsStore } from '@/stores';
import { formatDate, theme } from '@/theme';
import type { ProfileStackParamList } from '@/navigation/types';
import { ConfirmLogoutDialog } from './ConfirmLogoutDialog';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const resetSettings = useSettingsStore(s => s.reset);
  const [confirming, setConfirming] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const me = useApiQuery({
    key: queryKeys.user(),
    queryFn: () => userApi.getMe(),
  });

  const stats = useApiQuery({
    key: queryKeys.userStats(),
    queryFn: () => userApi.getStats(),
  });

  const goTo = useCallback(
    (screen: keyof ProfileStackParamList) => {
      navigation.navigate(screen as never);
    },
    [navigation]
  );

  const onConfirmLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      // Wipe the persisted device preferences in addition to the
      // server-side session, so the next user (or this same user
      // after a re-install) starts from defaults.
      resetSettings();
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirming(false);
    }
  }, [logout, resetSettings]);

  if (me.isLoading || stats.isLoading) {
    return <ProfileSkeleton />;
  }

  if (me.isError) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được hồ sơ"
          message={me.error?.message}
          onRetry={me.refetch}
        />
      </Screen>
    );
  }

  const s = stats.data;

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.identityCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text variant="h1" color="inverse" align="center">
                {initials(me.data?.fullName ?? user?.fullName ?? '?')}
              </Text>
            </View>
            <View style={styles.identity}>
              <Text variant="h2">{me.data?.fullName ?? user?.fullName}</Text>
              <Text variant="caption" color="muted">
                {me.data?.email ?? user?.email}
              </Text>
              <Text variant="small" color="muted">
                Tham gia: {s ? formatDate(s.joinedAt) : '—'}
              </Text>
            </View>
          </View>
        </Card>

        {s ? (
          <>
            <View style={styles.statsRow}>
              <StatsCard
                label="Bộ sưu tập"
                value={s.totalCollections}
                accent="primary"
                style={styles.statCard}
              />
              <StatsCard
                label="Từ vựng"
                value={s.totalVocabulary}
                accent="success"
                style={styles.statCard}
              />
            </View>
            <View style={styles.statsRow}>
              <StatsCard label="Lượt ôn" value={s.totalReviews} style={styles.statCard} />
              <StatsCard
                label="Streak"
                value={s.currentStreak}
                delta={`Tốt nhất: ${s.longestStreak}`}
                accent="warning"
                style={styles.statCard}
              />
            </View>
          </>
        ) : null}

        <SettingsRow
          icon="edit"
          title="Sửa hồ sơ"
          subtitle="Tên hiển thị, ảnh đại diện"
          onPress={() => goTo('EditProfile')}
        />
        <SettingsRow
          icon="lock"
          title="Đổi mật khẩu"
          subtitle="Cập nhật mật khẩu của bạn"
          onPress={() => goTo('ChangePassword')}
        />
        <SettingsRow
          icon="settings"
          title="Cài đặt"
          subtitle="Ngôn ngữ, giao diện, nhắc nhở"
          onPress={() => goTo('Settings')}
        />
        <SettingsRow
          icon="bell"
          title="Thông báo"
          subtitle="Tắt / bật nhắc nhở, quiet hours"
          onPress={() => goTo('NotificationSettings')}
        />

        <Button
          title="Đăng xuất"
          variant="danger"
          onPress={() => setConfirming(true)}
          fullWidth
        />
      </ScrollView>

      <ConfirmLogoutDialog
        visible={confirming}
        onConfirm={onConfirmLogout}
        onCancel={() => setConfirming(false)}
        isPending={loggingOut}
      />
    </Screen>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: 'edit' | 'lock' | 'settings' | 'bell';
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.row}>
        <Icon name={icon} color={theme.colors.primary} size={24} />
        <View style={styles.rowText}>
          <Text variant="bodyMedium">{title}</Text>
          <Text variant="caption" color="muted">
            {subtitle}
          </Text>
        </View>
        <Text variant="body" color="muted">
          ›
        </Text>
      </Card>
    </Pressable>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  identityCard: { padding: theme.spacing.lg },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { flex: 1, gap: theme.spacing.xxs },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md },
  statCard: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.base,
  },
  rowText: { flex: 1, gap: theme.spacing.xxs },
});
