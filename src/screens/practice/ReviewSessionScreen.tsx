import { Screen, Text } from '@/components/ui';
import type { PracticeStackParamList } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<PracticeStackParamList, 'ReviewSession'>;

export function ReviewSessionScreen({ route }: Props) {
  return (
    <Screen>
      <Text variant="h1">Review session</Text>
      <Text variant="body" color="secondary">
        Collection {route.params.collectionId ?? 'ALL'} — implemented in Commit 3.5.
      </Text>
    </Screen>
  );
}
