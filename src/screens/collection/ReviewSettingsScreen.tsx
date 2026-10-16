import { Screen, Text } from '@/components/ui';
import type { CollectionStackParamList } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<CollectionStackParamList, 'ReviewSettings'>;

export function ReviewSettingsScreen({ route }: Props) {
  return (
    <Screen>
      <Text variant="h1">Review settings</Text>
      <Text variant="body" color="secondary">
        Collection {route.params.collectionId} — implemented in Commit 2.4.
      </Text>
    </Screen>
  );
}
