import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import DriverRoutesScreen from '../screens/driver/DriverRoutesScreen';
import DriverNotificationsScreen from '../screens/driver/DriverNotificationsScreen';
import DriverProfileScreen from '../screens/driver/DriverProfileScreen';

import { CustomTabBar } from '../components/navigation/CustomTabBar';

const DriverTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="DriverHome" component={DriverHomeScreen} options={{ title: 'Home' }} />
    <Tab.Screen name="DriverRoutes" component={DriverRoutesScreen} options={{ title: 'Routes' }} />
    <Tab.Screen name="DriverNotifications" component={DriverNotificationsScreen} options={{ title: 'Alerts' }} />
    <Tab.Screen name="DriverProfile" component={DriverProfileScreen} options={{ title: 'Profile' }} />
  </Tab.Navigator>
);

export const DriverStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="DriverRoot">
    <Stack.Screen name="DriverRoot" component={DriverTabs} />
  </Stack.Navigator>
);
