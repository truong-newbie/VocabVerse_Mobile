import { Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui';

export function ProfileScreen() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  return (
    <Screen>
      <Text variant="h1">Hồ sơ</Text>
      <Text variant="body">{user?.fullName}</Text>
      <Text variant="small" color="secondary">
        {user?.email}
      </Text>
      <Button title="Đăng xuất" variant="danger" onPress={logout} fullWidth />
    </Screen>
  );
}