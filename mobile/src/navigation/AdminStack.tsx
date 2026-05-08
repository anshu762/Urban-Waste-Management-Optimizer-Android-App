import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import { ZoneManagementScreen } from '../screens/admin/ZoneManagementScreen';
import { ZoneDetailScreen } from '../screens/admin/ZoneDetailScreen';
import { ComplaintsScreen } from '../screens/admin/ComplaintsScreen';
import { AdminComplaintDetailScreen } from '../screens/admin/AdminComplaintDetailScreen';

export const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="ZoneManagement" component={ZoneManagementScreen} options={{ title: 'Zone Management' }} />
    <Stack.Screen name="ZoneDetail" component={ZoneDetailScreen} options={{ title: 'Zone Details' }} />
    <Stack.Screen name="Complaints" component={ComplaintsScreen} options={{ title: 'Missed Pickups' }} />
    <Stack.Screen name="AdminComplaintDetail" component={AdminComplaintDetailScreen} options={{ title: 'Complaint Details' }} />
  </Stack.Navigator>
);
