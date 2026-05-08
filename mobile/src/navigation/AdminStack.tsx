import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import { ZoneManagementScreen } from '../screens/admin/ZoneManagementScreen';
import { ZoneDetailScreen } from '../screens/admin/ZoneDetailScreen';

export const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ZoneManagement" component={ZoneManagementScreen} />
    <Stack.Screen name="ZoneDetail" component={ZoneDetailScreen} />
  </Stack.Navigator>
);
