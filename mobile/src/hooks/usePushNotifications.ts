import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import { updatePushTokenApi } from '../api/user.api';
import { useAuthStore } from '../stores/auth.store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!isAuthenticated || !userId || !Device.isDevice) return;
    const isAndroidExpoGo = Platform.OS === 'android' && Constants.appOwnership === 'expo';
    if (isAndroidExpoGo) {
      console.log('Remote push notifications require a development build on Android. Skipping Expo Go token registration.');
      return;
    }

    let receivedSubscription: Notifications.EventSubscription | undefined;
    let isMounted = true;

    const register = async () => {
      try {
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

        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
        const tokenResponse = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
        await updatePushTokenApi(tokenResponse.data);
      } catch (error) {
        console.log('Push notification registration failed:', error);
      }
    };

    register();

    receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      Toast.show({
        type: 'success',
        text1: notification.request.content.title || 'Notification',
        text2: notification.request.content.body || '',
      });
    });

    return () => {
      isMounted = false;
      receivedSubscription?.remove();
    };
  }, [isAuthenticated, userId]);
};
