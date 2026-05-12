import React, { useEffect, useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { premiumToastConfig } from './src/components/common/PremiumToast';
import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/stores/auth.store';
import { queryClient } from './src/lib/queryClient';
import { usePushNotifications } from './src/hooks/usePushNotifications';

SplashScreen.preventAutoHideAsync();

const AppBootstrap = () => {
  usePushNotifications();
  return <RootNavigator />;
};

export default function App() {
  const { loadFromStorage } = useAuthStore();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await loadFromStorage();
      await new Promise((resolve) => setTimeout(resolve, 600));
      setAppIsReady(true);
    }
    prepare();
  }, [loadFromStorage]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <AppBootstrap />
          <StatusBar style="auto" />
        </NavigationContainer>
        <Toast config={premiumToastConfig} />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
