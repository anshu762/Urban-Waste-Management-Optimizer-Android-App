import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const FALLBACK_API_URL = 'https://urban-waste-management-optimizer-android-app-production.up.railway.app/api/v1';

const getBaseUrl = () => {
  // Production builds: use URL from app.json extra.apiUrl
  const prodUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (prodUrl && !__DEV__) return prodUrl;

  // Development: read from .env (EXPO_PUBLIC_API_URL), fallback to Railway
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  return FALLBACK_API_URL;
};

export const API_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // Handle 401 Unauthorized
    if (response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      // Note: Navigation logout will be handled in the UI or a custom hook
    }

    // Manual Retry logic for network errors
    if (error.code === 'ERR_NETWORK' && !config._retry) {
      config._retry = true;
      console.log('Network error detected, retrying in 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);
