import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import { updatePushTokenApi } from '../api/user.api';
import { useAuthStore } from '../stores/auth.store';

export const usePushNotifications = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!isAuthenticated || !userId || !Device.isDevice) return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    const isExpoGo =
      Constants.appOwnership === 'expo' ||
      (Constants as any).executionEnvironment === 'storeClient';

    if (Platform.OS === 'android' && isExpoGo) {
      console.log('Remote push notifications require a development build on Android. Skipping Expo Go token registration.');
      return;
    }

    if (!projectId) {
      console.log('Expo projectId missing. Skipping push token registration.');
      return;
    }

    let receivedSubscription: { remove: () => void } | undefined;
    let isMounted = true;

    const register = async () => {
      try {
        const Notifications = require('expo-notifications');

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }

        const existing = await Notifications.getPermissionsAsync();
        const finalStatus = existing.status === 'granted'
          ? existing.status
          : (await Notifications.requestPermissionsAsync()).status;

        if (finalStatus !== 'granted' || !isMounted) return;

        const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
        await updatePushTokenApi(tokenResponse.data);

        receivedSubscription = Notifications.addNotificationReceivedListener((notification: any) => {
          Toast.show({
            type: 'success',
            text1: notification.request.content.title || 'Notification',
            text2: notification.request.content.body || '',
          });
        });
      } catch (error) {
        console.log('Push notification registration failed:', error);
      }
    };

    register();

    return () => {
      isMounted = false;
      receivedSubscription?.remove();
    };
  }, [isAuthenticated, userId]);
};
