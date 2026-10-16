import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen, PracticeScreen, ProfileScreen } from '@/screens';
import { CollectionStack } from '@/navigation/CollectionStack';
import { theme } from '@/theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { borderTopColor: theme.colors.border },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen
        name="Collections"
        component={CollectionStack}
        options={{ title: 'Bộ sưu tập' }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{ title: 'Luyện tập' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
}
