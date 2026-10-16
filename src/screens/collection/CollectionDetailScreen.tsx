import { Screen, Text } from '@/components/ui';
import type { CollectionStackParamList } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<CollectionStackParamList, 'CollectionDetail'>;

export function CollectionDetailScreen({ route }: Props) {
  return (
    <Screen>
      <Text variant="h1">Collection {route.params.collectionId}</Text>
      <Text variant="body" color="secondary">
        Placeholder — implemented in Commit 2.4.
      </Text>
    </Screen>
  );
}
