import { Screen, Text } from '@/components/ui';
import type { CollectionStackParamList } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<CollectionStackParamList, 'VocabularyEdit'>;

export function VocabularyEditScreen({ route }: Props) {
  return (
    <Screen>
      <Text variant="h1">
        {route.params.vocabularyId ? 'Chỉnh sửa từ' : 'Thêm từ mới'}
      </Text>
      <Text variant="body" color="secondary">
        Placeholder — implemented in Commit 2.6.
      </Text>
    </Screen>
  );
}
