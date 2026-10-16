import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AddVocabularyScreen } from '@/screens/vocabulary/AddVocabularyScreen';
import { DictionarySearchScreen } from '@/screens/vocabulary/DictionarySearchScreen';
import { AiNormalizeScreen } from '@/screens/ai/AiNormalizeScreen';
import {
  CollectionDetailScreen,
  CollectionsScreen,
  ReviewSettingsScreen,
  VocabularyDetailScreen,
  VocabularyEditScreen,
  VocabularyListScreen,
} from '@/screens/collection';
import { theme } from '@/theme';
import type { CollectionStackParamList } from './types';

const Stack = createNativeStackNavigator<CollectionStackParamList>();

export function CollectionStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { color: theme.colors.textPrimary },
      }}
    >
      <Stack.Screen
        name="Collections"
        component={CollectionsScreen}
        options={{ title: 'Bộ sưu tập' }}
      />
      <Stack.Screen
        name="CollectionDetail"
        component={CollectionDetailScreen}
        options={{ title: 'Bộ sưu tập' }}
      />
      <Stack.Screen
        name="VocabularyList"
        component={VocabularyListScreen}
        options={{ title: 'Từ vựng' }}
      />
      <Stack.Screen
        name="VocabularyDetail"
        component={VocabularyDetailScreen}
        options={{ title: 'Chi tiết từ' }}
      />
      <Stack.Screen
        name="VocabularyEdit"
        component={VocabularyEditScreen}
        options={{ title: 'Chỉnh sửa từ' }}
      />
      <Stack.Screen
        name="AddVocabulary"
        component={AddVocabularyScreen}
        options={{ title: 'Thêm từ mới' }}
      />
      <Stack.Screen
        name="ReviewSettings"
        component={ReviewSettingsScreen}
        options={{ title: 'Cài đặt ôn tập' }}
      />
      <Stack.Screen
        name="DictionarySearch"
        component={DictionarySearchScreen}
        options={{ title: 'Tra từ điển' }}
      />
      <Stack.Screen
        name="AiNormalize"
        component={AiNormalizeScreen}
        options={{ title: 'AI Normalize' }}
      />
    </Stack.Navigator>
  );
}
