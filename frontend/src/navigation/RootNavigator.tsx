import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import AuthStackNavigator from './AuthStackNavigator';
import MainTabNavigator from './MainTabNavigator';
import ProfileEditScreen from '../screens/settings/ProfileEditScreen';
import CalendarManagementScreen from '../screens/settings/CalendarManagementScreen';
import MemberInviteScreen from '../screens/settings/MemberInviteScreen';
import MemberListScreen from '../screens/settings/MemberListScreen';
import AppSettingsScreen from '../screens/settings/AppSettingsScreen';
import CategoryManagementScreen from '../screens/settings/CategoryManagementScreen';
import AssetDetailScreen from '../screens/assets/AssetDetailScreen';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isLoading, loadToken } = useAuthStore();

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="CalendarManagement" component={CalendarManagementScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="MemberInvite" component={MemberInviteScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="MemberList" component={MemberListScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="AppSettings" component={AppSettingsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="AssetDetail" component={AssetDetailScreen} options={{ animation: 'slide_from_right' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
