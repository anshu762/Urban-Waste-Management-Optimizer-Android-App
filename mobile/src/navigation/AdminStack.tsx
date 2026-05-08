import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import { ZoneManagementScreen } from '../screens/admin/ZoneManagementScreen';
import { ZoneDetailScreen } from '../screens/admin/ZoneDetailScreen';
import { ComplaintsScreen } from '../screens/admin/ComplaintsScreen';
import { AdminComplaintDetailScreen } from '../screens/admin/AdminComplaintDetailScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import VehicleManagementScreen from '../screens/admin/VehicleManagementScreen';
import RouteManagementScreen from '../screens/admin/RouteManagementScreen';
import RouteDetailScreen from '../screens/admin/RouteDetailScreen';

export const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AdminDashboard">
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="ZoneManagement" component={ZoneManagementScreen} />
    <Stack.Screen name="ZoneDetail" component={ZoneDetailScreen} />
    <Stack.Screen name="Complaints" component={ComplaintsScreen} />
    <Stack.Screen name="AdminComplaintDetail" component={AdminComplaintDetailScreen} />
    <Stack.Screen name="VehicleManagement" component={VehicleManagementScreen} />
    <Stack.Screen name="RouteManagement" component={RouteManagementScreen} />
    <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
  </Stack.Navigator>
);
