import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, ErrorState, Input, LoadingScreen, Screen, Switch, Text } from '@/components/ui';
import { useApiMutation, useApiQuery, useToast } from '@/hooks';
import { userApi } from '@/api';
import { queryKeys } from '@/lib';
import { theme } from '@/theme';
import type { NotificationSettings } from '@/types';

function isValidHHmm(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function NotificationSettingsScreen() {
  const toast = useToast();
  const remote = useApiQuery({
    key: queryKeys.notificationSettings(),
    queryFn: () => userApi.getNotificationSettings(),
  });

  const [local, setLocal] = useState<NotificationSettings | null>(null);
  const settings = local ?? remote.data ?? null;
  const isDirty = local !== null && remote.data !== null && local !== remote.data;

  const save = useApiMutation({
    mutationFn: (next: NotificationSettings) =>
      userApi.updateNotificationSettings(next),
    onSuccess: res => {
      toast.success('Đã lưu');
      setLocal(res);
    },
    onError: () => toast.error('Không lưu được'),
  });

  if (remote.isLoading) return <LoadingScreen />;
  if (remote.isError) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được cài đặt thông báo"
          message={remote.error?.message}
          onRetry={remote.refetch}
        />
      </Screen>
    );
  }

  const update = (patch: Partial<NotificationSettings>) => {
    setLocal(prev => ({ ...(prev ?? remote.data!), ...patch }));
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBlock}>
          <Text variant="h1">Thông báo</Text>
          <Text variant="caption" color="muted">
            Những cài đặt này được đồng bộ với máy chủ.
          </Text>
        </View>

        {settings ? (
          <>
            <Card style={styles.sectionCard}>
              <Row
                title="Nhắc ôn tập"
                subtitle="Báo khi có thẻ đến hạn"
                value={settings.reviewReminders}
                onValueChange={v => update({ reviewReminders: v })}
              />
              <Row
                title="Nhắc duy trì streak"
                subtitle="Báo khi streak sắp bị reset"
                value={settings.streakReminders}
                onValueChange={v => update({ streakReminders: v })}
              />
              <Row
                title="Theo dõi roleplay"
                subtitle="Nhắc khi AI gửi phản hồi mới"
                value={settings.roleplayReminders}
                onValueChange={v => update({ roleplayReminders: v })}
              />
            </Card>

            <Card style={styles.sectionCard}>
              <Text variant="overline" color="muted">
                Quiet hours
              </Text>
              <Text variant="caption" color="muted" style={styles.help}>
                Trong khoảng này, hệ thống sẽ không gửi thông báo.
              </Text>
              <View style={styles.timeRow}>
                <View style={styles.timeCol}>
                  <Input
                    label="Bắt đầu"
                    value={settings.quietHoursStart ?? ''}
                    onChangeText={value =>
                      update({ quietHoursStart: value || undefined })
                    }
                    placeholder="22:00"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <View style={styles.timeCol}>
                  <Input
                    label="Kết thúc"
                    value={settings.quietHoursEnd ?? ''}
                    onChangeText={value =>
                      update({ quietHoursEnd: value || undefined })
                    }
                    placeholder="07:00"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            </Card>

            {save.isError ? (
              <ErrorState
                title="Không lưu được"
                message={save.error?.message}
                onRetry={() => save.mutate(settings)}
              />
            ) : null}

            <Button
              title="Lưu"
              isLoading={save.isPending}
              disabled={!isDirty || save.isPending}
              onPress={() => {
                // Local validation up-front so the user gets
                // instant feedback instead of a server error.
                if (
                  (settings.quietHoursStart && !isValidHHmm(settings.quietHoursStart)) ||
                  (settings.quietHoursEnd && !isValidHHmm(settings.quietHoursEnd))
                ) {
                  toast.error('Quiet hours phải đúng định dạng HH:mm');
                  return;
                }
                save.mutate(settings);
              }}
              fullWidth
            />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Row({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text variant="bodyMedium">{title}</Text>
        <Text variant="caption" color="muted">
          {subtitle}
        </Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  heroBlock: { gap: theme.spacing.xs, marginTop: theme.spacing.md },
  sectionCard: { padding: theme.spacing.base, gap: theme.spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xs },
  rowText: { flex: 1, gap: theme.spacing.xxs },
  help: { marginTop: -theme.spacing.xxs },
  timeRow: { flexDirection: 'row', gap: theme.spacing.md },
  timeCol: { flex: 1 },
});
