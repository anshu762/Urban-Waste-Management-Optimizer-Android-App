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
import { WasteLogDetailScreen } from '../screens/resident/WasteLogDetailScreen';
import { AddressSetupScreen } from '../screens/onboarding/AddressSetupScreen';
import { ProfileScreen } from '../screens/resident/ProfileScreen';

import { CustomTabBar } from '../components/navigation/CustomTabBar';

const ResidentTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
    <Tab.Screen name="PickupCalendar" component={PickupCalendarScreen} options={{ title: 'Calendar' }} />
    <Tab.Screen name="LogWaste" component={LogWasteScreen} options={{ title: 'Log' }} />
    <Tab.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'Reports' }} />
  </Tab.Navigator>
);

export const ResidentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ResidentTabs" component={ResidentTabs} />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ headerShown: true, title: 'Alerts', headerBackTitle: 'Back' }}
    />
    <Stack.Screen name="AddressSetup" component={AddressSetupScreen} options={{ headerShown: true, title: 'Update Profile & Zone' }} />
    <Stack.Screen name="ReportMissedPickup" component={ReportMissedPickupScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ headerShown: false }} />
    <Stack.Screen name="WasteLogDetail" component={WasteLogDetailScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);
