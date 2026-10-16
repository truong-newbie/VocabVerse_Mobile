import { Screen, Text } from '@/components/ui';
import type { CollectionStackParamList } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<CollectionStackParamList, 'AiNormalize'>;

export function AiNormalizeScreen({ route }: Props) {
  return (
    <Screen>
      <Text variant="h1">AI Normalize</Text>
      <Text variant="body" color="secondary">
        {route.params?.collectionId
          ? `Collection ${route.params.collectionId}`
          : 'Toàn cục'}{' '}
        — implemented in Commit 2.8.
      </Text>
    </Screen>
  );
}
