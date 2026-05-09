import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { HomeScreen } from '../screens/resident/HomeScreen';
import { PickupCalendarScreen } from '../screens/resident/PickupCalendarScreen';
import { NotificationsScreen } from '../screens/resident/NotificationsScreen';
import { LogWasteScreen } from '../screens/resident/LogWasteScreen';
import { ReportMissedPickupScreen } from '../screens/resident/ReportMissedPickupScreen';
import { MyReportsScreen } from '../screens/resident/MyReportsScreen';
import { ComplaintDetailScreen } from '../screens/resident/ComplaintDetailScreen';
import { AddressSetupScreen } from '../screens/onboarding/AddressSetupScreen';
import { ProfileScreen } from '../screens/resident/ProfileScreen';

const tabIcon = (emoji: string) => ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 18 }}>{emoji}</Text>
);

const ResidentTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#16a34a',
      tabBarInactiveTintColor: '#9ca3af',
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: tabIcon('🏠') }} />
    <Tab.Screen name="PickupCalendar" component={PickupCalendarScreen} options={{ title: 'Calendar', tabBarIcon: tabIcon('📅') }} />
    <Tab.Screen name="LogWaste" component={LogWasteScreen} options={{ title: 'Log Waste', tabBarIcon: tabIcon('♻️') }} />
    <Tab.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'Reports', tabBarIcon: tabIcon('✅') }} />
    <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarIcon: tabIcon('🔔') }} />
  </Tab.Navigator>
);

export const ResidentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ResidentTabs" component={ResidentTabs} />
    <Stack.Screen name="AddressSetup" component={AddressSetupScreen} options={{ headerShown: true, title: 'Update Profile & Zone' }} />
    <Stack.Screen name="ReportMissedPickup" component={ReportMissedPickupScreen} options={{ headerShown: true, title: 'Report Missed Pickup' }} />
    <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ headerShown: true, title: 'Report Details' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Profile' }} />
  </Stack.Navigator>
);
