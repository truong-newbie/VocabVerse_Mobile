import { Screen, Text } from '@/components/ui';

export function NotificationSettingsScreen() {
  return (
    <Screen>
      <Text variant="h1">Thông báo</Text>
      <Text variant="body" color="muted">
        Toggle và quiet hours sẽ được thêm ở Commit 5.7.
      </Text>
    </Screen>
  );
}
