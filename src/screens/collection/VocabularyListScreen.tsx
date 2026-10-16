import { Screen, Text } from '@/components/ui';
import type { CollectionStackParamList } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<CollectionStackParamList, 'VocabularyList'>;

export function VocabularyListScreen({ route }: Props) {
  return (
    <Screen>
      <Text variant="h1">Vocabulary list</Text>
      <Text variant="body" color="secondary">
        Collection {route.params.collectionId} — implemented in Commit 2.5.
      </Text>
    </Screen>
  );
}
