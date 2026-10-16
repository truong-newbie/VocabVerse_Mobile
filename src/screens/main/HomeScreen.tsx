import { Screen, Text } from '@/components/ui';

export function HomeScreen() {
  return (
    <Screen>
      <Text variant="h1">Trang chủ</Text>
      <Text variant="body" color="secondary">
        Dashboard: tổng quan streak, dueToday, accuracy sẽ hiển thị ở đây.
      </Text>
    </Screen>
  );
}