import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { AddressSetupScreen } from '../screens/onboarding/AddressSetupScreen';
import { useAuthStore } from '../stores/auth.store';
import { ResidentStack } from './ResidentStack';
import { AdminStack } from './AdminStack';
import { DriverStack } from './DriverStack';
import { OfflineBanner } from '../components/common/OfflineBanner';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isAuthenticated, user, onboardingComplete } = useAuthStore();
  
  const renderStack = () => {
    if (!isAuthenticated || !user) {
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      );
    }

    // If resident and hasn't completed address setup
    const isProfileComplete = !!(user.residentProfile?.zoneId);
    if (user.role === 'RESIDENT' && !onboardingComplete && !isProfileComplete) {
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AddressSetup" component={AddressSetupScreen} />
        </Stack.Navigator>
      );
    }

    // Role based navigation
    switch (user.role) {
      case 'ADMIN':
        return <AdminStack key={`admin-${user.id}`} />;
      case 'DRIVER':
        return <DriverStack key={`driver-${user.id}`} />;
      case 'RESIDENT':
        return <ResidentStack key={`resident-${user.id}-${onboardingComplete}-${isProfileComplete}`} />;
      default:
        return <ResidentStack key={`resident-${user.id}-${onboardingComplete}-${isProfileComplete}`} />;
    }
  };

  return (
    <>
      <OfflineBanner />
      {renderStack()}
    </>
  );
};
