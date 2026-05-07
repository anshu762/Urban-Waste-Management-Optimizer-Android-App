import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import { AppButton } from '../components/common/AppButton';
import { useAuthStore } from '../stores/auth.store';

const ResidentHome = () => {
  const logout = useAuthStore((state) => state.logout);
  
  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-xl font-bold mb-6">Resident Dashboard</Text>
      <AppButton title="Logout" variant="danger" onPress={logout} />
    </View>
  );
};

export const ResidentStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ResidentHome" component={ResidentHome} options={{ title: 'Home' }} />
  </Stack.Navigator>
);
