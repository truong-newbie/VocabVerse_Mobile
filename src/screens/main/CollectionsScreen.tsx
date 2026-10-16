import { Screen, Text } from '@/components/ui';

export function CollectionsScreen() {
  return (
    <Screen>
      <Text variant="h1">Bộ sưu tập</Text>
      <Text variant="body" color="secondary">
        Danh sách các collection của tôi và collection public.
      </Text>
    </Screen>
  );
}