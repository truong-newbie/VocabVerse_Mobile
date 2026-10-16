import { Screen, Text } from '@/components/ui';
import type { PracticeStackParamList } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<PracticeStackParamList, 'ReviewComplete'>;

export function ReviewCompleteScreen({ route }: Props) {
  return (
    <Screen>
      <Text variant="h1">Hoàn thành!</Text>
      <Text variant="body" color="secondary">
        {route.params.totalReviewed} thẻ — implemented in Commit 3.6.
      </Text>
    </Screen>
  );
}
