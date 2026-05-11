import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Using local IP for emulator or real device. Adjust as needed.
export const API_URL = Platform.OS === 'web' ? 'http://localhost:3000/api/v1' : 'http://10.172.225.125:3000/api/v1';

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
