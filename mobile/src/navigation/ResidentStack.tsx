import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import { AppButton } from '../components/common/AppButton';
import { useAuthStore } from '../stores/auth.store';

import { HomeScreen } from '../screens/resident/HomeScreen';
import { PickupCalendarScreen } from '../screens/resident/PickupCalendarScreen';
import { NotificationsScreen } from '../screens/resident/NotificationsScreen';

export const ResidentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="PickupCalendar" component={PickupCalendarScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);
