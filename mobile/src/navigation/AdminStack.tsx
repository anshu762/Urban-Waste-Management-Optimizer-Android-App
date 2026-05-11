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
import AnalyticsHomeScreen from '../screens/admin/analytics/AnalyticsHomeScreen';
import DemandForecastScreen from '../screens/admin/analytics/DemandForecastScreen';
import ZoneRankingScreen from '../screens/admin/analytics/ZoneRankingScreen';
import ComplianceTrendScreen from '../screens/admin/analytics/ComplianceTrendScreen';
import InactiveResidentsScreen from '../screens/admin/analytics/InactiveResidentsScreen';
import { AdminNotificationsScreen } from '../screens/admin/AdminNotificationsScreen';
import { AdminProfileScreen } from '../screens/admin/AdminProfileScreen';

import { CustomTabBar } from '../components/navigation/CustomTabBar';

const AdminTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
    <Tab.Screen name="Complaints" component={ComplaintsScreen} options={{ title: 'Issues' }} />
    <Tab.Screen name="IoTDashboard" component={IoTDashboardScreen} options={{ title: 'IoT' }} />
    <Tab.Screen name="AnalyticsHome" component={AnalyticsHomeScreen} options={{ title: 'Insights' }} />
  </Tab.Navigator>
);

export const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AdminRoot">
    <Stack.Screen name="AdminRoot" component={AdminTabs} />
    <Stack.Screen name="ZoneManagement" component={ZoneManagementScreen} />
    <Stack.Screen name="RouteManagement" component={RouteManagementScreen} />
    <Stack.Screen name="ZoneDetail" component={ZoneDetailScreen} />
    <Stack.Screen name="AdminComplaintDetail" component={AdminComplaintDetailScreen} />
    <Stack.Screen name="VehicleManagement" component={VehicleManagementScreen} />
    <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
    <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
    <Stack.Screen name="DemandForecast" component={DemandForecastScreen} />
    <Stack.Screen name="ZoneRanking" component={ZoneRankingScreen} />
    <Stack.Screen name="ComplianceTrend" component={ComplianceTrendScreen} />
    <Stack.Screen name="InactiveResidents" component={InactiveResidentsScreen} />
    <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
  </Stack.Navigator>
);
