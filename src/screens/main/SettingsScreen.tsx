import { Screen, Text } from '@/components/ui';

export function SettingsScreen() {
  return (
    <Screen>
      <Text variant="h1">Cài đặt</Text>
      <Text variant="body" color="muted">
        Locale / theme / reminder sẽ được thêm ở Commit 5.6.
      </Text>
    </Screen>
  );
}
