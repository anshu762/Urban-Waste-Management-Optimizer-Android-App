import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const AdminHome = () => (
  <View className="flex-1 justify-center items-center bg-white">
    <Text className="text-xl font-bold text-red-500">Admin Dashboard</Text>
  </View>
);

export const AdminStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="AdminHome" component={AdminHome} options={{ title: 'Admin Home' }} />
  </Stack.Navigator>
);
