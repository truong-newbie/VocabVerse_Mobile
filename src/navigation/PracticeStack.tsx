import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  DueTodayScreen,
  HistoryScreen,
  PracticeStatsScreen,
  ReviewCompleteScreen,
  ReviewSessionScreen,
} from '@/screens/practice';
import { theme } from '@/theme';
import type { PracticeStackParamList } from './types';

const Stack = createNativeStackNavigator<PracticeStackParamList>();

export function PracticeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { color: theme.colors.textPrimary },
      }}
    >
      <Stack.Screen
        name="DueToday"
        component={DueTodayScreen}
        options={{ title: 'Luyện tập' }}
      />
      <Stack.Screen
        name="ReviewSession"
        component={ReviewSessionScreen}
        options={{ title: 'Ôn tập' }}
      />
      <Stack.Screen
        name="ReviewComplete"
        component={ReviewCompleteScreen}
        options={{ title: 'Hoàn thành', headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="PracticeStats"
        component={PracticeStatsScreen}
        options={{ title: 'Thống kê' }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Lịch sử' }}
      />
    </Stack.Navigator>
  );
}
