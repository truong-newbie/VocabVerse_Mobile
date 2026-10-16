import { Screen, Text } from '@/components/ui';
import type { CollectionStackParamList } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<CollectionStackParamList, 'AddVocabulary'>;

export function AddVocabularyScreen({ route }: Props) {
  return (
    <Screen>
      <Text variant="h1">Thêm từ vựng</Text>
      <Text variant="body" color="secondary">
        Collection {route.params.collectionId} — implemented in Commit 2.6.
      </Text>
    </Screen>
  );
}
