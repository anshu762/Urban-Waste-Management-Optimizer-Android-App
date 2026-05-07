import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const DriverHome = () => (
  <View className="flex-1 justify-center items-center bg-white">
    <Text className="text-xl font-bold text-blue-500">Driver Dashboard</Text>
  </View>
);

export const DriverStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="DriverHome" component={DriverHome} options={{ title: 'Driver Home' }} />
  </Stack.Navigator>
);
