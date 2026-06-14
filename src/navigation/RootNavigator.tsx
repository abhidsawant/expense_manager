import React, { useContext } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SettingsContext } from '../state/ThemeContext';
import { useTheme } from '../theme/useTheme';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import HomeScreen from '../screens/home/HomeScreen';
import StatsScreen from '../screens/stats/StatsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import AddExpenseScreen from '../screens/expense/AddExpenseScreen';
import ExpenseDetailScreen from '../screens/expense/ExpenseDetailScreen';
import ManageCategoriesScreen from '../screens/settings/ManageCategoriesScreen';
import AboutScreen from '../screens/settings/AboutScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
            backgroundColor: theme.tabBar,
            borderTopColor: theme.tabBarBorder,
            borderTopWidth: 1,
            height: Platform.OS === 'android' ? 68 : undefined,
            paddingBottom: Platform.OS === 'android' ? 10 : undefined,
            paddingTop: Platform.OS === 'android' ? 6 : undefined,
          },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            Home: ['wallet', 'wallet-outline'],
            Stats: ['stats-chart', 'stats-chart-outline'],
            Settings: ['settings', 'settings-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['help', 'help-outline'];
          return <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { settings, hydrated } = useContext(SettingsContext);
  const theme = useTheme();

  if (!hydrated) return null;

  const initialRoute = settings.username ? 'Tabs' : 'Onboarding';

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Tabs" component={AppTabs} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
        <Stack.Screen name="ManageCategories" component={ManageCategoriesScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
