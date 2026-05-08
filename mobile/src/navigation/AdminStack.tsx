import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import { ZoneManagementScreen } from '../screens/admin/ZoneManagementScreen';
import { ZoneDetailScreen } from '../screens/admin/ZoneDetailScreen';

export const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="ZoneManagement" component={ZoneManagementScreen} options={{ title: 'Zone Management' }} />
    <Stack.Screen name="ZoneDetail" component={ZoneDetailScreen} options={{ title: 'Zone Details' }} />
  </Stack.Navigator>
);
