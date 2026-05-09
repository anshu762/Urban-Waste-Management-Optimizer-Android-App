import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { ZoneManagementScreen } from '../screens/admin/ZoneManagementScreen';
import { ZoneDetailScreen } from '../screens/admin/ZoneDetailScreen';
import { ComplaintsScreen } from '../screens/admin/ComplaintsScreen';
import { AdminComplaintDetailScreen } from '../screens/admin/AdminComplaintDetailScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import VehicleManagementScreen from '../screens/admin/VehicleManagementScreen';
import RouteManagementScreen from '../screens/admin/RouteManagementScreen';
import RouteDetailScreen from '../screens/admin/RouteDetailScreen';
import { IoTDashboardScreen } from '../screens/admin/IoTDashboardScreen';

const tabIcon = (emoji: string) => ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 18 }}>{emoji}</Text>
);

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#16a34a',
      tabBarInactiveTintColor: '#9ca3af',
    }}
  >
    <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard', tabBarIcon: tabIcon('📊') }} />
    <Tab.Screen name="ZoneManagement" component={ZoneManagementScreen} options={{ title: 'Zones', tabBarIcon: tabIcon('📍') }} />
    <Tab.Screen name="Complaints" component={ComplaintsScreen} options={{ tabBarIcon: tabIcon('⚠️') }} />
    <Tab.Screen name="RouteManagement" component={RouteManagementScreen} options={{ title: 'Route Planner', tabBarIcon: tabIcon('🗺️') }} />
    <Tab.Screen name="IoTDashboard" component={IoTDashboardScreen} options={{ title: 'IoT', tabBarIcon: tabIcon('📡') }} />
  </Tab.Navigator>
);

export const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AdminDashboard">
    <Stack.Screen name="AdminDashboard" component={AdminTabs} />
    <Stack.Screen name="ZoneDetail" component={ZoneDetailScreen} />
    <Stack.Screen name="AdminComplaintDetail" component={AdminComplaintDetailScreen} />
    <Stack.Screen name="VehicleManagement" component={VehicleManagementScreen} />
    <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
  </Stack.Navigator>
);
