import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import StatisticsScreen from '../screens/statistics/StatisticsScreen';
import AssetsScreen from '../screens/assets/AssetsScreen';
import type { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TABS = {
  calendar: { label: '캘린더', icon: 'calendar-outline' },
  statistics: { label: '통계', icon: 'trending-up-outline' },
  assets: { label: '자산', icon: 'wallet-outline' },
} as const;

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { height: 80, paddingBottom: 20, paddingTop: 8, borderTopColor: '#E5E7EB' },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: TABS.calendar.label,
          tabBarIcon: ({ color, size }) => <Icon name={TABS.calendar.icon} size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          tabBarLabel: TABS.statistics.label,
          tabBarIcon: ({ color, size }) => <Icon name={TABS.statistics.icon} size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Assets"
        component={AssetsScreen}
        options={{
          tabBarLabel: TABS.assets.label,
          tabBarIcon: ({ color, size }) => <Icon name={TABS.assets.icon} size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
