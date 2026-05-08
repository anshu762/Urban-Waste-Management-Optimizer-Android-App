import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import { AppButton } from '../components/common/AppButton';
import { useAuthStore } from '../stores/auth.store';

import { HomeScreen } from '../screens/resident/HomeScreen';
import { PickupCalendarScreen } from '../screens/resident/PickupCalendarScreen';
import { NotificationsScreen } from '../screens/resident/NotificationsScreen';
import { LogWasteScreen } from '../screens/resident/LogWasteScreen';
import { ReportMissedPickupScreen } from '../screens/resident/ReportMissedPickupScreen';
import { MyReportsScreen } from '../screens/resident/MyReportsScreen';
import { ComplaintDetailScreen } from '../screens/resident/ComplaintDetailScreen';
import { AddressSetupScreen } from '../screens/onboarding/AddressSetupScreen';

export const ResidentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="PickupCalendar" component={PickupCalendarScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="AddressSetup" component={AddressSetupScreen} options={{ headerShown: true, title: 'Update Profile & Zone' }} />
    <Stack.Screen name="LogWaste" component={LogWasteScreen} options={{ headerShown: true, title: 'Log Waste' }} />
    <Stack.Screen name="ReportMissedPickup" component={ReportMissedPickupScreen} options={{ headerShown: true, title: 'Report Missed Pickup' }} />
    <Stack.Screen name="MyReports" component={MyReportsScreen} options={{ headerShown: true, title: 'My Reports' }} />
    <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ headerShown: true, title: 'Report Details' }} />
  </Stack.Navigator>
);
